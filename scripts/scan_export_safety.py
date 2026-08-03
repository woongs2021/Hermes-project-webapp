#!/usr/bin/env python3
from __future__ import annotations

import fnmatch
import json
import re
import sys
from pathlib import Path

TEXT_EXTS = {
    '.md', '.txt', '.json', '.jsonl', '.ts', '.tsx', '.js', '.mjs', '.css', '.html',
    '.svg', '.yaml', '.yml', '.toml', '.lock', '.gitignore', '.example', '.py'
}
SECRET_PATTERNS = [
    re.compile(r'(?i)(api[_-]?key|access[_-]?token|refresh[_-]?token|bot[_-]?token|oauth|secret|password)\s*[:=]\s*["\']?[^"\'\s]{12,}'),
    re.compile(r'(?i)(TELEGRAM|SLACK|OPENAI|ANTHROPIC|OPENROUTER|GITHUB|GEMINI|GOOGLE|HIGGSFIELD|MINIMAX|ELEVENLABS)[A-Z0-9_]*\s*[:=]\s*["\']?[^"\'\s]{12,}'),
    re.compile(r'xox[baprs]-[A-Za-z0-9-]{20,}'),
    re.compile(r'\b[0-9]{8,}:[A-Za-z0-9_-]{30,}\b'),
    re.compile(r'gh[pousr]_[A-Za-z0-9_]{30,}'),
    re.compile(r'sk-[A-Za-z0-9_-]{20,}'),
]
EXCLUDE_NAMES = {
    '.git', '.env', '.env.local', '.env.production', '.env.development', 'auth.json',
    'state.db', 'state.db-shm', 'state.db-wal', 'node_modules', '__pycache__', '.pytest_cache',
    '.mypy_cache', '.ruff_cache', '.DS_Store', '.cache', 'logs', 'sessions', 'audio_cache', '.archive',
    'dist',
}
EXCLUDE_GLOBS = [
    '*.pem', '*.key', '*.crt', '*.p12', '*.sqlite', '*.db', '*.log', '*.bak', '*.tmp',
    '*token*', '*credential*', '*credentials*', '*auth*', '*.telegram-status.txt',
    'send_*telegram*.py', '*telegram-dm.txt',
]


def excluded(path: Path, root: Path) -> bool:
    rel = path.relative_to(root)
    if set(rel.parts) & EXCLUDE_NAMES:
        return True
    name = path.name
    rel_posix = rel.as_posix()
    return any(fnmatch.fnmatch(name, pat) or fnmatch.fnmatch(rel_posix, pat) for pat in EXCLUDE_GLOBS)


def scan_for_secrets(repo: Path) -> list[dict[str, str]]:
    findings: list[dict[str, str]] = []
    for path in repo.rglob('*'):
        if not path.is_file():
            continue
        rel = path.relative_to(repo)
        if '.git' in rel.parts:
            continue
        if rel.as_posix() == 'scripts/scan_export_safety.py':
            continue
        if excluded(path, repo):
            continue
        if path.suffix.lower() not in TEXT_EXTS and path.name != '.gitignore':
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            continue
        for i, line in enumerate(text.splitlines(), 1):
            lower = line.lower()
            if any(marker in lower for marker in ['placeholder', 'replace_me', '<your_', 'example only']):
                continue
            for pattern in SECRET_PATTERNS:
                if pattern.search(line):
                    findings.append({'path': rel.as_posix(), 'pattern': pattern.pattern[:60], 'line': str(i)})
                    break
    return findings


if __name__ == '__main__':
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')
    findings = scan_for_secrets(target)
    if findings:
        print(json.dumps({'status': 'blocked', 'findings': findings}, ensure_ascii=False, indent=2))
        raise SystemExit(2)
    print(json.dumps({'status': 'clean', 'repo': str(target)}, ensure_ascii=False, indent=2))
