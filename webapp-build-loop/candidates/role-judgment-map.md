# RoleJudgmentMap 후보

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## 목적

Chris의 Hermes 에이전트 팀 구조를 미래 웹앱/대시보드에서 재사용할 수 있는 온톨로지로 정규화한다. 단순히 “에이전트가 누구인가”가 아니라, 각 역할이 Chris가 어떤 판단을 더 선명하게 다듬도록 돕는지를 표현한다.

## 후보 스키마

- `date_kst`: 관찰 또는 소스 날짜.
- `agent_role`: 공개 안전 역할명. 예: Karina, Son, Faker, Go Youn-jung, Muyeol, Yuna.
- `delegated_work_public`: 외부에 보여줄 수 있는 간결한 책임 설명.
- `delegated_work_private_note`: 공개 페이지에 들어가면 안 되는 운영/비공개 디테일.
- `improved_chris_judgment`: 그 역할이 있기 때문에 Chris가 더 명확히 소유할 수 있는 판단.
- `handoff_boundary`: 해당 역할이 Chris, Karina, 또는 다른 specialist에게 넘겨야 하는 시점.
- `source_lane`: Hermes Growth, SNS, Research, Visual, Governance, Webapp Planning.
- `privacy_level`: `public_summary`, `private_detail`, 또는 `internal_only`.
- `evidence_refs`: 비밀값이 아닌 소스 경로, URL, DOI, 또는 ID.

## 후보 라우트/컴포넌트

- `/agents`: 공개 안전 역할 카드와 판단 품질 요약.
- `/growth`: role-to-judgment 순간을 narrative proof로 사용.
- `/대시보드`: source lane, boundary, evidence, 구현 status를 가진 비공개 bento cards.
- 컴포넌트: `AgentCard`, `RoleOntologyCard`, `JudgmentBoundaryBadge`, `EvidenceRefList`.

## 소스 신호

- 2026-07-21 Son Hermes-growth SNS 루프: 공개 안전 3열 표 `role → 위임 작업 → 개선된 Chris 판단`.
- 2026-07-21 논문 후보: mobile GUI decision benchmark, conversational tactile data interfaces, accessibility workflow-support 항목은 모두 역할 분리, recoverability, workflow support, clear responsibility boundaries의 가치를 강화한다.

## 프라이버시 guardrail

공개 surface는 역할 가치를 추상 수준에서 설명해야 한다. 비공개 대시보드 surface는 더 풍부한 운영 메모를 보존할 수 있지만 raw private IDs, 비밀값, 원시 로그, 민감한 내부 대화 텍스트는 피해야 한다.
