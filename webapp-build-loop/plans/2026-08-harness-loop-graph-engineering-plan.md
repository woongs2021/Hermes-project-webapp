# 2026년 8월 Hermes/OBD 웹앱 계획 — Harness / Loop / Graph Engineering

상태: 계획안 1차 초안  
작성일: 2026-07-26  
Owner: Karina / Faker  
원칙: Chris 컨펌 전에는 코딩 시작하지 않음

## 1. 한 줄 정의

Hermes/OBD 웹앱은 Chris의 에이전트 팀 운영을 **Harness**, 반복 성장 시스템을 **Loop**, 그리고 축적된 지식과 판단의 관계화를 **Graph Engineering**으로 보여주는 사고 운영 웹앱이다.

## 2. 8월 목표

8월의 목표는 거대한 그래프 DB 플랫폼을 바로 만드는 것이 아니다.

우선 목표는 다음 세 가지다.

1. Chris의 Hermes 프로젝트를 설명 가능한 제품 구조로 정리한다.
2. 에이전트 루프에서 나온 산출물을 웹앱에서 카드/관계/breadcrumb로 볼 수 있게 만든다.
3. 향후 KuzuDB 또는 Neo4j로 확장할 수 있도록 파일 기반 그래프 MVP 구조를 만든다.

## 3. 프로젝트 설명 구조

### 3.0 왜 Hermes인가

이 루프는 Hermes 없이도 구현 가능하다. LangGraph, CrewAI, OpenAI Agents SDK, cron, Slack/Telegram API, DB를 조합하면 유사한 구조를 만들 수 있다.

하지만 이 프로젝트에서는 Hermes가 자연스럽다. Hermes가 이미 profile, cron, gateway, memory, skill, file workflow, session search, tool execution을 제공하기 때문에 Chris의 에이전트 팀을 실행하는 **하네스** 역할을 한다. 그래서 우리는 인프라를 처음부터 조립하기보다, Hermes 위에서 Loop와 Graph Engineering 설계에 집중한다.

웹앱에는 이 내용을 “왜 Hermes인가” 또는 “Hermes as Harness” 섹션으로 짧게 반영한다. 상세 후보는 `/opt/data/hermes-webapp-build-loop/candidates/why-hermes.md`에 유지한다.

### 3.1 Harness / 하네스

하네스는 에이전트 팀과 도구를 안전하게 묶는 실행 기반이다.

포함 요소:

- Karina, Yuna, Go Youn-jung, Son, Faker, Muyeol 역할 구조
- Hermes tools, cron, local files, Telegram/Slack delivery
- 권한, 라우팅, handoff, 공개/비공개 경계
- Chris 컨펌 전 구현 금지 같은 governance rule

웹앱 표현 후보:

- 홈의 3단 설명 카드 중 첫 번째 카드
- `/agents`의 agent role card
- 비공개 dashboard의 운영 상태/권한/라우팅 설명

### 3.2 Loop / 루프

루프는 매일·매주 반복되는 에이전트 작업 리듬이다.

주요 루프:

- Yuna: AI/AX, LLM, paper, technology research
- Go Youn-jung: UX/design research, visual generation, HomeVisualHero source
- Son: growth question, SNS/subscriber framing, business/market interpretation
- Faker: webapp structure planning, data contract, implementation candidate
- Muyeol: validation, governance, privacy/risk review
- Karina: final synthesis, orchestration, Chris-facing framing

웹앱 표현 후보:

- `/growth`의 daily/weekly loop timeline
- `/research`의 paper/research archive
- `/visuals`의 Go Youn-jung visual archive
- `/dashboard`의 loop status cards

### 3.3 Graph Engineering / 그래프 엔지니어링

그래프 엔지니어링은 루프 산출물을 단순 로그가 아니라 지식과 판단의 관계로 연결하는 구조다.

초기 노드 후보:

- `Agent`
- `ResearchItem`
- `Theme`
- `Insight`
- `GrowthQuestion`
- `Artifact`
- `Decision`
- `RiskReview`

초기 관계 후보:

- `FOUND`
- `SUPPORTS`
- `INTERPRETED_AS`
- `TRANSLATED_INTO`
- `VALIDATED_BY`
- `HAS_RISK`
- `APPROVED_BY`
- `FEEDS`
- `BELONGS_TO_THEME`

예시 흐름:

```text
Yuna ResearchItem
→ Insight
→ Go Youn-jung design interpretation
→ Son GrowthQuestion
→ Muyeol RiskReview
→ Chris Decision
→ Faker Webapp Artifact
```

웹앱 표현 후보:

- `/graph` route
- 카드형 relation breadcrumb
- ResearchItem → Insight → GrowthQuestion → Decision → Artifact 연결 카드
- 공개 페이지에는 polish된 narrative만 표시
- 비공개 dashboard에는 validation status, risk flags, source refs 표시

## 4. 그래프 MVP 범위

8월 초반에는 DB부터 만들지 않는다.

우선 파일 기반 MVP로 시작한다.

예상 경로:

```text
/opt/data/hermes-webapp-build-loop/data/graph/schema.md
/opt/data/hermes-webapp-build-loop/data/graph/nodes.jsonl
/opt/data/hermes-webapp-build-loop/data/graph/edges.jsonl
```

### 4.1 `nodes.jsonl` 후보 필드

```json
{
  "id": "insight:2026-07-25:delegated-authority",
  "type": "Insight",
  "title": "권한·책임·철회 가능성이 AI 위임 신뢰의 핵심이다",
  "date_kst": "2026-07-25",
  "source_agents": ["yuna", "son"],
  "theme_ids": ["theme:delegated-authority", "theme:ai-agent-trust"],
  "validation_status": "watch",
  "privacy_level": "public_safe_summary"
}
```

### 4.2 `edges.jsonl` 후보 필드

```json
{
  "from": "research:yuna:2026-07-25:001",
  "relation": "SUPPORTS",
  "to": "insight:2026-07-25:delegated-authority",
  "date_kst": "2026-07-25",
  "source_agent": "yuna",
  "confidence": "medium"
}
```

## 5. 8월 Phase 계획

### Phase 0. Scope Lock & Repo Decision

목표: 실제 구현을 시작하기 전 범위를 잠근다.

결정 필요:

- repo/workdir
- public/private/admin 범위
- 배포 대상
- 첫 화면 우선순위
- graph MVP를 파일 기반으로 시작할지 여부

완료 기준:

- Chris가 구현 시작을 승인한다.
- `Chris 컨펌 전에는 코딩 시작하지 않음` 원칙 유지.

### Phase 1. Data Inventory & Privacy Boundary

목표: 웹앱이 읽을 수 있는 데이터와 읽으면 안 되는 데이터를 분리한다.

주요 소스:

- `/opt/data/hermes-webapp-build-loop/`
- `/opt/data/hermes-growth-sns-loop/`
- `/opt/data/agent-team-work-log/`
- `/opt/data/daily-work-log/`
- `/opt/data/hermes-webapp-build-loop/data/image-gallery/`

완료 기준:

- public/private/admin field matrix 작성
- raw logs, tokens, private IDs 제외 규칙 명시

### Phase 2. Product Framing Shell

목표: 홈 또는 `/graph` 진입부에 Harness / Loop / Graph Engineering 설명을 배치한다.

구성 후보:

- 3단 설명 카드
- 짧은 product narrative
- Chris의 Hermes/OBD 프로젝트 한 줄 정의

완료 기준:

- 사용자가 웹앱 첫 화면에서 프로젝트의 의미를 이해할 수 있다.

### Phase 3. Web App Foundation / Design System Shell

목표: 차분한 SaaS/bento형 UI 기반을 만든다.

디자인 원칙:

- off-white canvas
- rounded cards
- soft shadows
- generous spacing
- restrained typography
- woongdesignv2 tone
- neon/glassmorphism/generic AI-startup aesthetic 금지

완료 기준:

- 기본 route shell
- card system
- responsive layout
- public/private area placeholder

### Phase 4. HomeVisualHero

목표: Go Youn-jung의 finalized 3-image set을 홈의 editorial hero로 사용한다.

데이터 소스:

- `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json`
- `/opt/data/hermes-webapp-build-loop/data/image-gallery/items.jsonl`

구성:

- 1 lead visual card
- 2 supporting visual cards
- click drawer with `왜 이 이미지인가`
- prompt hidden by default

완료 기준:

- pending image는 홈에 섞이지 않는다.
- final/current만 public home source가 된다.

### Phase 5. Visual Archive / Image Gallery

목표: `/visuals`에서 Go Youn-jung visual loop를 archive로 볼 수 있게 한다.

구성:

- Pinterest-like masonry grid
- image/title/theme/metaphor
- click detail drawer
- optional turntable video
- prompt hidden policy

완료 기준:

- 시각물이 장식이 아니라 insight/artifact로 보인다.

### Phase 6. Graph MVP Data Contract

목표: graph engineering을 위한 파일 기반 데이터 계약을 만든다.

산출물 후보:

- `data/graph/schema.md`
- `data/graph/nodes.jsonl`
- `data/graph/edges.jsonl`

완료 기준:

- 최소 5개 node type 정의
- 최소 5개 relation type 정의
- sample node/edge 작성
- public/private field 구분

### Phase 7. `/graph` Card View

목표: 복잡한 네트워크 그래프 대신 카드 + relation breadcrumb로 시작한다.

구성:

- Theme card
- Insight card
- Evidence card
- GrowthQuestion card
- Decision/RiskReview card
- Artifact card

예시 breadcrumb:

```text
ResearchItem → Insight → GrowthQuestion → RiskReview → Decision → Artifact
```

완료 기준:

- Chris가 “이 인사이트가 어디서 와서 무엇으로 이어졌는지” 볼 수 있다.

### Phase 8. Research / Growth / OBD Views

목표: 기존 Yuna, Go Youn-jung, Son 루프를 route별로 연결한다.

Route 후보:

- `/research`
- `/growth`
- `/obd`
- `/dashboard`

완료 기준:

- research item, growth question, OBD insight가 graph node와 연결될 준비가 된다.

### Phase 9. Admin Review / Governance / QA

목표: 공개 전 검증, prompt-hidden, pending/final, Muyeol validation을 안전하게 다룬다.

구성:

- validation status
- risk flags
- pending review queue
- public/private/admin visibility
- source allowlist

완료 기준:

- raw private log가 공개 UI에 나오지 않는다.
- unreviewed/HOLD/WATCH 상태가 구분된다.

## 6. 첫 10개 일일 코딩 후보

Chris 승인 후에만 실행한다.

1. repo/workdir 확정 후 app shell 점검
2. route skeleton 생성: `/`, `/visuals`, `/graph`, `/research`, `/growth`, `/dashboard`
3. 디자인 토큰과 기본 card layout 적용
4. 홈에 Harness / Loop / Graph Engineering 3-card 설명 배치
5. `current-home-visual-set.json` read-only adapter 후보 구현
6. `HomeVisualHero` 정적 데이터 연결
7. `/visuals` masonry card 초안
8. graph schema sample file 생성
9. `/graph` relation breadcrumb card 초안
10. public/private visibility guard 초안

## 7. Chris 확인 필요 사항

8월 구현 전 Chris가 확인할 것:

- repo/workdir은 어디로 할지
- public homepage와 private dashboard를 둘 다 만들지
- 첫 화면 우선순위: HomeVisualHero 우선인지, Harness/Loop/Graph 설명 우선인지
- graph MVP는 파일 기반으로 시작할지
- KuzuDB/Neo4j는 나중에 검토로 둘지
- 하루 코딩 리듬: 30분, 1시간, 주말 집중 중 어떤 방식이 좋은지
- Go Youn-jung pending visual을 admin preview에 보여줄지 완전히 숨길지

## 8. 현재 결정

현재는 다음 기준으로 잠정 확정한다.

- 7월: 계획만 축적
- 8월 1일: Karina/Faker가 phase-by-phase MD 계획서를 Slack에 공유
- Chris 컨펌 전: 코딩 시작하지 않음
- Graph Engineering: 우선 파일 기반 MVP
- DB 도입: KuzuDB/Neo4j는 후속 검토
- UI 표현: 복잡한 network graph보다 카드 + breadcrumb 우선

## 9. 최종 요약

8월 웹앱은 “대시보드 하나 만들기”가 아니라 Chris의 Hermes 운영 철학을 제품 구조로 만드는 작업이다.

핵심은 다음 문장이다.

> Hermes/OBD 웹앱은 에이전트 팀을 실행하는 Harness, 반복적으로 지식을 쌓는 Loop, 그 결과를 관계형 지식 구조로 바꾸는 Graph Engineering을 보여주는 Chris의 사고 운영 웹앱이다.
