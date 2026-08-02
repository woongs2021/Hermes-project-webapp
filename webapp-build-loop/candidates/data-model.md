# 데이터 모델 후보

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## 엔티티 후보

- `AgentProfile`: 역할, 톤, 아바타 경로, 공개 bio, capabilities, handoff rule
- `ResearchItem`: 출처, 제목, 링크/DOI, 담당 에이전트, 관련성 메모, 검증 상태
- `GrowthSignal`: Hermes 사용 순간, SNS 각도, 구독자 가설, 관찰된 지표
- `OBDInsight`: ontology/business/design insight, supporting evidence, product implication
- `Build후보`: 기능 아이디어, 데이터 소스, 구현 복잡도, 리스크, 가치
- `DecisionMoment`: 날짜, source lane, before/after state, agent intervention, share angle, 프라이버시 레벨, later 지표
- `RoleJudgmentMap`: 에이전트 역할, 위임 작업, 개선된 Chris 판단, handoff 경계, 프라이버시 레벨, 근거 refs
- `PublicSafeDecisionLog`: 추상화된 상황, 관여한 에이전트 역할, 좁혀진 선택지, Chris의 최종 기준, 다음 관찰, 공개/비공개 분리, 소스 refs, 지표 placeholder
- `VisualEvidenceBridge`: 이미지 갤러리 item id, 공개 rationale summary, metaphor family, linked research refs, linked growth refs, 공개/비공개 display level, prompt visibility, governance note
- `VisualArchiveMedia`: 이미지 갤러리 item id, 1080px still path, high-res still path, 선택적 micro-loop MP4 path, 선택적 turntable MP4 path, private prompt bundle path, prompt visibility policy, media behavior, fallback order
- `GraphNode`: `Agent`, `ResearchItem`, `Theme`, `Insight`, `GrowthQuestion`, `Artifact`, `Decision`, `RiskReview` 등 그래프 MVP의 노드 단위. 안정 ID, 공개/비공개 레벨, 검증 상태, source refs를 포함한다.
- `GraphEdge`: `FOUND`, `SUPPORTS`, `INTERPRETED_AS`, `TRANSLATED_INTO`, `VALIDATED_BY`, `HAS_RISK`, `APPROVED_BY`, `FEEDS`, `BELONGS_TO_THEME` 등 노드 간 의미 관계. 관계 근거, 날짜, source agent, confidence를 포함한다.

## 알려진 로컬 데이터 소스

- 일일 업무/대화 wiki: `/opt/data/daily-work-log/`
- 에이전트 팀 작업 로그: `/opt/data/agent-team-work-log/`
- Son SNS 루프: `/opt/data/hermes-growth-sns-loop/`
- 에이전트 프로필 이미지: `/opt/data/agent-team-assets/profile-images/`

## 열린 질문

- 8월 실제 웹앱은 어떤 저장소/workdir에서 호스팅할 것인가?
- 주요 publishing channel은 비공개 대시보드, 공개 홈페이지, 또는 둘 다인가?
- 그래프 MVP는 먼저 `nodes.jsonl`/`edges.jsonl` 파일 기반으로 시작할 것인가, 아니면 KuzuDB/Neo4j까지 포함할 것인가?

## 2026-07-20 후보 디테일: DecisionMoment

Hermes 성장 narrative proof를 위한 가장 작은 재사용 단위로 사용한다. 공개 페이지는 polish된 Before/After 이야기를 보여줄 수 있고, 비공개 대시보드 뷰는 운영 맥락, source lane, validation status, later SNS 지표를 분리해 보존할 수 있다.

## 2026-07-21 후보 디테일: RoleJudgmentMap

Hermes 에이전트 팀 구조를 공개/비공개 역할 온톨로지로 전환하는 데 사용한다. 공개 surface는 각 역할이 Chris의 판단 품질을 어떻게 개선하는지 설명할 수 있고, 비공개 대시보드 view는 raw internal logs를 노출하지 않으면서 위임 작업 details, handoff boundaries, source lane, evidence references를 보존할 수 있다.

## 2026-07-22 후보 디테일: PublicSafeDecisionLog

Son의 공개 안전 “decision log” SNS 구조를 재사용 가능한 웹앱 데이터로 변환하는 데 사용한다. 공개 페이지는 추상화된 상황, 역할 도움, 좁혀진 선택지, Chris가 소유한 기준, 다음 관찰만 보여준다. 비공개 대시보드 view는 source lane, internal context note, evidence references, later 지표 placeholders를 보존할 수 있지만 raw Slack/Telegram context, private IDs, unvalidated performance claims는 노출하지 않아야 한다.

## 2026-07-22 후보 디테일: VisualEvidenceBridge

이미지 갤러리 / 시각 아카이브 탭을 장식이 아니라 1급 구조로 만들기 위해 사용한다. 각 이미지 카드는 masonry grid에서는 가볍게 유지하면서, click drawer에서는 `왜 이 이미지인가`를 민감하지 않은 research refs, growth-loop refs, metaphor family, prompt-hidden policy, governance notes와 연결할 수 있다. 공개 surface는 polish된 rationale만 노출해야 하고, 비공개 대시보드 view는 Chris/Karina가 데이터 노출 규칙을 승인한 뒤 더 풍부한 source link를 보존할 수 있다.

## 2026-07-26 후보 디테일: GraphNode / GraphEdge

Hermes/OBD 웹앱을 하네스·루프·그래프 엔지니어링으로 설명하기 위한 핵심 데이터 모델이다. 하네스는 에이전트와 도구를 안전하게 묶는 운영 기반, 루프는 반복 작업 리듬, 그래프 엔지니어링은 루프 산출물을 지식/판단 관계로 연결하는 구조다. 1차 구현 후보는 `nodes.jsonl`과 `edges.jsonl` 파일 기반 MVP이며, 이후 필요하면 KuzuDB 또는 Neo4j로 확장한다. 자세한 노드/관계 후보는 `candidates/graph-engineering.md`를 기준으로 한다.
