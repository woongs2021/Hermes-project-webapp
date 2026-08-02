# Hermes Project Webapp

Chris Park의 Hermes/OBD 작업을 웹에서 볼 수 있도록 구성한 **webapp repository**입니다. Faker가 구현/프로토타이핑 관점에서 다루고, Karina가 전체 운영 맥락과 GitHub 백업 흐름을 조율합니다.

- Repository: `https://github.com/woongs2021/Hermes-project-webapp`
- GitHub Pages: `https://woongs2021.github.io/Hermes-project-webapp/`
- Related backup repo: `https://github.com/woongs2021/Hermes-project-backup`

## 프로젝트 목적

이 웹앱은 Chris가 Hermes agent team으로 축적하는 research, visual, growth, OBD/ontology-business-design 흐름을 점차 하나의 product surface로 정리하기 위한 기반입니다.

핵심 의도:

- Hermes를 단순 챗봇이 아니라 **Harness / Loop / Graph Engineering** 기반의 작업 시스템으로 설명합니다.
- daily/weekly loop에서 생기는 data, question, visual, decision을 웹앱에서 탐색 가능한 형태로 쌓습니다.
- Chris의 디자인 리더십, OBD 관점, AI/AX job-shift research, visual archive를 연결합니다.
- “AI티 나는 스타트업 UI”가 아니라, calm, premium, editorial, bento/SaaS-like dashboard 톤을 유지합니다.

## 현재 구성

```text
.
├── august-dashboard/              # Vite + React dashboard source
├── august-dashboard-safe-sources/ # public-safe dashboard source documents
├── webapp-build-loop/             # Faker webapp planning/data loop export
├── .github/workflows/pages.yml    # GitHub Pages deployment
├── scripts/scan_export_safety.py  # curated export safety scan
└── README.md
```

### `august-dashboard/`

현재 배포되는 Vite/React 앱입니다.

주요 특징:

- Vite base: `/Hermes-project-webapp/`
- GitHub Pages에서 asset path가 깨지지 않도록 구성
- public dashboard manifest를 빌드 전에 검증/생성
- source data는 `august-dashboard-safe-sources/dashboard-documents.json`에서 생성

주요 명령:

```bash
cd august-dashboard
npm ci
npm run build
npm run preview
```

### `webapp-build-loop/`

Faker가 향후 웹앱 구현에 사용할 planning/data feed입니다.

포함되는 방향:

- IA/routes/component 후보
- graph-engineering / why-Hermes framing
- daily implementation notes
- image-gallery data/assets
- HomeVisualHero current pointer
- visual archive tab 후보 데이터

### `image-gallery` / `HomeVisualHero`

Go Youn-jung daily visual loop의 최종 승인 이미지가 Faker webapp feed로 들어옵니다.

현재 운영 규칙:

- Go Youn-jung visual loop는 daily 2 images 기준입니다.
- 7-day rolling window 안에서 color/metaphor가 반복되지 않게 조정합니다.
- 최종본만 webapp feed에 들어갑니다.
- pending/rejected/private prompt는 public webapp feed에 넣지 않습니다.
- exact prompts는 기본적으로 숨기고, Chris가 별도로 요청할 때만 공유합니다.

## GitHub Pages 배포

이 repo는 GitHub Actions로 Pages에 배포됩니다.

Workflow:

```text
push to main
→ npm ci
→ npm run build
→ upload august-dashboard/dist
→ deploy to GitHub Pages
```

배포 URL:

```text
https://woongs2021.github.io/Hermes-project-webapp/
```

현재 확인된 상태:

- Branch: `webapp-pages-20260802`
- Main 반영 완료
- Pages workflow 성공 확인
- URL HTTP 200 확인

## 안전/공개 범위

이 repo는 웹앱용이지만, 여전히 curated export 기준으로 관리합니다.

포함 가능:

- public-safe dashboard source
- generated manifest
- webapp source code
- public-facing image-gallery assets/metadata
- Chris가 웹앱에 쓰기로 허용한 visual/story/data 구조

포함 금지:

- `.env`, `.env.*`
- OAuth/auth store, token, credential
- Hermes session DB, raw transcript, raw DM dump
- gateway logs, request dumps
- private prompt, pending review manifest, rejected drafts
- `node_modules/`, `dist/`, cache folders

push 전 확인:

```bash
python3 scripts/scan_export_safety.py .
```

## 향후 계획

현재까지 계획된 방향:

1. **Home / Project intro**
   - Hermes를 “the harness”로 설명
   - Chris의 OBD/AI design operating system으로 포지셔닝
   - Go Youn-jung final visual set을 `HomeVisualHero`로 사용

2. **Visual Archive**
   - Pinterest-like masonry cards
   - 이미지 클릭 시 rationale drawer/modal
   - title, theme, metaphor, why, model, date, agent 표시
   - exact prompt는 hidden by default

3. **Research / Paper intelligence**
   - Yuna + Go Youn-jung daily 3+3 research의 축적 데이터
   - Friday Muyeol best-3 validation
   - Karina final synthesis와 연결

4. **Growth / SNS loop**
   - Son의 growth question / SNS subscriber experiment 흐름
   - source tags, reason, OBD/productization notes를 dashboard data로 전환

5. **Harness / Loop / Graph Engineering**
   - 처음에는 file-based `nodes.jsonl` / `edges.jsonl` MVP
   - 이후 필요하면 KuzuDB/Neo4j 같은 graph DB로 확장
   - Chris의 작업, 에이전트, 질문, 논문, 이미지, 결정의 관계를 탐색 가능하게 구성

## 백업/업데이트 방식

이 repo 업데이트도 자동 루프가 아닙니다.

Chris가 적절한 시점에 “지금 백업해줘”라고 명령하면:

1. curated export를 다시 생성합니다.
2. safety scan을 통과시킵니다.
3. 새 branch를 만듭니다.
4. GitHub에 branch push합니다.
5. main에 fast-forward merge합니다.
6. Pages workflow와 URL을 확인합니다.

## 현재 상태

- Initial webapp branch: `webapp-pages-20260802`
- Main 반영 완료
- Latest known commit: `9ad7b5a`
- Pages URL: `https://woongs2021.github.io/Hermes-project-webapp/`
