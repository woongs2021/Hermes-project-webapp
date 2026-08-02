# 컴포넌트 시스템 후보

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## 컴포넌트 후보

- `HomeVisualHero`: 최신 Go Youn-jung 3장 시각 세트를 홈페이지 editorial hero로 사용; lead 카드 1개 + supporting 카드 2개
- `HomeVisualCard`: 정적 1080 이미지 still, 제목, 은유 계열, 테마 색상, 공유 디테일 drawer 열기
- `AgentCard`: 아바타, 역할, 전문성, 목소리/톤, handoff 대상
- `SignalCard`: 일일 성장 신호, SNS 각도, OBD 함의
- `ResearchPickCard`: 제목, 출처, 중요한 이유, 검증 상태
- `Timeline`: 날짜별 Hermes 성장 여정
- `BentoMetricCard`: 사용 가능할 때 구독자/팔로워/저장/댓글 지표
- `InsightMap`: OBD 개념 클러스터와 근거 링크
- `RoleOntologyCard`: 에이전트 역할, 위임 작업, 개선된 Chris 판단, handoff 경계, 프라이버시 레벨
- `JudgmentBoundaryBadge`: 공개 안전 vs 비공개/내부 전용 역할 디테일을 나타내는 compact label
- `VisualMasonryCard`: 썸네일, 제목, 날짜, 테마, 은유만 보여주는 Pinterest형 이미지 카드
- `WhyThisImageDrawer`: 클릭 시 `왜 이 이미지인가`, 근거 refs, 모델, 소스 에이전트/날짜, 프롬프트 숨김 정책을 보여주는 디테일 패널
- `SourceConfidenceBadge`: full paper / metadata only / snippet only / private-only 출처 신뢰도를 나타내는 compact label

## 시각 방향

woongdesignv2 토큰을 사용하는 clean high-end SaaS/bento admin UI. rounded cards, soft shadows, generous spacing, restrained typography를 사용한다. 전형적 neon/glassmorphism은 피한다.
