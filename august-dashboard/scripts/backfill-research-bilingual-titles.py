#!/usr/bin/env python3
"""Normalize research JSONL records to canonical English and Korean title fields.

This migration preserves existing source text, adds `title_en` and `title_ko` when
missing, and uses Google Translate's public endpoint only for a missing language.
It keeps a local cache so interrupted runs do not repeat completed translations.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

DEFAULT_SOURCE = Path('/opt/data/agent-team-work-log/paper-candidates/all-research-items.jsonl')
DEFAULT_CACHE = Path('/opt/data/agent-team-work-log/paper-candidates/title-translation-cache.json')
ALLOWED_LANES = {'yuna', 'goyounjung'}
HANGUL = re.compile(r'[가-힣]')


def text(value: object) -> str | None:
    return value.strip() if isinstance(value, str) and value.strip() else None


def has_hangul(value: str | None) -> bool:
    return bool(value and HANGUL.search(value))


def split_bilingual(value: str) -> tuple[str | None, str | None]:
    """Return (english, korean) when a legacy title visibly contains both."""
    for delimiter in (' / ', ' — ', ' – '):
        parts = [part.strip() for part in value.split(delimiter) if part.strip()]
        korean = next((part for part in parts if has_hangul(part)), None)
        english = next((part for part in parts if not has_hangul(part)), None)
        if korean and english:
            return english, korean

    match = re.match(r'^(?P<first>.+?)\s*\((?P<second>[^()]*)\)\s*$', value)
    if match:
        first, second = match.group('first').strip(), match.group('second').strip()
        if has_hangul(first) and not has_hangul(second):
            return second, first
        if not has_hangul(first) and has_hangul(second):
            return first, second
    return None, None


def clean_title(value: str) -> str:
    """Remove source-index affordances that are not part of a publication title."""
    return re.sub(r'\s+(?:(?:원문보기|KCI|인용)\s*)+$', '', value, flags=re.IGNORECASE).strip()


def candidates(record: dict) -> tuple[str | None, str | None]:
    values = [
        clean_title(value)
        for key in ('title_en', 'title_ko', 'korean_title', 'original_title', 'title_original', 'title')
        if (value := text(record.get(key)))
    ]

    # A legacy `title` can contain both languages. Resolve that pair before
    # choosing a single-language value, otherwise a Korean field may retain
    # an English duplicate after a slash.
    pairs = [split_bilingual(value) for value in values]
    english = next((pair[0] for pair in pairs if pair[0]), None)
    korean = next((pair[1] for pair in pairs if pair[1]), None)
    english = english or next((value for value in values if not has_hangul(value)), None)
    korean = korean or next((value for value in values if has_hangul(value)), None)
    return english, korean


def load_cache(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    data = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(data, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in data.items()):
        raise ValueError(f'Invalid translation cache: {path}')
    return data


def save_cache(path: Path, cache: dict[str, str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(cache, ensure_ascii=False, indent=2, sort_keys=True) + '\n', encoding='utf-8')
    temp.replace(path)


def translate(value: str, source: str, target: str, cache: dict[str, str]) -> str:
    key = f'{source}>{target}:{value}'
    if key in cache:
        return cache[key]
    query = urlencode({'client': 'gtx', 'sl': source, 'tl': target, 'dt': 't', 'q': value})
    request = Request(
        f'https://translate.googleapis.com/translate_a/single?{query}',
        headers={'User-Agent': 'Hermes research title normalization/1.0'},
    )
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            with urlopen(request, timeout=30) as response:
                payload = json.load(response)
            translated = ''.join(part[0] for part in payload[0] if part and part[0]).strip()
            if not translated:
                raise ValueError('empty translation response')
            cache[key] = translated
            return translated
        except Exception as error:  # network/API faults are retried; missing data is never invented
            last_error = error
            time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f'Translation failed for {value!r}: {last_error}')


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, default=DEFAULT_SOURCE)
    parser.add_argument('--cache', type=Path, default=DEFAULT_CACHE)
    parser.add_argument('--apply', action='store_true', help='Write normalized JSONL; otherwise inspect only.')
    parser.add_argument('--all-records', action='store_true', help='Also normalize records outside public Yuna/Go Youn-jung lanes.')
    args = parser.parse_args()

    records = [json.loads(line) for line in args.source.read_text(encoding='utf-8').splitlines() if line.strip()]
    cache = load_cache(args.cache)
    eligible = 0
    translated_en = 0
    translated_ko = 0

    for record in records:
        lane = record.get('lane') or record.get('owner') or record.get('agent')
        if not args.all_records and lane not in ALLOWED_LANES:
            continue
        eligible += 1
        english, korean = candidates(record)
        if not english and not korean:
            raise ValueError(f'No usable title found for record dated {record.get("date_kst") or record.get("date")}')
        if not english:
            assert korean is not None
            english = translate(korean, 'ko', 'en', cache)
            translated_en += 1
        if not korean:
            assert english is not None
            korean = translate(english, 'auto', 'ko', cache)
            translated_ko += 1
        record['title_en'] = english
        record['title_ko'] = korean
        time.sleep(0.08)

    save_cache(args.cache, cache)
    missing = [record for record in records if (args.all_records or (record.get('lane') or record.get('owner') or record.get('agent')) in ALLOWED_LANES) and (not text(record.get('title_en')) or not text(record.get('title_ko')))]
    if missing:
        raise ValueError(f'{len(missing)} records still lack canonical bilingual titles')

    if args.apply:
        backup = args.source.with_suffix(args.source.suffix + '.pre-bilingual-backfill.bak')
        if not backup.exists():
            backup.write_text(args.source.read_text(encoding='utf-8'), encoding='utf-8')
        temp = args.source.with_suffix(args.source.suffix + '.tmp')
        temp.write_text('\n'.join(json.dumps(record, ensure_ascii=False) for record in records) + '\n', encoding='utf-8')
        temp.replace(args.source)

    print(json.dumps({
        'records_total': len(records),
        'records_normalized': eligible,
        'translated_to_english': translated_en,
        'translated_to_korean': translated_ko,
        'cache_entries': len(cache),
        'applied': args.apply,
    }, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
