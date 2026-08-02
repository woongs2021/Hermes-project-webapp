# Chris Hermes Project Webapp

Faker-built webapp/dashboard source and curated public-facing data for Chris’s Hermes/OBD/August dashboard work.

## Backup safety
- This repository is produced from a curated allowlist export.
- Do not copy `.env`, OAuth/auth stores, session DBs, gateway logs, raw DMs, or credential pools.
- Before each push, run `python scripts/scan_export_safety.py .`.
- Start private on GitHub; decide public visibility separately later.

## GitHub Pages
- Webapp repo: `https://github.com/woongs2021/Hermes-project-webapp`
- Pages URL after the first successful workflow run: `https://woongs2021.github.io/Hermes-project-webapp/`
- The Vite app uses `base: /Hermes-project-webapp/` so assets resolve correctly under GitHub Pages.
