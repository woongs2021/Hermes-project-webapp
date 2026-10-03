#!/usr/bin/env python3
"""Remaster Midjourney DNA archive items to Kling 4K PNG and update manifest.

Typical use after adding/replacing Midjourney items in public/data/midjourney-dna-archive.json:

  python3 scripts/remaster_midjourney_4k.py --missing
  python3 scripts/remaster_midjourney_4k.py --ids 2026-09-26-midjourney-01-capsule-pattern-translation
  python3 scripts/remaster_midjourney_4k.py --numbers 24 25

The script:
- uses each item's originalImageSrc when present, otherwise imageSrc, as Kling reference
- requests kling-image-v3_0_omni at img_resolution=4k, aspect_ratio=auto
- downloads the structured urlWithoutWatermark/url_without_watermark result, not CLI upload URLs
- requires output max dimension >= 4096 before manifest update
- writes public 4K PNGs under public/assets/dna-archive/midjourney-4k/<created>/
- updates highRes* manifest fields while preserving originalImageSrc
"""
from __future__ import annotations

from pathlib import Path
import argparse
import datetime as dt
import hashlib
import json
import os
import re
import struct
import subprocess
import sys
import time
import urllib.request

WEB = Path(__file__).resolve().parents[1]
MANIFEST = WEB / "public/data/midjourney-dna-archive.json"
PUBLIC_ROOT = WEB / "public/assets/dna-archive/midjourney-4k"
LOCAL_ROOT = Path("/opt/data/dna-archive/midjourney-4k")
RUN_LOG = LOCAL_ROOT / "latest-kling4k-remaster-run.json"
MODEL = "kling-image-v3_0_omni"


def png_or_jpg_dims(path: Path) -> list[int] | None:
    try:
        data = path.read_bytes()
        if data.startswith(b"\x89PNG\r\n\x1a\n"):
            return list(struct.unpack(">II", data[16:24]))
        if data.startswith(b"\xff\xd8"):
            index = 2
            while index < len(data) - 9:
                if data[index] != 0xFF:
                    index += 1
                    continue
                marker = data[index + 1]
                index += 2
                if marker in (0xD8, 0xD9):
                    continue
                length = int.from_bytes(data[index:index + 2], "big")
                if 0xC0 <= marker <= 0xC3:
                    height = int.from_bytes(data[index + 3:index + 5], "big")
                    width = int.from_bytes(data[index + 5:index + 7], "big")
                    return [width, height]
                index += length
    except Exception:
        return None
    return None


def stable_slug(text: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9가-힣_-]+", "-", text).strip("-").lower()
    return slug or "midjourney-asset"


def item_number(item: dict, fallback: int) -> int:
    match = re.search(r"Midjourney\s+(\d+)", item.get("title", ""), re.I)
    return int(match.group(1)) if match else fallback


def result_url_from_kling(raw: str) -> str | None:
    """Extract actual generated result URL; avoid upload/reference URLs in CLI logs."""
    try:
        json_part = raw.split("\n\n[kling]")[0]
        payload = json.loads(json_part)
        for generation in payload.get("body", {}).get("generations", []):
            works = (generation.get("result") or {}).get("works") or []
            for work in works:
                for key in ("urlWithoutWatermark", "url_without_watermark", "url"):
                    url = work.get(key)
                    if url and url.startswith("http"):
                        return url
    except Exception:
        pass
    return None


def download(url: str, output: Path) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=300) as response:
        data = response.read()
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(data)
    return data


def make_output_paths(item: dict, index: int) -> tuple[Path, Path, Path]:
    created = item.get("created") or dt.date.today().isoformat()
    number = item_number(item, index)
    src_ref = item.get("originalImageSrc") or item.get("imageSrc")
    src_stem = Path(src_ref).stem if src_ref else stable_slug(item.get("title", "midjourney"))
    filename = f"{number:02d}_{src_stem}_kling4k.png"
    public_path = PUBLIC_ROOT / created / filename
    local_path = LOCAL_ROOT / created / filename
    raw_path = LOCAL_ROOT / created / f"{number:02d}_{src_stem}_kling4k_raw.json.txt"
    return public_path, local_path, raw_path


def source_path(item: dict) -> Path:
    src = item.get("originalImageSrc") or item.get("imageSrc")
    if not src:
        raise ValueError(f"Item has no imageSrc: {item.get('id')}")
    return WEB / "public" / src.lstrip("/")


def run_kling(src: Path, raw_path: Path) -> str:
    prompt = (
        "Remaster image 1 into a true 4K high-resolution PNG while preserving the original image as closely as possible. "
        "Keep the exact composition, crop, colors, shapes, flat graphic style, texture, and overall design intent. "
        "Do not add text, letters, numbers, logo, watermark, UI, objects, people, or new decorative elements. "
        "Do not redesign or reinterpret. Only increase clarity, edge quality, texture fidelity, and print/mockup readiness."
    )
    command = [
        "kling", "image_to_image",
        "--image", str(src),
        "--model", MODEL,
        "--img_resolution", "4k",
        "--aspect_ratio", "auto",
        "--imageCount", "1",
        "--poll", "900",
        prompt,
    ]
    env = os.environ.copy()
    env["PATH"] = "/opt/data/.npm-global/bin:" + env.get("PATH", "")
    env["HOME"] = "/opt/data"
    proc = subprocess.run(command, text=True, capture_output=True, cwd=str(WEB), env=env, timeout=1200)
    raw = (proc.stdout or "") + "\n" + (proc.stderr or "")
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path.write_text(raw)
    if proc.returncode != 0:
        raise RuntimeError(f"kling failed with {proc.returncode}: {raw_path}")
    return raw


def remaster_item(item: dict, index: int, force: bool = False) -> dict:
    public_path, local_path, raw_path = make_output_paths(item, index)
    existing_dims = png_or_jpg_dims(public_path) if public_path.exists() else None
    if existing_dims and max(existing_dims) >= 4096 and not force:
        data = public_path.read_bytes()
        status = "skipped_existing_4k"
    else:
        src = source_path(item)
        if not src.exists():
            raise FileNotFoundError(src)
        print(f"REMASTER {item.get('title', item.get('id'))}", flush=True)
        raw = run_kling(src, raw_path)
        url = result_url_from_kling(raw)
        if not url:
            raise RuntimeError(f"No generated result URL in {raw_path}")
        data = download(url, local_path)
        public_path.parent.mkdir(parents=True, exist_ok=True)
        public_path.write_bytes(data)
        status = "ok_4k"
    dims = png_or_jpg_dims(public_path)
    if not dims or max(dims) < 4096:
        raise RuntimeError(f"Expected 4K output for {item.get('id')}, got {dims}: {public_path}")
    rel = "/" + str(public_path.relative_to(WEB / "public"))
    item.setdefault("originalImageSrc", item["imageSrc"])
    item["highResImageSrc"] = rel
    item["highResDownloadLabel"] = "Kling 4K remaster PNG"
    item["highResWidth"] = dims[0]
    item["highResHeight"] = dims[1]
    item["highResAssetHash"] = hashlib.sha256(data).hexdigest()
    item["highResSourceTool"] = f"Kling image_to_image / {MODEL}"
    item["highResRemasteredAt"] = dt.datetime.now(dt.timezone(dt.timedelta(hours=9))).isoformat(timespec="seconds")
    return {
        "id": item.get("id"),
        "title": item.get("title"),
        "status": status,
        "highResImageSrc": rel,
        "dimensions": dims,
        "bytes": len(data),
    }


def select_items(items: list[dict], args: argparse.Namespace) -> list[tuple[int, dict]]:
    selected: list[tuple[int, dict]] = []
    ids = set(args.ids or [])
    numbers = set(args.numbers or [])
    for index, item in enumerate(items, start=1):
        number = item_number(item, index)
        if args.all:
            selected.append((index, item))
        elif args.missing and not item.get("highResImageSrc"):
            selected.append((index, item))
        elif item.get("id") in ids or number in numbers:
            selected.append((index, item))
    return selected


def main() -> int:
    parser = argparse.ArgumentParser(description="Kling 4K remaster Midjourney DNA archive items.")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--missing", action="store_true", help="remaster items without highResImageSrc")
    group.add_argument("--all", action="store_true", help="remaster all Midjourney items")
    group.add_argument("--ids", nargs="+", help="remaster specific manifest IDs")
    group.add_argument("--numbers", nargs="+", type=int, help="remaster specific Midjourney numbers")
    parser.add_argument("--force", action="store_true", help="regenerate even if a 4K public file already exists")
    parser.add_argument("--dry-run", action="store_true", help="print selected items without calling Kling")
    args = parser.parse_args()

    manifest = json.loads(MANIFEST.read_text())
    selected = select_items(manifest["items"], args)
    print(json.dumps({"selected": len(selected), "items": [item.get("title") for _, item in selected]}, ensure_ascii=False, indent=2))
    if args.dry_run:
        return 0
    if not selected:
        return 0

    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    LOCAL_ROOT.mkdir(parents=True, exist_ok=True)
    results = []
    for index, item in selected:
        result = remaster_item(item, index, force=args.force)
        results.append(result)
        RUN_LOG.write_text(json.dumps({"updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "results": results}, ensure_ascii=False, indent=2))

    manifest["generatedAt"] = dt.datetime.now(dt.timezone(dt.timedelta(hours=9))).isoformat(timespec="seconds")
    manifest["sourcePolicy"] = (
        "Public-safe manually supplied Midjourney outputs selected by Chris for Design DNA. "
        "Midjourney items include Kling 4K remaster PNG downloads when highResImageSrc is present. "
        "Excludes raw private chats, credentials, and provider account details."
    )
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"updated": len(results), "results": results}, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
