# Hermes Project Webapp

Chris Park의 Hermes Agent Team, OBD, AX 리서치와 Design DNA를 하나의 제품 표면으로 연결하는 GitHub Pages 기반 웹앱입니다.

- **Repository:** https://github.com/woongs2021/Hermes-project-webapp
- **Live Pages:** https://woongs2021.github.io/Hermes-project-webapp/
- **High-resolution originals:** https://github.com/woongs2021/Hermes-project-assets/releases
- **Related private backup:** `Hermes-project-backup`

## Product intent

이 웹앱은 단순 대시보드가 아니라 Chris의 리서치, 시각 레퍼런스, 디자인 판단, 에이전트 협업을 탐색 가능한 작업 시스템으로 정리합니다.

- **Team:** Karina와 전문 에이전트의 역할·협업·검증 흐름
- **Personal AX:** OBD Map, Research, Visual Archive를 통한 개인 지식/탐색 흐름
- **Corporate AX:** Chris Archive와 Design DNA를 바탕으로 한 브랜드·디자인 시스템화
- **Weekly:** 주간 후보, 검증 신호, 축적 현황의 짧은 점검

시각 톤은 과장된 AI 스타트업 미감보다 차분하고 인간적인 editorial/product surface를 목표로 합니다.

## Architecture

```text
Hermes-project-webapp
├── august-dashboard/              # Vite + React source and local display previews
├── august-dashboard-safe-sources/ # public-safe source documents
├── webapp-build-loop/             # implementation/data planning feed
└── .github/workflows/pages.yml    # Pages build and deploy

Hermes-project-assets
└── GitHub Releases                # 4K/HQ downloadable originals only
```

### Asset contract

| Need | Location | Manifest field |
| --- | --- | --- |
| UI code, metadata, thumbnail, display-ready WebP preview | `Hermes-project-webapp` | `imageSrc`, `previewImageSrc` |
| 4K/HQ original download | `Hermes-project-assets` GitHub Release | `downloadSrc` |

The current asset batch is [**`design-dna-2026-10`**](https://github.com/woongs2021/Hermes-project-assets/releases/tag/design-dna-2026-10). It holds **84 verified 4K/HQ originals**. The webapp manifest preserves local previews and points downloads to its versioned Release URLs.

> New high-resolution originals must not be committed to this Pages repository. Upload the original to a public-safe Release first, keep/generate a local preview, then connect the two in the manifest.

## Delivery phases and implemented state

### Phase 1 — Foundation and public-safe delivery

**Implemented**

- Vite + React application under `august-dashboard/`
- GitHub Pages build/deploy workflow with base path `/Hermes-project-webapp/`
- curated public-safe export boundary; no credentials, runtime databases, raw conversations, private prompts, logs, caches, `node_modules/`, or build output
- manifest/data validation before production builds

### Phase 2 — Information architecture and responsive product shell

**Implemented**

- Four top-level contexts: Team, Personal AX, Corporate AX, Weekly
- body-local child navigation: Personal AX → OBD Map / Research / Visual Archive; Corporate AX → Chris Archive / Design DNA
- text-led, low-noise navigation and responsive desktop/tablet/mobile layouts
- interaction and layout QA for tabs, modal behavior, loading states, overflow, and GitHub Pages path handling

### Phase 3 — Research, archive, and Design DNA surfaces

**Implemented**

- Research Board backed by validated public research data; cards separate evidence-first summaries from AX/OBD/design-leadership interpretation
- Chris Archive with visual reference thumbnails, detail modal, Karina observations, and design-system extraction candidates
- Design DNA / Midjourney + Mockup collections with manifest-backed assets and downloadable original links
- Visual Archive and Home visual data flows for selected public-facing materials

### Phase 4 — High-resolution asset externalization

**Implemented — `design-dna-2026-10`**

- manifest-derived inventory of 84 4K/HQ assets, including byte size, SHA-256, release filename, and manifest references
- originals uploaded to `Hermes-project-assets` Release rather than serving from Pages
- all 84 `imageSrc` values use local WebP previews; all 84 `downloadSrc` values use verified Release URLs
- provenance metadata added to migrated items: `sourceAssetStore`, `sourceAssetRelease`, `assetTier`
- Release URLs, preview URLs, data validation, lint, production build, Pages deployment, and live manifest were verified before cleanup

**Current cleanup state**

- The Release is the download source of truth for these 84 originals.
- Their tracked copies are removed from the current webapp tree after Release/manifest verification.
- Git history is intentionally unchanged. History rewrite/force push is a separate, explicitly approved maintenance operation.

## Development

```bash
cd august-dashboard
npm ci
npm run validate:data
npm run lint
npm run build:public
npm run preview
```

## Deployment and verification

Pushes to `main` run the Pages workflow:

```text
npm ci → npm run build → upload dist → deploy GitHub Pages
```

Before reporting a public update as complete, verify:

- data validation, lint, production build, and `git diff --check`
- GitHub Actions deployment success
- live manifest/content, not only the pushed source
- a representative local preview (`image/*`) and external download URL (`200`)
- desktop, tablet, and mobile UI behavior when UI code changes

## Operational boundaries

### Allowed here

- public-safe React/Vite code and data
- thumbnails and display-ready previews
- curated metadata, design rationale, selected visual assets
- manifest links to public Release downloads

### Never commit here

- 4K/HQ originals after the externalization contract
- secrets, keys, OAuth/auth stores, session databases, private transcripts, raw logs, private prompts, rejected drafts
- generated dependency/build/cache directories

## Next implementation direction

1. Add future Go Youn-jung and Midjourney originals through the Release-first asset contract.
2. Continue accumulating Chris Archive analyses into explicit `DESIGN_SYSTEM.md` principles and selected Design DNA outputs.
3. Expand relationship-aware navigation across questions, research, visual evidence, and design decisions while keeping public data curated and privacy-safe.
