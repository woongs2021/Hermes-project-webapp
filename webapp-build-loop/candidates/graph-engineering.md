# 그래프 엔지니어링 후보 — Harness / Loop / Graph

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## Chris 방향

Hermes/OBD 웹앱은 단순 대시보드가 아니라 Chris의 에이전트 운영 방식을 설명하는 제품적 구조를 가져야 한다. 프로젝트 설명은 세 층으로 나눈다.

1. **Harness / 하네스** — 에이전트와 도구를 안전하게 묶고 실행하는 운영 기반.
2. **Loop / 루프** — 매일·매주 반복되는 리서치, 성장 질문, 시각 생성, 검증, 코딩 계획의 리듬.
3. **Graph Engineering / 그래프 엔지니어링** — 루프에서 나온 근거·인사이트·질문·결정·아티팩트를 노드와 관계로 연결하는 지식/판단 구조.

## 제품 설명 문장 후보

> Hermes/OBD project는 하네스, 루프, 그래프 엔지니어링으로 구성된다. 하네스는 에이전트 팀과 도구를 안전하게 연결하고, 루프는 Yuna·Go Youn-jung·Son·Faker·Muyeol이 반복적으로 근거와 질문과 산출물을 쌓는 리듬을 만든다. 그래프 엔지니어링은 그 결과를 단순 로그가 아니라 ResearchItem, Insight, GrowthQuestion, Artifact, Decision, RiskReview 간 관계로 연결해 Chris의 사고와 판단이 축적되는 지식 지도로 전환한다.

## 그래프 MVP 원칙

처음부터 Neo4j급 완성 시스템으로 가지 않는다. 1차 MVP는 파일 기반 그래프 스키마로 시작한다.

- `nodes.jsonl` — 그래프 노드 후보
- `edges.jsonl` — 그래프 관계 후보
- `schema.md` — 노드/관계 정의와 공개/비공개 경계

이후 필요하면 KuzuDB 또는 Neo4j로 적재한다.

## 초기 노드 후보

- `Agent`: Karina, Yuna, Go Youn-jung, Son, Faker, Muyeol
- `ResearchItem`: 논문, 기사, 리포트, 시장 데이터
- `Theme`: AI/AX job shift, OBD, delegated authority, design leadership 등
- `Insight`: 연구/운영에서 추출된 의미 단위
- `GrowthQuestion`: Son이 Chris에게 던지는 성장 질문
- `Artifact`: Go Youn-jung 이미지, Faker 웹앱 카드, 리포트, 다이어그램
- `Decision`: Chris의 승인, 보류, 수정, 방향 전환
- `RiskReview`: Muyeol의 GO/WATCH/HOLD, 과장/프라이버시/근거 리스크

## 초기 관계 후보

- `FOUND` — 에이전트가 소스를 발견함
- `SUPPORTS` — 소스가 인사이트를 뒷받침함
- `INTERPRETED_AS` — 연구가 디자인/비즈니스 의미로 해석됨
- `TRANSLATED_INTO` — 인사이트가 질문/실험/콘텐츠로 변환됨
- `VALIDATED_BY` — Muyeol 검증과 연결됨
- `HAS_RISK` — 리스크 플래그와 연결됨
- `APPROVED_BY` — Chris 결정과 연결됨
- `FEEDS` — 웹앱 카드, 홈 섹션, 아카이브, 보고서로 공급됨
- `BELONGS_TO_THEME` — 상위 주제에 속함

## 핵심 데이터 흐름

예시 흐름:

`Yuna` → `ResearchItem` → `Insight` → `Go Youn-jung design interpretation` → `Son GrowthQuestion` → `Muyeol RiskReview` → `Chris Decision` → `Faker Webapp Artifact`

## 웹앱 표현 방식

초기 UI는 복잡한 force-directed network보다 카드형이 우선이다.

- 홈: Harness / Loop / Graph Engineering 3단 설명 카드
- `/graph`: 지식 그래프 후보 탭. 처음에는 카드 + relation breadcrumb로 표시
- `/research`: ResearchItem과 Insight 연결
- `/growth`: GrowthQuestion과 Decision 연결
- `/visuals`: Artifact와 연결된 Insight/Theme 표시
- 비공개 dashboard: validation status, risk flags, source refs, private note 표시

## 안전 경계

- raw Slack/Telegram 로그, 토큰, 비공개 ID, credential은 그래프 노드로 만들지 않는다.
- 공개 페이지에는 polish된 narrative와 공개 안전 관계만 보여준다.
- private dashboard에는 richer source refs를 둘 수 있지만, prompt/source path/private note 노출은 allowlist 기반으로 제한한다.
- 검증되지 않은 주장은 `validation_status: unreviewed` 또는 `WATCH/HOLD`로 표시한다.

## 2026-07-27 후보 — ResponsibleUXTrace edge bundle

Son/Muyeol의 2026-07-27 성장/가드레일 흐름은 “설명 가능한 AI”를 단순 설명 UI가 아니라 `AI 판단 → 사용자 제어 → 수정권 → 이의제기/중단 경로 → 책임 주체`가 연결된 가치 교환 구조로 보라고 제안한다. 이를 Graph MVP의 작은 edge bundle 후보로 둔다.

### 노드 연결 후보

`ResearchItem` → `Insight` → `GrowthQuestion` → `Artifact` 또는 `Decision` → `RiskReview`

### edge 속성 후보

- `responsibility_axis`: `control`, `correction`, `appeal_or_stop`, `role_clarity`, `agency` 중 하나.
- `privacy_tier`: `public`, `private`, `admin` 중 하나.
- `validation_status`: `unreviewed`, `WATCH`, `GO`, `HOLD` 중 하나.
- `source_access_confidence`: `full_read`, `abstract_only`, `metadata_only`, `paywalled`, `snippet_only` 중 하나.
- `public_claim`: 공개 카드에 쓸 수 있는 polish된 한 문장.
- `private_note_ref`: 비공개 근거 경로 또는 관리자 메모 참조. 원시 로그/토큰/비공개 ID는 저장하지 않는다.

### 웹앱 표현 후보

초기 `/graph` 또는 `/growth` 카드에서는 network diagram보다 relation breadcrumb를 우선한다.

예시: `논문/리서치 신호` → `책임 있는 AI 가치 교환 Insight` → `Chris 성장 질문` → `HomeVisualHero/Visual Archive 근거 또는 GrowthCard` → `Muyeol WATCH/GO 검증`.

### 8월 acceptance 후보

- 공개 카드에 `public_claim`, 제목, 안전한 source link만 노출한다.
- `private_note_ref`, source path, prompt path, 운영 메타데이터는 admin/private 접힘 영역으로만 보낸다.
- `validation_status`가 `WATCH` 또는 `HOLD`인 항목은 업계 표준/시장 성과처럼 표현하지 않는다.

## 2026-07-28 후보 — AgentRoleBoundaryTrace graph card

Son/Muyeol의 2026-07-28 흐름은 인간형/업무용 AI 에이전트의 가치를 “더 친근한 캐릭터”가 아니라 `AI 역할`, `인간 책임`, `사용자 통제권`, `조직 승인 기준`, `브랜드/프라이버시 리스크`를 선명하게 나누는 운영 언어로 보라고 제안한다. 이를 Graph MVP의 첫 카드형 trace 후보 중 하나로 둔다.

### 노드 연결 후보

`ResearchItem` → `Insight` → `GrowthQuestion` → `Decision` → `RiskReview`

### node/edge 속성 후보

- `role_boundary`: AI가 맡는 역할과 맡지 말아야 할 역할.
- `human_responsibility`: 사람이 끝까지 소유해야 하는 판단·승인·책임.
- `user_control_point`: 사용자가 확인·수정·중단·되돌리기 할 수 있는 지점.
- `organization_adoption_lens`: 조직이 안심하고 채택하기 위해 필요한 기준 언어.
- `brand_privacy_risk`: 브랜드 신뢰, 감시/자동화 민감성, 개인정보/기억 노출 리스크.
- `validation_status`: `unreviewed`, `WATCH`, `GO`, `HOLD` 중 하나.
- `source_access_confidence`: `full_read`, `abstract_only`, `metadata_only`, `paywalled`, `snippet_only` 중 하나.
- `public_claim`: 공개 카드에 쓸 수 있는 polish된 한 문장.
- `private_note_ref`: 비공개 근거 경로 또는 관리자 메모 참조. 원시 로그/토큰/비공개 ID는 저장하지 않는다.

### 웹앱 표현 후보

초기 `/graph` 또는 `/growth` 카드는 force-directed network보다 relation breadcrumb를 우선한다.

예시: `연구 신호` → `AI 역할 경계 Insight` → `Chris 성장 질문` → `역할/책임/통제권 카드` → `Muyeol WATCH/GO 검증`.

### HomeVisualHero 연결 주의

Go Youn-jung의 2026-07-28 pending visual family(`Soft Taxonomy Plaque`, `Warm Value Loaf`, `Soft Quality Anvil`)는 taxonomy/value/quality 은유로 이 카드와 잘 맞지만, `pending_review` 상태이므로 homepage canonical source에는 연결하지 않는다. Chris 최종 승인 또는 finalizer 승격 전에는 admin preview와 planning note에서만 참조한다.

### 8월 acceptance 후보

- 공개 카드에는 `public_claim`, 역할/책임/통제권 요약, 안전한 source link, `validation_status`만 노출한다.
- source path, raw note, prompt path, 운영 메타데이터는 admin/private 접힘 영역으로만 보낸다.
- `WATCH/HOLD` 또는 access confidence가 약한 항목은 업계 표준·성과·시장 검증처럼 표현하지 않는다.

## 2026-08-02 후보 — VisualPromotionQuarantineGate

2026-08-02 Go Youn-jung 시각 후보는 일부 생성·일부 차단 상태이며 아직 final current가 아니다. Graph MVP와 HomeVisualHero는 이를 승인된 Artifact와 섞지 말고, 후보/리스크/승격 대기 상태로 격리해야 한다.

### 기준 소스

- Current public home source: `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json`
- Pending candidate source: `/opt/data/hermes-webapp-build-loop/data/image-gallery/pending/2026-08-02.json`
- Pending status: `partial_blocked_by_higgsfield_credits`
- Public action: `keep_current_final`

### 노드/관계 후보

`ArtifactCandidate(pending visual item)` → `HAS_RISK` → `RiskReview(source_status_or_credit_dependency)`

`ArtifactCandidate(pending visual item)` → `NEEDS_VALIDATION` → `Decision(final_save_or_reject)`

`Artifact(final_current home set)` → `FEEDS` → `HomeVisualHero` / `VisualArchive` / `GraphArtifactCard`

### 속성 후보

- `candidate_status`: `pending_review`, `generation_blocked_not_pending_review`, `partial_blocked_by_higgsfield_credits` 등.
- `public_allowed`: 기본 `false`.
- `home_source_action`: `keep_current_final`, `promote_after_explicit_final_save`, `reject_or_wait` 중 하나.
- `quarantine_reason`: final 미승격, 에셋 미완성, source status 불확실, privacy boundary 미확정 등.
- `safe_public_preview_fields`: `title`, `theme`, `metaphor`, polish된 `why`.
- `admin_only_fields`: `model`, `source_path`, generation limitation summary, `prompt_policy`.
- `never_public_fields`: exact prompt, remote generation URL, raw operational log, raw delivery/job identifiers.

### 8월 acceptance 후보

- `pending_review` 또는 `partial_blocked_*` 후보가 public `/` HomeVisualHero payload에 들어가면 실패로 본다.
- public `/visuals` 기본 archive도 final/archived item만 기본 노출하고, pending/partial은 admin/private review queue에서만 다룬다.
- Graph card는 pending 후보를 “확정된 visual artifact”처럼 표현하지 않고 `NEEDS_VALIDATION` 또는 `HAS_RISK` 상태를 표시한다.
- 2026-08-01 final current still-only 3장은, 새 후보가 final 승격되기 전까지 public home source로 유지한다.

## 8월 구현 전 확인할 것

- 실제 저장소/workdir
- public/private scope
- `nodes.jsonl` / `edges.jsonl` 경로
- KuzuDB로 갈지, 파일 기반 MVP로 시작할지
- `/graph`를 공개 설명 페이지로 둘지 비공개 대시보드 탭으로 둘지
- `ResponsibleUXTrace`를 `/graph` 우선 카드로 둘지 `/growth`의 의사결정 카드 안에 먼저 넣을지
- `AgentRoleBoundaryTrace`를 `/graph`의 설명 카드로 먼저 둘지 `/growth`의 판단 로그 카드로 먼저 넣을지
- `VisualPromotionQuarantineGate`를 `HomeVisualSetAdapter`의 필수 source-status gate로 둘지 admin review route의 별도 adapter로 둘지

## 2026-07-29 후보 — HomeVisualGraphBridge

Go Youn-jung의 최신 `final_current` HomeVisualHero 3장 세트를 Graph MVP의 `Artifact` 노드 후보로 삼는다. 홈(`/`)과 시각 아카이브(`/visuals`)가 같은 시각 데이터를 쓰는 것에 더해, `/graph`에서는 해당 Artifact가 어떤 Theme/Insight/Decision/RiskReview와 연결되는지 relation breadcrumb로 보여준다.

### 기준 소스

- Canonical source: `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json`
- 현재 lead: `Soft Taxonomy Keystone`
- 현재 supporting: `Warm Value Loaf`, `Soft Quality Anvil`
- required status: `final_current`

### 노드/관계 후보

`Artifact(HomeVisualHero item)` → `BELONGS_TO_THEME` → `Theme`
`Artifact(HomeVisualHero item)` → `INTERPRETED_AS` → `Insight`
`Artifact(HomeVisualHero item)` → `FEEDS` → `HomeVisualHero` / `VisualArchive`
`Artifact(HomeVisualHero item)` → `VALIDATED_BY` → `RiskReview`

### 공개/비공개 필드 후보

- 공개 카드: `title`, `theme`, `metaphor`, `metaphor_family`, polish된 `why`, `home_placement`, 안전한 asset reference.
- 비공개/admin 접힘: `model`, `source_path`, `turntable_video_asset_path`, `prompt_policy`, `prompt_visibility`, `private_prompt_path`.
- 공개 금지: exact prompt, raw 운영 로그, credentials, raw 전달 ID, 비공개 경로의 무제한 노출.

### 8월 acceptance 후보

- `canonical_status != final_current`인 시각 항목은 public `/` 또는 public `/graph` Artifact card에 들어가면 실패로 본다.
- 초기 UI는 force-directed graph가 아니라 `시각 아티팩트 → 테마 → 판단 의미 → 검증 상태` breadcrumb 카드로 제한한다.
- `private_prompt_path`와 `source_path`는 기본 접힘/비공개 모드에서만 다룬다.

## 2026-07-30 후보 — PartialHomeVisualDecisionTrace

최신 홈 시각 세트가 credit 제약으로 2장 partial current가 되었으므로, Graph MVP에는 완성된 아티팩트뿐 아니라 “왜 2장만 최신 홈 후보가 되었는가”라는 운영 판단도 안전하게 연결할 필요가 있다.

### 노드/관계 후보

`Artifact(HomeVisualHero partial set)` → `HAS_RISK` → `RiskReview(credit_dependency)`

`Decision(Chris explicit save partial)` → `APPROVED_BY` → `Artifact(HomeVisualHero partial set)`

`Artifact(Soft Relation Keel / Value Tasting Spoon)` → `FEEDS` → `HomeVisualHero` / `VisualArchive`

### 속성 후보

- `completion_state`: `approved_partial_2`
- `canonical_status`: `final_current_partial_2_of_3_due_to_higgsfield_credits`
- `public_claim`: 최신 시각 시스템 중 승인된 2개 아티팩트가 관계 안정성과 가치 판단을 보여준다.
- `admin_dependency_note`: credit 제약으로 3번째 후보는 홈/public card에서 제외한다.
- `validation_status`: `WATCH` 또는 구현 전 미검증 상태로 시작한다.

### 수정된 acceptance 후보

- 기존 `canonical_status != final_current` 차단 규칙은 8월에 더 정교화한다. `pending_review`는 실패로 보되, Chris가 명시 저장한 `final_current_partial_*`는 별도 allowed 상태로 둘 수 있다.
- public `/graph`에는 credit 세부 운영 로그를 드러내지 않고, admin/private drawer에 dependency로 접는다.

## 2026-07-31 후보 — HomeVisualStillOnlyGraphContract

최신 canonical 홈 시각 세트가 다시 3장 final 구성으로 회복되었지만, 이번 저장은 turntable MP4 없이 still-only resource로 확정되었다. Graph MVP와 홈/아카이브 UI는 “3장 완성 여부”와 “비디오 가능 여부”를 분리해서 다뤄야 한다.

### 기준 소스

- Canonical source: `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json`
- current status: `final_current_stills_only_no_turntables`
- lead: `Soft Evidence Keystone`
- supporting: `Context Field Notebook`, `Trust Envelope Cushion`
- media: 3 stills + 0 turntable MP4

### 노드/관계 후보

`Artifact(Soft Evidence Keystone)` → `BELONGS_TO_THEME` → `Theme(Evidence / DecisionStructure)`

`Artifact(Context Field Notebook)` → `BELONGS_TO_THEME` → `Theme(Context / PrivacyMemory)`

`Artifact(Trust Envelope Cushion)` → `BELONGS_TO_THEME` → `Theme(Trust / ValueExchange)`

`Artifact(HomeVisualHero set)` → `FEEDS` → `HomeVisualHero` / `VisualArchive` / `GraphArtifactCard`

### 속성 후보

- `completion_state`: `complete_3_stills_only`
- `canonical_status`: `final_current_stills_only_no_turntables`
- `media_capability`: `still_only`
- `detail_video_status`: `unavailable`
- `detail_media_fallback`: `key_screen_asset_path -> hires_still_path`
- `prompt_visibility`: `hidden_by_default`
- `public_claim`: 근거, 맥락, 신뢰가 Chris의 판단 구조를 지탱하는 최신 홈 시각 시스템이다.
- `validation_status`: `unreviewed` 또는 Muyeol 검증 전 `WATCH`

### 8월 acceptance 후보

- `turntable_video_asset_path`가 없는 final item도 실패로 처리하지 않는다. 단, detail drawer는 still fallback을 명시적으로 사용해야 한다.
- public UI에서는 비디오 부재를 error처럼 표현하지 않는다.
- exact prompt, source path, private prompt path, 운영 메타데이터는 기본 접힘/admin-only로 유지한다.

## 2026-08-01 후보 — AugustScopeLockGate

8월부터 구현은 가능하지만, Chris/Karina의 repo/workdir, public/private/admin scope, data exposure rule, 첫 구현 우선순위, graph MVP storage 방식이 잠기기 전에는 앱 저장소를 수정하지 않는다. 첫 구조 후보는 실제 UI보다 `Harness`의 안전한 진입 게이트다.

### 목적

`AugustScopeLockGate`는 `Harness / Loop / Graph Engineering`의 첫 implementation gate다. 루프 산출물을 웹앱이 읽기 전에 어떤 데이터가 public narrative, private dashboard, admin troubleshooting에 들어갈 수 있는지 잠근다.

### 결정 필드 후보

- `repo_workdir`: 구현 대상 저장소/작업 디렉터리. 확정 전 `unconfirmed`.
- `public_scope`: 공개 홈/공개 그래프 카드에 허용되는 polish된 필드.
- `private_scope`: Chris 개인 dashboard에서 접힘으로 볼 수 있는 필드.
- `admin_scope`: 운영 검증과 troubleshooting에만 허용되는 필드.
- `allowed_home_statuses`: `final_current`, `final_current_stills_only_no_turntables`, 승인 여부를 확인해야 하는 partial status.
- `graph_mvp_storage`: 초기값 후보는 `files_first`; KuzuDB/Neo4j는 추후 평가.
- `first_week_limit`: read-only data contract, privacy matrix, source status gate, still-only fallback gate.

### 첫 주 acceptance 후보

- repo/scope lock 없이 route, graph, visual, research, growth, admin을 동시에 구현하지 않는다.
- `pending_review`, exact prompt, remote generation URL, raw 운영 로그, raw delivery/job identifiers는 public UI와 기본 graph data에서 제외한다.
- Graph MVP의 첫 표현은 force-directed network가 아니라 `Artifact → Theme → Insight/RiskReview` breadcrumb 카드로 제한한다.
- `HomeVisualSetAdapter`는 `source_status`, `completion_state`, `media_capability`, `detail_video_status`, `detail_media_fallback`, `prompt_visibility`, `public_allowed`를 출력해야 한다.
