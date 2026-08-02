# 2026-08-01 Hermes/OBD 웹앱 Phase 개발 계획

작성: Karina  
입력: Faker 7월 planning-only 루프, Go Youn-jung 홈 시각 피드, Son 성장/SNS 루프, Yuna/Go Youn-jung 논문 후보, Muyeol 검증/가드레일  
상태: **개발 승인 전 계획서**  
핵심 원칙: **Chris 컨펌 전에는 코딩 시작하지 않음**

---

## 1. Executive Summary

이 문서는 7월 동안 Faker가 축적한 Hermes/OBD 웹앱 구조 후보를 8월 이후 실제 개발 가능한 단계로 바꾼 계획서다. 단, 이 문서는 **개발 시작 지시가 아니라 승인 요청용 계획**이다.

Faker의 판단은 “10개 phase가 가장 적당하다”는 쪽이다. 너무 작게 쪼개면 Chris가 전체 구조를 승인하기 어렵고, 너무 크게 잡으면 Faker가 매일 조금씩 구현하기 어렵다. 그래서 각 phase는 명확한 목표와 수용 기준을 갖고, 각 phase 안에는 30–90분 단위의 작은 daily coding task를 둔다.

이번 웹앱의 목표는 단순 대시보드가 아니라 Chris의 Hermes/OBD 성장 시스템을 제품적으로 설명하고 운영하는 것이다. 핵심 설명은 반드시 세 층으로 분리한다.

- **Harness**: 에이전트 팀과 Hermes 도구·크론·파일·권한·라우팅을 안전하게 묶는 실행 기반.
- **Loop**: 리서치, 성장 질문, 시각 생성, 웹앱 계획, 검증이 반복되는 리듬.
- **Graph Engineering**: 루프 산출물을 `Agent`, `ResearchItem`, `Theme`, `Insight`, `GrowthQuestion`, `Artifact`, `Decision`, `RiskReview` 같은 노드와 `SUPPORTS`, `TRANSLATED_INTO`, `VALIDATED_BY`, `FEEDS` 같은 관계로 바꾸는 구조.

초기 그래프 MVP는 Chris가 별도 승인하기 전까지 KuzuDB/Neo4j로 바로 가지 않고, 파일 기반 `nodes.jsonl`, `edges.jsonl`, `schema.md`로 시작한다.

---

## 2. No-code-before-approval rule

- 7월 말까지 Faker는 계획만 준비한다는 Chris의 지시가 있었다.
- 2026-08-01 이 작업은 phase-by-phase 개발 계획서를 만드는 작업이다.
- 이 계획서 생성 과정에서 앱 repo 생성, 코드 구현, build, deploy, cron 추가는 하지 않는다.
- 실제 코딩은 Chris가 이 문서를 보고 repo/workdir, 공개/비공개 경계, 배포 방식, phase 순서, daily coding rhythm을 확인한 뒤 시작한다.

**Chris 컨펌 전에는 코딩 시작하지 않음.**

---

## 3. Product Goal

제품 목표는 **Chris를 위한 Hermes/OBD growth webapp/dashboard**다.

이 웹앱은 다음을 돕는다.

1. Chris가 Hermes 에이전트 팀을 어떻게 운영하는지 설명한다.
2. 매일/매주 쌓이는 연구, 성장 질문, 시각 아티팩트, 검증, 결정의 흐름을 보여준다.
3. 공개 가능한 narrative와 비공개 운영 데이터를 분리한다.
4. OBD/Ontology Business Designer 관점에서 Chris의 판단 구조가 어떻게 성장하는지 누적한다.
5. 이후 SNS, 홈페이지, 위키, 대시보드, 그래프 DB로 확장 가능한 안전한 데이터 계약을 만든다.

---

## 4. Project Framing: Harness / Loop / Graph Engineering

### 4.1 Harness / 하네스

Harness는 이 프로젝트의 안전한 실행 기반이다. Hermes 자체가 Chris의 에이전트 팀, 도구 실행, 크론, 파일 축적, 라우팅, 권한, public/private 경계를 묶는 하네스 역할을 한다.

포함 요소:

- Karina/default 단일 프런트도어와 전문 에이전트 라우팅.
- Yuna, Go Youn-jung, Son, Faker, Muyeol의 역할 분리.
- Hermes tools, cron, local files, session search, Slack/Telegram gateway.
- 작업 로그와 로컬 데이터 루프.
- 공개/비공개/admin visibility boundary.
- Chris 승인 전 구현 금지, prompt hidden, raw log/token/private ID 비노출 규칙.

웹앱 표현:

- 홈 또는 `/graph`의 “Hermes as Harness” 설명 카드.
- `/agents` 또는 dashboard card의 agent role boundary.
- admin/private 영역의 운영 상태와 권한 경계 설명.

### 4.2 Loop / 루프

Loop는 반복적으로 근거, 질문, 시각물, 판단, 검증이 쌓이는 리듬이다. 웹앱은 날짜별 로그를 그대로 붙이는 것이 아니라 루프의 의미를 읽기 쉽게 큐레이션해야 한다.

주요 루프:

- Yuna: AI/AX, LLM, paper, agent technology research.
- Go Youn-jung: UX/design research, daily graphics, HomeVisualHero source.
- Son: 성장 질문, SNS/subscriber framing, OBD/business interpretation.
- Faker: webapp structure planning, data contract, implementation 후보.
- Muyeol: validation, governance, privacy/risk review.
- Karina: orchestration, Chris-facing synthesis, final decision framing.

웹앱 표현:

- `/research`: weekly/daily research and paper archive.
- `/growth`: Son growth question, SNS experiment, Chris answer summary.
- `/visuals`: Go Youn-jung visual archive.
- `/dashboard`: loop status, validation status, source freshness.

### 4.3 Graph Engineering / 그래프 엔지니어링

Graph Engineering은 루프 산출물을 단순 Markdown/JSONL 로그가 아니라 관계형 지식 구조로 바꾸는 설계다.

초기 node types:

- `Agent`
- `ResearchItem`
- `Theme`
- `Insight`
- `GrowthQuestion`
- `Artifact`
- `Decision`
- `RiskReview`

초기 relation types:

- `FOUND`
- `SUPPORTS`
- `INTERPRETED_AS`
- `TRANSLATED_INTO`
- `VALIDATED_BY`
- `HAS_RISK`
- `APPROVED_BY`
- `FEEDS`
- `BELONGS_TO_THEME`

초기 예시 흐름:

```text
Agent → ResearchItem → Insight → GrowthQuestion → RiskReview → Decision → Artifact
```

첫 MVP 원칙:

- force-directed network보다 카드와 relation breadcrumb를 먼저 만든다.
- Chris가 “이 인사이트가 어디서 와서 무엇으로 이어졌는지”를 읽을 수 있게 한다.
- 공개 UI에는 polish된 narrative만 노출한다.
- private/admin UI에는 source refs, validation status, risk flags를 둘 수 있지만 raw logs, tokens, private IDs, exact prompt는 기본 숨김이다.
- Chris가 명시 승인하기 전까지 KuzuDB/Neo4j가 아니라 파일 기반 `nodes.jsonl`, `edges.jsonl`, `schema.md`로 시작한다.

---

## 5. Source / Data Inventory and Public-Private Boundary

### 5.1 확인된 주요 입력 소스

| 소스 | 용도 | 기본 공개 등급 | 메모 |
|---|---|---:|---|
| `/opt/data/hermes-webapp-build-loop/SCHEMA.md` | 루프 스키마, Harness/Loop/Graph 정의 | public-safe 요약 가능 | 경로 자체는 admin 문서에서만 |
| `/opt/data/hermes-webapp-build-loop/candidates/*.md` | IA, 데이터 모델, 그래프, 홈 화면, 구현 후보 | public-safe로 재작성 후 가능 | planning note 그대로 노출 금지 |
| `/opt/data/hermes-webapp-build-loop/events.jsonl` | 일일 구조 이벤트 | private/admin | public에는 요약 카드만 |
| `/opt/data/hermes-webapp-build-loop/daily/*.md` | Faker 일일 계획 브리프 | private/admin | raw log처럼 보이지 않게 큐레이션 필요 |
| `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json` | HomeVisualHero canonical source | 일부 public 가능 | title/theme/metaphor/why/asset만 공개 후보 |
| `/opt/data/hermes-webapp-build-loop/data/image-gallery/items.jsonl` | Visual archive feed | 일부 public 가능 | prompt/source/private fields 숨김 |
| `/opt/data/hermes-webapp-build-loop/assets/image-gallery/` | 이미지 에셋 | public 가능 후보 | 배포 시 asset copy/allowlist 필요 |
| `/opt/data/hermes-growth-sns-loop/` | Son 성장 질문, SNS 실험, OBD 신호 | public-safe 재작성 후 가능 | Chris 답변/민감 맥락은 private |
| `/opt/data/agent-team-work-log/paper-candidates/` | research/paper selected data | public-safe 가능 | DOI/URL/제목/검증 상태 중심 |
| `/opt/data/agent-team-work-log/faker/` | 구현 계획 근거 | private/admin | progress/handoff만 큐레이션 |
| `/opt/data/agent-team-work-log/karina/` | orchestration decisions | private/admin | 외부 공개 금지에 가깝게 처리 |
| `/opt/data/agent-team-work-log/visuals/daily-graphics/` | Go Youn-jung visual production notes | private/admin + 일부 public | exact prompt는 기본 숨김 |

### 5.2 공개 가능 후보

- 프로젝트 한 줄 설명.
- Harness / Loop / Graph Engineering 3단 narrative.
- 에이전트 역할의 public-safe 요약.
- 논문/리서치 제목, 링크, source confidence, Chris relevance 요약.
- Go Youn-jung final image의 title, theme, metaphor, polish된 `왜 이 이미지인가`, 공개용 asset.
- Son 성장 질문/SNS 실험의 추상화된 insight, 개인 식별자 없는 실험 가설.
- Muyeol 검증 상태의 공개 안전 라벨: `GO`, `WATCH`, `HOLD`와 짧은 caution.

### 5.3 비공개/admin 전용

- raw Slack/Telegram 대화.
- bot token, OAuth/API key, credential처럼 보이는 문자열.
- 원시 private ID, chat ID, message ID.
- exact prompt와 private prompt bundle path.
- 내부 source path의 무제한 노출.
- Chris의 민감 답변 원문.
- 검증되지 않은 성과 주장, follower/subscriber 실제 지표의 개인/계정 식별 정보.

---

## 6. 10-Phase Development Plan

### Phase 0. Scope Lock & Repo/Deployment Decision

**Goal**  
코딩 시작 전, 개발 장소와 공개 범위, 배포 방향, 첫 화면 우선순위를 잠근다.

**Build scope**  
아직 앱 구현 없음. 결정 문서와 개발 규칙만 확정한다.

**Inputs**  
Faker 7월 planning notes, Karina orchestration rule, Chris approval.

**Acceptance criteria**

- repo/workdir이 명확하다.
- public/private/admin boundary가 승인된다.
- deployment target이 정해진다.
- 첫 화면 우선순위가 정해진다.
- 파일 기반 Graph MVP 여부가 승인된다.
- **Chris 컨펌 전에는 코딩 시작하지 않음**이 유지된다.

**Risks / dependencies**

- repo/workdir 미확정 시 구현 task가 흩어진다.
- 공개 범위 미확정 시 raw/private data 노출 리스크가 생긴다.

**Owner / handoff**

- Owner: Karina + Faker.
- Handoff: Chris 승인 후 Faker가 Phase 1 daily task로 이동.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 0-1 | repo/workdir 확인 문서와 구현 시작 체크리스트 | 선택된 repo의 `README` 또는 `/docs/scope-lock.md` | Chris 승인 항목이 체크리스트로 보인다 | 파일 readback, checklist 확인 | 데이터 인벤토리 task로 넘김 |
| 0-2 | public/private/admin boundary 초안 | `/docs/privacy-boundary.md` | 공개 가능/비공개/admin 필드가 분리됨 | 금지 항목 검색: token/private ID/raw log 없음 | 데이터 소스별 matrix 작성으로 넘김 |
| 0-3 | phase order와 daily rhythm 기록 | `/docs/development-rhythm.md` | 30분/1시간/주말 집중 중 선택값이 기록됨 | 문서 readback | Phase 1 일정 산정 |

---

### Phase 1. Data Inventory & Privacy Boundary

**Goal**  
웹앱이 읽을 데이터와 절대 노출하지 않을 데이터를 구분한다.

**Build scope**

- local source inventory.
- field-level visibility matrix.
- `pending`, `final`, `archived`, `admin_only` status rule.

**Inputs**

- `/opt/data/hermes-webapp-build-loop/`
- `/opt/data/hermes-growth-sns-loop/`
- `/opt/data/agent-team-work-log/paper-candidates/`
- Go Youn-jung final/current visual set.
- Faker and Karina work logs.

**Acceptance criteria**

- public/private/admin field matrix가 존재한다.
- prompt, raw logs, private IDs, credentials 금지 규칙이 명시된다.
- visual `pending_review`는 public home에 섞이지 않는 규칙이 있다.

**Risks / dependencies**

- source path와 public URL을 혼동하면 private local path가 UI에 노출될 수 있다.
- still-only visual final 상태를 오류로 처리하면 homepage 품질이 흔들릴 수 있다.

**Owner / handoff**

- Owner: Faker.
- Review: Muyeol later, before public deployment.
- Handoff: Phase 2 data contract.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 1-1 | source inventory JSON/MD 초안 | `/data/source-inventory.json`, `/docs/source-inventory.md` | 주요 루프 데이터 경로와 용도 정리 | JSON parse, 문서 readback | visibility matrix 작성 |
| 1-2 | public/private/admin field matrix | `/docs/privacy-boundary.md` | 각 source별 공개 가능 필드와 금지 필드 분리 | 금지어/민감 패턴 수동 점검 | adapter allowlist 설계 |
| 1-3 | visual source status rule | `/docs/visual-source-status.md` | `final_current`, `final_current_stills_only_no_turntables`, `pending_review` 처리 기준 명시 | current-home-visual-set 샘플 대조 | Phase 2 schema로 넘김 |
| 1-4 | research/growth data exposure rule | `/docs/research-growth-exposure.md` | 논문 링크와 성장 질문 요약 노출 범위 정리 | selected papers, growth monthly 샘플 대조 | Phase 2 adapter field 정의 |

---

### Phase 2. Data Contract & Local Content Pipeline

**Goal**  
로컬 파일을 안전하게 읽고, public-safe 데이터로 정규화하는 최소 파이프라인을 만든다.

**Build scope**

- read-only adapters.
- JSON/JSONL parser utilities.
- content normalization.
- validation errors and fallback states.

**Inputs**

- visual final JSON.
- image gallery items JSONL.
- paper selected Markdown/JSONL.
- Son growth loop Markdown/JSONL.
- graph candidate docs.

**Acceptance criteria**

- local files를 read-only로 읽는다.
- adapter output은 public-safe 필드만 기본 반환한다.
- missing video는 error가 아니라 still fallback으로 처리된다.
- parsing failure가 UI crash로 이어지지 않는다.

**Risks / dependencies**

- 로컬 절대 경로를 public asset path로 그대로 쓰면 배포에서 깨질 수 있다.
- JSONL 일부 라인 오류가 전체 ingest 실패로 번질 수 있다.

**Owner / handoff**

- Owner: Faker.
- Handoff: Phase 3 app shell and component system.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 2-1 | JSON/JSONL safe read utility | `src/lib/readLocalData.*` 또는 동등 영역 | missing file, invalid JSON, empty JSONL 처리 | unit/smoke test 또는 local script | visual adapter 구현 |
| 2-2 | `HomeVisualSetAdapter` read-only 초안 | `src/data/homeVisualSet.*` | lead + support[2] 정규화 | current JSON으로 sample output 확인 | UI shell 연결 |
| 2-3 | `VisualSourceStatusGate` | `src/data/visualStatus.*` | pending 차단, still-only final 허용 후보 처리 | final/pending sample fixture 테스트 | visual archive adapter |
| 2-4 | research/paper selected adapter | `src/data/researchItems.*` | title/link/relevance/status/caution 추출 | weekly-selected 샘플 3개 렌더 데이터 확인 | `/research` 카드로 넘김 |
| 2-5 | growth/SNS signal adapter | `src/data/growthSignals.*` | 개인 맥락 없이 질문/실험/OBD 메모 요약 | July monthly 샘플 public-safe 확인 | `/growth` 카드로 넘김 |

---

### Phase 3. Web App Foundation / Design System Shell

**Goal**  
차분하고 고급스러운 SaaS/bento admin-dashboard 기반을 만든다.

**Build scope**

- route skeleton.
- layout shell.
- design tokens.
- card, section, badge, breadcrumb primitives.
- responsive base.

**Inputs**

- woongdesignv2 restraint direction.
- Home screen layout 후보.
- Harness/Loop/Graph narrative.

**Acceptance criteria**

- `/`, `/visuals`, `/graph`, `/research`, `/growth`, `/dashboard` skeleton이 있다.
- off-white canvas, rounded cards, soft shadows, restrained typography가 적용된다.
- neon, glassmorphism, generic AI-startup aesthetic을 피한다.

**Risks / dependencies**

- UI를 지표 대시보드처럼만 만들면 Chris의 “design memory system” 느낌이 약해진다.
- 너무 많은 route를 한 번에 만들면 첫 slice가 늦어진다.

**Owner / handoff**

- Owner: Faker.
- Design direction: Go Youn-jung guidance already reflected.
- Handoff: Phase 4 HomeVisualHero.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 3-1 | app shell + route placeholders | `src/App.*`, `src/routes/*` | 주요 라우트가 빈 상태로 이동 가능 | local dev/build, route click smoke | design tokens 적용 |
| 3-2 | design token base | `src/styles/tokens.*`, global CSS | canvas/card/type/spacing 토큰 적용 | screenshot 또는 visual smoke | primitive cards 구현 |
| 3-3 | Card/Section/Badge primitives | `src/components/ui/*` | 공통 카드와 상태 배지가 재사용 가능 | component render smoke | home narrative 구성 |
| 3-4 | responsive bento layout | `src/components/layout/*` | desktop 2–3 column, mobile 1 column 안정 | mobile/desktop screenshot | Phase 4 hero로 넘김 |

---

### Phase 4. HomeVisualHero from finalized Go Youn-jung 3-image set

**Goal**  
Go Youn-jung의 최신 finalized 3-image set을 홈의 editorial hero로 사용한다.

**Build scope**

- `HomeVisualHero`.
- lead + 2 supporting visual cards.
- static still first rendering.
- `왜 이 이미지인가` preview.
- prompt hidden by default.

**Inputs**

- `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json`
- 2026-07-31 final set: `Soft Evidence Keystone`, `Context Field Notebook`, `Trust Envelope Cushion`.
- asset paths under `/opt/data/hermes-webapp-build-loop/assets/image-gallery/2026-07-31/stills-1080/`.

**Acceptance criteria**

- 홈 hero는 canonical final current source만 읽는다.
- 3장 still-only final 상태를 정상 상태로 보여준다.
- `turntable_video_asset_path`가 없어도 UI가 error처럼 보이지 않는다.
- exact prompt와 private source path는 public 화면에 나오지 않는다.

**Risks / dependencies**

- 배포 시 로컬 asset path를 어떻게 public asset으로 매핑할지 결정 필요.
- `final_current_stills_only_no_turntables` allowed status는 Chris/Karina scope lock에서 확정해야 한다.

**Owner / handoff**

- Owner: Faker.
- Visual source owner: Go Youn-jung.
- Handoff: Phase 5 visual archive.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 4-1 | `HomeVisualHero` component | `src/components/home/HomeVisualHero.*` | lead/supporting 레이아웃 보임 | sample data render 확인 | asset mapping 처리 |
| 4-2 | visual asset path mapper | `src/lib/assetMap.*` | local path를 app-safe path로 변환 | 3개 이미지 로드 smoke | card rationale 연결 |
| 4-3 | visual card rationale preview | `src/components/visual/VisualCard.*` | title/theme/metaphor/why 첫 문장 표시 | public field snapshot 확인 | drawer 구현 준비 |
| 4-4 | still-only fallback state | `src/data/homeVisualSet.*`, component | video 없음이 에러로 표시되지 않음 | current set fixture로 확인 | VisualDetailDisclosure로 넘김 |

---

### Phase 5. Visual Archive / Image Gallery

**Goal**  
Go Youn-jung의 시각 루프를 `/visuals`에서 Pinterest형 아카이브로 보여준다.

**Build scope**

- masonry/card grid.
- visual detail drawer.
- final/current and archived final display.
- pending/admin preview separation.
- prompt hidden policy.

**Inputs**

- `data/image-gallery/items.jsonl`.
- `data/image-gallery/YYYY-MM-DD.json`.
- `data/image-gallery/pending/*.json` only for admin preview if approved.
- `current-home-visual-set.json`.

**Acceptance criteria**

- public `/visuals`에는 final/archived public-safe item만 표시된다.
- pending item은 admin preview 없이는 보이지 않는다.
- drawer는 rationale-first이고 metadata는 접힘 처리된다.
- exact prompt는 Chris 요청 전까지 숨긴다.

**Risks / dependencies**

- 이미지가 많아지면 성능/로딩 전략 필요.
- local absolute path exposure 방지 필요.

**Owner / handoff**

- Owner: Faker.
- Source owner: Go Youn-jung.
- Review: Muyeol privacy/gov later.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 5-1 | visual archive adapter | `src/data/visualArchive.*` | items.jsonl에서 public-safe item list 생성 | sample count와 필드 allowlist 확인 | grid 구현 |
| 5-2 | `/visuals` masonry grid | `src/routes/Visuals.*` | 이미지 카드 목록 표시 | desktop/mobile visual smoke | drawer 연결 |
| 5-3 | `VisualDetailDisclosure` drawer | `src/components/visual/VisualDetailDisclosure.*` | 클릭 시 rationale/metadata 접힘 표시 | prompt/private path 미노출 확인 | video fallback |
| 5-4 | still/video fallback detail | drawer + data mapper | turntable 없으면 still만 우아하게 표시 | still-only fixture 테스트 | admin preview 후보로 넘김 |
| 5-5 | status filter foundation | `src/components/visual/VisualFilters.*` | final/current/archived 분리 가능 | pending 숨김 테스트 | Phase 6 graph 연결 |

---

### Phase 6. Harness / Loop / Graph Engineering explanation and `/graph` route/card layer

**Goal**  
웹앱이 단순 갤러리나 로그가 아니라 Harness / Loop / Graph Engineering 프로젝트임을 명확히 설명한다.

**Build scope**

- home or `/graph` 3-card project explanation.
- file-based graph MVP docs/files.
- graph card primitives.
- relation breadcrumb UI.

**Inputs**

- `candidates/graph-engineering.md`.
- `SCHEMA.md` Harness/Loop/Graph definition.
- Graph node/edge candidates.
- Home visual artifacts as first `Artifact` nodes.

**Acceptance criteria**

- `/graph`에서 Harness/Loop/Graph가 분리되어 보인다.
- file-based graph MVP 경로가 정의된다.
- 최소 node type 8개와 relation type 9개가 schema에 기록된다.
- 초기 UI는 network graph가 아니라 cards + breadcrumb다.

**Risks / dependencies**

- Graph Engineering을 기술 DB 설명으로만 만들면 Chris의 OBD 성장 의미가 약해진다.
- 너무 일찍 DB를 붙이면 운영/검증보다 인프라 복잡도가 커진다.

**Owner / handoff**

- Owner: Faker.
- Framing owner: Karina.
- Validation: Muyeol before public claim.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 6-1 | Harness/Loop/Graph 3-card section | `src/components/project/ProjectFraming.*` | 세 층이 명확히 분리됨 | text review, route render | graph schema 파일 |
| 6-2 | file-based graph schema draft | `data/graph/schema.md` | node/relation/privacy/validation 정의 | readback, schema checklist | sample nodes |
| 6-3 | sample `nodes.jsonl` | `data/graph/nodes.jsonl` | Agent/ResearchItem/Theme/Insight/Artifact 샘플 포함 | JSONL parse | sample edges |
| 6-4 | sample `edges.jsonl` | `data/graph/edges.jsonl` | SUPPORTS/FEEDS/VALIDATED_BY 등 샘플 포함 | JSONL parse, dangling node check | UI card adapter |
| 6-5 | `/graph` breadcrumb card layer | `src/routes/Graph.*`, `src/components/graph/*` | ResearchItem→Insight→Artifact 흐름 표시 | sample graph render | research cards 연결 |

---

### Phase 7. Research/Paper Archive + Graph relationship cards

**Goal**  
Yuna/Go Youn-jung의 리서치와 weekly best-3 paper selections를 `/research`와 graph relationship card에 연결한다.

**Build scope**

- research archive list.
- paper card.
- source link and citation handling.
- Muyeol status/caution badge.
- graph relation from `ResearchItem` to `Insight`.

**Inputs**

- `/opt/data/agent-team-work-log/paper-candidates/weekly-selected-papers.md`.
- `all-research-items.jsonl` if used.
- Friday shortlist files.
- Muyeol GO/WATCH/HOLD notes.

**Acceptance criteria**

- selected paper items are de-duplicated by title/DOI/URL where possible.
- card includes title, source/link, Chris relevance, validation/caution.
- WATCH/HOLD items are not presented as proven industry standards.
- graph card shows how research supports insight.

**Risks / dependencies**

- some sources are abstract/metadata/snippet-only; UI must show access confidence.
- old 3+3 vs current best-3 weekly format mismatch can confuse archive labels.

**Owner / handoff**

- Owner: Faker.
- Research source owners: Yuna + Go Youn-jung.
- Validation owner: Muyeol.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 7-1 | selected papers parser/fixture | `src/data/papers.*` 또는 `data/research/*` | W29–W31 best-3 샘플 정규화 | parse test, sample count | research card UI |
| 7-2 | `/research` paper card list | `src/routes/Research.*` | 제목/링크/관련성/검증 badge 표시 | link and field smoke | graph relation 연결 |
| 7-3 | source confidence/caution component | `src/components/research/*` | GO/WATCH/HOLD와 caution 표시 | WATCH/HOLD copy review | de-dup 처리 |
| 7-4 | de-dup helper | `src/lib/dedupeResearch.*` | DOI/URL/title 기준 중복 제거 | duplicate fixture test | graph node generation |
| 7-5 | ResearchItem→Insight graph cards | `src/components/graph/ResearchTraceCard.*` | research가 insight를 support하는 breadcrumb 표시 | sample graph render | Phase 8 성장/OBD 연결 |

---

### Phase 8. Son Growth/SNS + OBD Dashboard Views

**Goal**  
Son의 성장 질문, SNS/subscriber loop, Chris의 OBD 성장 언어를 `/growth`, `/obd`, dashboard cards로 연결한다.

**Build scope**

- growth question card.
- SNS experiment card.
- OBD insight card.
- DecisionMoment / PublicSafeDecisionLog / RoleJudgmentMap candidates.
- graph relation to ResearchItem, Insight, Decision.

**Inputs**

- `/opt/data/hermes-growth-sns-loop/`.
- Son prep/daily/monthly files.
- Muyeol guardrails.
- Faker data model candidates.

**Acceptance criteria**

- 질문/실험/OBD 메모가 1–3분 내 읽히는 카드로 보인다.
- Chris private answer 원문은 기본 공개하지 않는다.
- SNS/subscriber 지표는 개인 식별자 없이 표시된다.
- OBD는 generic startup/finance 언어가 아니라 business-centered design leadership 언어로 표현된다.

**Risks / dependencies**

- 성장 루프를 “마케팅 팁 모음”처럼 만들면 Hermes growth story가 약해진다.
- Chris 답변 원문 노출은 privacy risk가 크다.

**Owner / handoff**

- Owner: Faker.
- Source owner: Son.
- Review: Karina + Muyeol before public use.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 8-1 | growth signal adapter | `src/data/growthSignals.*` | question/tip/experiment/OBD note 정규화 | July sample public-safe 확인 | `/growth` UI |
| 8-2 | `/growth` card view | `src/routes/Growth.*` | 성장 질문 + SNS 실험 카드 표시 | mobile/desktop render | OBD card 연결 |
| 8-3 | OBD insight card | `src/components/obd/*`, `/obd` route | market/category/value/design-leadership 언어로 표시 | copy review | graph relation 연결 |
| 8-4 | DecisionMoment/PublicSafeDecisionLog card | `src/components/growth/*` | before/after/decision/follow-up가 추상화됨 | raw private text 미노출 확인 | dashboard summary |
| 8-5 | growth graph edge generation | `data/graph/edges.jsonl` update or adapter | Insight→GrowthQuestion→Decision 연결 | dangling node check | Phase 9 governance |

---

### Phase 9. Admin Review, QA, Governance, Deployment & Daily Ops

**Goal**  
공개 전 검증, privacy guard, admin review, deployment handoff, daily operation을 정리한다.

**Build scope**

- admin dashboard review queue.
- privacy lint/checklist.
- validation status display.
- deployment readiness doc.
- daily ops handoff.

**Inputs**

- Muyeol validation rules.
- source exposure matrix.
- visual pending/final rules.
- graph validation status.
- Chris deployment decision.

**Acceptance criteria**

- raw private logs, token-like strings, exact prompts are not in public build output.
- pending visual is not exposed publicly.
- WATCH/HOLD claims are clearly cautious.
- build/lint/test/deployment checklist passes.
- daily ops handoff explains who updates which data.

**Risks / dependencies**

- public/private route protection must match deployment environment.
- local absolute paths may break in deployed artifact.
- cron-generated future data can change schema; adapters need graceful failure.

**Owner / handoff**

- Owner: Faker.
- Final validation: Muyeol.
- Final synthesis and Chris-facing go/no-go: Karina.

#### Daily coding tasks after approval

| Day | 오늘 만들 것 | 수정 파일/영역 | 완료 기준 | 검증 방법 | 다음날 인수인계 |
|---|---|---|---|---|---|
| 9-1 | admin review queue shell | `src/routes/Dashboard.*`, `src/components/admin/*` | pending/review/validation cards visible in admin area only | route visibility smoke | privacy lint |
| 9-2 | privacy/public-field lint script | `scripts/privacy-check.*` | token-like/private path/raw prompt patterns catch 가능 | script run with fixtures | build QA |
| 9-3 | validation status model | `src/components/validation/*` | GO/WATCH/HOLD/unreviewed 표시 | sample states render | deployment checklist |
| 9-4 | deployment readiness doc | `/docs/deployment-readiness.md` | env, asset, route, privacy checklist 완성 | readback + checklist | final QA |
| 9-5 | final build/test pass | package scripts, test/build config | lint/build/test 성공 | actual command output 확인 | Muyeol go/no-go review |
| 9-6 | daily ops handoff doc | `/docs/daily-ops.md` | 데이터 업데이트/검증/배포 책임 정리 | Karina/Faker/Muyeol review | Chris final report |

---

## 7. First 10 coding tasks after approval, ordered from smallest safe end-to-end slice

Chris가 승인하면 Faker는 아래 순서로 아주 작은 end-to-end slice부터 시작하는 것이 좋다.

1. **Scope lock doc 생성**: repo/workdir, public/private/admin, deployment target, daily rhythm 기록.
2. **Route skeleton 생성**: `/`, `/visuals`, `/graph`, `/research`, `/growth`, `/dashboard` placeholder.
3. **Design token base 적용**: off-white canvas, rounded cards, spacing, restrained typography.
4. **Harness / Loop / Graph 3-card section**: 홈 또는 `/graph`에 project framing first slice.
5. **Safe JSON/JSONL read utility**: missing/invalid file graceful handling.
6. **`HomeVisualSetAdapter` 구현**: `current-home-visual-set.json`에서 lead/supporting 정규화.
7. **`HomeVisualHero` 정적 렌더**: 2026-07-31 3장 still-only final set 표시.
8. **Prompt/private field 미노출 체크**: public card에서 exact prompt/source path/private prompt path 숨김 확인.
9. **`/visuals` masonry 초안**: image gallery public-safe archive 목록 표시.
10. **file-based graph sample**: `data/graph/schema.md`, `nodes.jsonl`, `edges.jsonl` 최소 샘플과 `/graph` breadcrumb card 연결.

---

## 8. Decisions Chris must confirm before coding

Chris가 아래를 확인해줘야 Faker가 코딩을 시작할 수 있다.

1. **repo/workdir**: 실제 구현 위치를 어디로 할지.
2. **public/private boundary**: 공개 홈페이지와 비공개/admin dashboard를 어떻게 나눌지.
3. **deployment target**: local-only, internal preview, public web 중 어디를 목표로 할지.
4. **first screen priority**: HomeVisualHero 우선인지, Harness/Loop/Graph 설명 우선인지, 둘을 같은 첫 화면에 둘지.
5. **data exposure rules**: title/theme/metaphor/why/source link/validation status 중 무엇을 공개할지.
6. **Graph MVP choice**: 우선 파일 기반 `nodes.jsonl`/`edges.jsonl`/`schema.md`로 시작하고 KuzuDB/Neo4j는 나중에 볼지.
7. **daily coding rhythm**: 하루 30분, 하루 1시간, 주말 집중 중 어떤 리듬으로 갈지.
8. **phase order**: 기본 0→9 순서로 갈지, HomeVisualHero를 더 앞당길지, Graph 설명을 더 앞당길지.
9. **visual status rule**: `final_current_stills_only_no_turntables`를 public home allowed status로 확정할지.
10. **admin preview rule**: pending Go Youn-jung visual을 admin preview에는 보여줄지, 초기에는 완전히 숨길지.

---

## 9. Recommended approval wording

Chris가 승인한다면 다음처럼 짧게 답하면 된다.

> 승인. repo/workdir은 `...`, 우선 public/private는 `...`, 배포는 `...`, 첫 화면은 `...`, graph는 파일 기반 MVP로 시작, daily rhythm은 `...`로 가자.

승인이 없으면 Faker는 계속 코딩을 시작하지 않는다.

**Chris 컨펌 전에는 코딩 시작하지 않음.**

---

## 10. Karina final note

Chris, 이번 계획은 “앱을 크게 만들자”가 아니라 “매일 조금씩 안전하게 쌓을 수 있는 구조”로 짰어. 특히 초반은 완벽한 아키텍처보다 작게 작동하는 slice를 우선해. 그래도 공개/비공개 경계, prompt hidden, graph MVP 범위는 처음에 잠가야 나중에 덜 불안해져.

내 추천은 기본 10 phase 그대로 가되, 승인 후 첫 주는 **Scope lock → route shell → design token → Harness/Loop/Graph 설명 → HomeVisualHero read-only slice**까지만 작게 확인하는 거야.
