# 구현 백로그 후보

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## 후보 백로그

1. 로컬 데이터 소스를 인벤토리화하고 안전한 읽기 전용 어댑터를 정의한다.
2. 프로필 이미지 manifest를 타입이 있는 에이전트 프로필 데이터셋으로 정규화한다.
3. Son SNS 루프 JSONL을 성장 신호로 변환한다.
4. 주간 리서치 로그를 리서치 픽 카드로 변환한다.
5. 공개/비공개 라우트 분리를 정의한다.
6. 프로젝트 설명을 Harness / Loop / Graph Engineering 3층 구조로 정리하고 홈 또는 `/graph` 진입부에 반영한다.
7. 파일 기반 그래프 MVP(`nodes.jsonl`, `edges.jsonl`, `schema.md`) 후보를 설계한다.
8. `ResearchItem → Insight → GrowthQuestion → Decision → Artifact` 관계 breadcrumb를 보여주는 `/graph` 카드형 탭을 후보로 둔다.
9. 기술 스택과 저장소 위치를 선택한다.
10. 8월에 정적 프로토타입을 만든다.
11. 정적 IA가 안정된 뒤 대시보드 데이터 ingest를 추가한다.
12. `DecisionMomentAdapter`를 만들어 Son SNS 일일 노트를 공개/비공개 카드 데이터로 변환한다.
13. `RoleJudgmentAdapter`를 만들어 Son의 역할/판단 표 프롬프트를 `/agents`, `/growth`, 비공개 대시보드 bento 카드용 `RoleJudgmentMap` 항목으로 변환한다.
14. `DecisionLogAdapter`를 만들어 Son의 공개 안전 5문장 의사결정 로그를 `PublicSafeDecisionLog` 항목으로 변환하고 `DecisionMoment`, `RoleJudgmentMap`, 추후 SNS 지표 placeholder와 연결한다.
15. `HomeVisualHero` + `/visuals`를 위한 `VisualDetailDisclosure` 정규화기와 공유 drawer 계약을 만들고, privacy-tier gating과 정지 이미지→비디오 fallback을 포함한다.
16. `VisualSourceStatusGate`를 추가해 `final_current`, `archived_final`, `pending_review`, `fallback` 상태를 정규화하고, `/` 홈 canonical 데이터와 `/visuals` 아카이브/관리자 preview 경계를 분리한다.
17. `VisualReviewQueue`를 추가해 `pending/YYYY-MM-DD.json`의 Go Youn-jung 후보를 비공개/admin preview로만 보여주고, Chris final-save 또는 finalizer 승격 전에는 `HomeVisualHero`와 public `/visuals` 기본 archive에 섞이지 않게 한다.
18. `AgentRoleBoundaryTrace` graph card를 추가해 업무용/인간형 AI 에이전트 신호를 `role_boundary`, `human_responsibility`, `user_control_point`, `organization_adoption_lens`, `brand_privacy_risk`로 정규화한다.
19. `HomeVisualGraphBridge`를 추가해 latest final HomeVisualHero 3장을 Graph MVP `Artifact` 노드와 `/graph` breadcrumb 카드로 연결한다.

## 2026-07-25 8월 10단계 세분화 후보

초기 구현은 scope creep을 줄이기 위해 1주차를 다음 순서로 제한한다.

- Phase 1: Scope Lock & Repo/Deployment Decision — repo/workdir, 공개/비공개/admin 범위, 배포 표면, 데이터 노출 규칙 확정.
- Phase 2: Data Inventory & Privacy Boundary — 로컬 소스 목록, public/private/admin field matrix, pending/final source status 계약 작성.
- Phase 3: Data Contract & Local Content Pipeline — read-only JSON/JSONL adapter, canonical fallback, validation errors.
- Phase 4: Web App Foundation / Design System Shell — woongdesignv2 토큰 기반 shell, routes, bento layout foundation.
- Phase 5: HomeVisualHero — latest final 3-image set, 1 lead + 2 supporting cards, static still first.
- Phase 6: VisualDetailDisclosure — shared drawer, rationale-first view, metadata collapse, prompt hidden policy.
- Phase 7: Visual Archive — Pinterest-like masonry `/visuals`, filters, archive drawer reuse.
- Phase 8: Research/Paper Archive — weekly best-3와 source confidence card.
- Phase 9: Son Growth/SNS + OBD Dashboard — DecisionMoment, RoleJudgmentMap, PublicSafeDecisionLog cards.
- Phase 10: Admin Review/Governance/Deployment Ops — pending review, QA checks, privacy lint, deployment handoff.

## 8월 준비 체크리스트

- [ ] 저장소/workdir 확인
- [ ] 공개 vs 비공개 범위 확인
- [ ] 초기 라우트 세트 확인
- [ ] 디자인 토큰 출처 확인
- [ ] 데이터 ingest 경계와 프라이버시 규칙 확인
- [ ] 어떤 `DecisionMoment` 필드가 공개 홈페이지 재사용에 안전한지 확인
- [ ] `RoleJudgmentMap`을 위한 공개 안전 에이전트 역할 bio, 위임 작업 요약, handoff 경계 확인
- [ ] `PublicSafeDecisionLog` 필드 경계 확인: 공개 `/growth`에 표시 가능한 것, 비공개 drawer에 남길 것, 개인 식별자 없이 저장 가능한 SNS 지표
