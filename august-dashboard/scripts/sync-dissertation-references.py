#!/usr/bin/env python3
"""Build the public Dissertation References manifest from an approved handoff.

This program is deliberately a file transformer only: it does not invoke git,
network clients, build tools, or deployment tools.  New papers can enter only
through a separately reviewed JSONL handoff with publicSafe=true and a GO
validation status.  The canonical candidate pool is used only to resolve and
cross-check the source metadata named by that handoff.

Usage (dry-run is the default):
  python3 scripts/sync-dissertation-references.py \
    --candidate-pool /path/all-research-items.jsonl \
    --approved-handoff /path/dissertation-public-approved.jsonl \
    --base-manifest public/data/dissertation-references.json \
    --output public/data/dissertation-references.json --check

Pass --write only after review.  --check exits non-zero if a write would change
output, making it suitable for a publisher/CI gate.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from collections import Counter
from pathlib import Path
from typing import Any

CATEGORIES = frozenset(("educator", "learner", "portfolio"))
REQUIRED_HANDOFF = frozenset((
    "publicSafe", "validationStatus", "approvedBy", "approvedAt", "categories",
    "fitRationaleKo", "candidate",))
DOI_RE = re.compile(r"(?:doi:\s*|https?://(?:dx\.)?doi\.org/)?(10\.\d{4,9}/[-._;()/:a-z0-9]+)", re.I)
SPACE_RE = re.compile(r"\s+")


class ValidationError(ValueError):
    pass


def text(value: Any) -> str:
    return value.strip() if isinstance(value, str) else ""


def normalize(value: Any) -> str:
    return "".join(ch.lower() for ch in text(value) if ch.isalnum())


def canonical_doi(value: Any) -> str:
    match = DOI_RE.search(text(value))
    return match.group(1).lower().rstrip(".,;)") if match else ""


def candidate_title(row: dict[str, Any]) -> str:
    return text(row.get("title_en") or row.get("title") or row.get("original_title") or row.get("title_original"))


def candidate_year(row: dict[str, Any]) -> str:
    year = text(row.get("year"))
    if year:
        return year[:4]
    match = re.search(r"\b(19|20)\d{2}\b", text(row.get("publication_date") or row.get("venue_date") or row.get("source_date")))
    return match.group(0) if match else ""


def candidate_authors(row: dict[str, Any]) -> str:
    authors = row.get("authors")
    if isinstance(authors, list):
        return " ".join(str(item) for item in authors)
    return text(authors)


def candidate_doi(row: dict[str, Any]) -> str:
    return canonical_doi(row.get("stable_id")) or canonical_doi(row.get("url_or_id") or row.get("source_url") or row.get("url") or row.get("source_url_or_id"))


def fingerprint(title: str, authors: str, year: str) -> str:
    # Deliberately not a publication identifier; this is the final dedupe fallback.
    return "|".join((normalize(title), normalize(authors), normalize(year)))


def source_keys(row: dict[str, Any]) -> set[str]:
    keys = set()
    stable = text(row.get("stable_id"))
    if stable:
        keys.add("stable:" + normalize(stable))
    doi = candidate_doi(row)
    if doi:
        keys.add("doi:" + doi)
    title = candidate_title(row)
    authors = candidate_authors(row)
    year = candidate_year(row)
    title_author_year = fingerprint(title, authors, year)
    if title and authors and year:
        keys.add("tay:" + title_author_year)
    return keys


def read_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValidationError(f"Cannot read JSON {path}: {exc}") from exc


def read_jsonl(path: Path, label: str) -> list[dict[str, Any]]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
    except OSError as exc:
        raise ValidationError(f"Cannot read {label} {path}: {exc}") from exc
    rows = []
    for line_no, line in enumerate(lines, 1):
        if not line.strip():
            continue
        try:
            item = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValidationError(f"{label} line {line_no} is not JSON: {exc}") from exc
        if not isinstance(item, dict):
            raise ValidationError(f"{label} line {line_no} must be an object")
        item["_line"] = line_no
        rows.append(item)
    return rows


def resolve_candidate(selector: dict[str, Any], candidates: list[dict[str, Any]], handoff_line: int) -> dict[str, Any]:
    if not isinstance(selector, dict):
        raise ValidationError(f"handoff line {handoff_line}: candidate must be an object")
    line = selector.get("candidatePoolLine")
    if not isinstance(line, int) or line < 1 or line > len(candidates):
        raise ValidationError(f"handoff line {handoff_line}: candidatePoolLine must name an existing 1-based pool row")
    row = candidates[line - 1]
    supplied = text(selector.get("sourceFingerprint"))
    actual = fingerprint(candidate_title(row), candidate_authors(row), candidate_year(row))
    if not supplied or supplied != actual:
        raise ValidationError(f"handoff line {handoff_line}: sourceFingerprint does not exactly match canonical pool row {line}")
    stable = text(selector.get("stableId"))
    if stable and normalize(stable) != normalize(row.get("stable_id")):
        raise ValidationError(f"handoff line {handoff_line}: stableId does not match canonical pool row {line}")
    return row


def require_handoff(item: dict[str, Any], candidates: list[dict[str, Any]]) -> dict[str, Any]:
    line = item["_line"]
    missing = sorted(key for key in REQUIRED_HANDOFF if key not in item)
    if missing:
        raise ValidationError(f"handoff line {line}: missing required fields: {', '.join(missing)}")
    if item["publicSafe"] is not True:
        raise ValidationError(f"handoff line {line}: publicSafe must be literal true")
    if text(item["validationStatus"]).upper() != "GO":
        raise ValidationError(f"handoff line {line}: validationStatus must be GO")
    if not text(item["approvedBy"]) or not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z", text(item["approvedAt"])):
        raise ValidationError(f"handoff line {line}: approvedBy and UTC approvedAt are required")
    categories = item["categories"]
    if not isinstance(categories, list) or not categories or not all(isinstance(category, str) for category in categories):
        raise ValidationError(f"handoff line {line}: categories must be a non-empty string array")
    unknown = set(categories) - CATEGORIES
    if unknown or len(set(categories)) != len(categories):
        raise ValidationError(f"handoff line {line}: categories must be unique values from {sorted(CATEGORIES)}")
    if not text(item["fitRationaleKo"]):
        raise ValidationError(f"handoff line {line}: fitRationaleKo is required")
    row = resolve_candidate(item["candidate"], candidates, line)
    title = candidate_title(row)
    if not title:
        raise ValidationError(f"handoff line {line}: selected pool row has no title")
    return row


def public_record(item: dict[str, Any], row: dict[str, Any]) -> dict[str, Any]:
    title, authors, year = candidate_title(row), candidate_authors(row), candidate_year(row)
    if not (text(row.get("stable_id")) or candidate_doi(row) or (title and authors and year)):
        raise ValidationError(f"handoff line {item['_line']}: source needs stable_id, DOI, or title+authors+year")
    reference_id = text(row.get("stable_id")) or ("doi:" + candidate_doi(row) if candidate_doi(row) else "ref:" + hashlib.sha256(fingerprint(title, authors, year).encode()).hexdigest()[:20])
    url = text(row.get("source_url") or row.get("url") or row.get("url_or_id") or row.get("source_url_or_id"))
    if not url:
        raise ValidationError(f"handoff line {item['_line']}: selected pool row has no public source URL or DOI")
    record: dict[str, Any] = {
        "referenceId": reference_id,
        # Retained for the current dashboard UI; categories is authoritative for counts.
        "ideaFit": "educator" if "educator" in item["categories"] else "learner",
        "categories": sorted(item["categories"]),
        "titleEn": title,
        "titleKo": text(row.get("title_ko") or row.get("korean_title") or row.get("source_title_ko")),
        "urlOrDoi": url,
        "verificationStatus": "GO",
        "fitRationaleKo": text(item["fitRationaleKo"]),
        "publicSafe": True,
        # Review provenance and candidate-pool selectors are internal workflow
        # metadata.  They remain in the approved handoff, never in this public
        # manifest.
    }
    if authors:
        record["authors"] = authors
    if year:
        record["year"] = year
    for field, pool_field in (("sourceAccess", "source_access"), ("evidenceBoundary", "evidence_boundary")):
        value = text(row.get(pool_field))
        if value:
            record[field] = value
    if text(item.get("top10Rank")):
        if not isinstance(item["top10Rank"], int) or item["top10Rank"] < 1:
            raise ValidationError(f"handoff line {item['_line']}: top10Rank must be a positive integer")
        record["top10Rank"] = item["top10Rank"]
    return record


def legacy_record(raw: dict[str, Any]) -> dict[str, Any]:
    """Normalize existing public rows without promoting their historic review state."""
    result = dict(raw)
    old_fit = text(result.get("ideaFit", ""))
    result["categories"] = sorted(set(result.get("categories") or ([old_fit] if old_fit in CATEGORIES else [])))
    if not result["categories"]:
        raise ValidationError("base manifest contains a record without a recognized category")
    result["ideaFit"] = old_fit if old_fit in ("educator", "learner") else ("educator" if "educator" in result["categories"] else "learner")
    return result


def dedupe(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    accepted: list[dict[str, Any]] = []
    seen: set[str] = set()
    for record in records:
        keys = source_keys({
            "stable_id": record.get("referenceId"), "url_or_id": record.get("urlOrDoi"),
            "title_en": record.get("titleEn"), "authors": record.get("authors"), "year": record.get("year"),
        })
        if not keys:
            raise ValidationError(f"record {record.get('referenceId', '<unknown>')} has no stable ID, DOI, or title+author+year key")
        if seen.intersection(keys):
            continue
        seen.update(keys)
        accepted.append(record)
    return accepted


def build(base: dict[str, Any], handoff: list[dict[str, Any]], candidates: list[dict[str, Any]]) -> dict[str, Any]:
    existing = base.get("allRelevantReferences")
    if not isinstance(existing, list):
        raise ValidationError("base manifest must contain allRelevantReferences array")
    additions = [public_record(item, require_handoff(item, candidates)) for item in handoff]
    # Approved handoff data wins on an identity collision, allowing a reviewer to
    # replace an already-public legacy row without admitting unreviewed pool data.
    records = dedupe(additions + [legacy_record(row) for row in existing])
    # Stable ordering avoids churn when handoff lines are reordered.
    records.sort(key=lambda record: (record.get("top10Rank") is None, record.get("top10Rank", 10**9), normalize(record.get("titleEn")), text(record.get("referenceId"))))
    top10 = [record for record in records if isinstance(record.get("top10Rank"), int)]
    ranks = [record["top10Rank"] for record in top10]
    if ranks and (len(ranks) != len(set(ranks)) or sorted(ranks) != list(range(1, len(ranks) + 1))):
        raise ValidationError("top10Rank values must be unique and contiguous from 1")
    counts = {
        "allRelevant": len(records),
        "educatorAssistant": sum("educator" in record["categories"] for record in records),
        "learnerAgent": sum("learner" in record["categories"] for record in records),
        "aiPortfolio": sum("portfolio" in record["categories"] for record in records),
        "top10": len(top10),
    }
    output = {key: value for key, value in base.items() if key not in ("counts", "top10", "allRelevantReferences")}
    output["version"] = max(2, int(base.get("version", 1)))
    output["counts"] = counts
    output["top10"] = top10
    output["allRelevantReferences"] = records
    return output


def write_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as temp:
        temp.write(content)
        temp_name = temp.name
    os.replace(temp_name, path)


def self_test() -> None:
    candidate = {"title_en": "A Paper", "authors": ["Ada"], "year": "2026", "stable_id": "doi:10.1000/test", "source_url": "https://doi.org/10.1000/test"}
    approved = {"_line": 1, "publicSafe": True, "validationStatus": "GO", "approvedBy": "reviewer", "approvedAt": "2026-01-01T00:00:00Z", "categories": ["educator", "portfolio"], "fitRationaleKo": "검토 완료", "candidate": {"candidatePoolLine": 1, "sourceFingerprint": fingerprint("A Paper", "Ada", "2026"), "stableId": "doi:10.1000/test"}}
    result = build({"version": 1, "allRelevantReferences": []}, [approved, approved], [candidate])
    assert result["counts"] == {"allRelevant": 1, "educatorAssistant": 1, "learnerAgent": 0, "aiPortfolio": 1, "top10": 0}
    try:
        bad = dict(approved); bad["publicSafe"] = False
        require_handoff(bad, [candidate])
    except ValidationError:
        pass
    else:
        raise AssertionError("unsafe handoff unexpectedly accepted")
    print("self-test passed: approval gate, stable-ID dedupe, and all four counts")


def main() -> int:
    parser = argparse.ArgumentParser(description="Safely sync Dissertation References data; never deploys.")
    parser.add_argument("--candidate-pool", type=Path)
    parser.add_argument("--approved-handoff", type=Path)
    parser.add_argument("--base-manifest", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--write", action="store_true", help="atomically write --output; default is dry-run")
    parser.add_argument("--check", action="store_true", help="exit 1 when generated output differs from --output")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test(); return 0
    if not all((args.candidate_pool, args.approved_handoff, args.base_manifest, args.output)):
        parser.error("--candidate-pool, --approved-handoff, --base-manifest, and --output are required")
    result = build(read_json(args.base_manifest), read_jsonl(args.approved_handoff, "approved handoff"), read_jsonl(args.candidate_pool, "candidate pool"))
    rendered = json.dumps(result, ensure_ascii=False, indent=2) + "\n"
    current = args.output.read_text(encoding="utf-8") if args.output.exists() else ""
    changed = current != rendered
    print(json.dumps({"wouldChange": changed, "counts": result["counts"], "records": len(result["allRelevantReferences"])}, ensure_ascii=False))
    if args.check and changed:
        return 1
    if args.write and changed:
        write_atomic(args.output, rendered)
        print(f"wrote {args.output}")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ValidationError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(2)
