# IA 및 라우트 후보

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## 라우트 후보

- `/` — Chris의 Hermes 성장 여정을 위한 공개 narrative 홈페이지. 기본 홈 구성은 최신 Go Youn-jung 일일 시각 루프를 editorial hero / 오늘의 시각 시스템으로 사용해야 한다.
- `/agents` — 프로필 이미지와 역할 카드를 활용한 에이전트 팀 소개
- `/research` — 주간/일일 3+3 리서치 아카이브
- `/growth` — Son SNS 성장 루프와 실험
- `/growth/decision-log` — 공개 안전 의사결정 로그 타임라인/카드 뷰. `/growth` 안의 bento 섹션으로 들어갈 수도 있다.
- `/obd` — OBD insight map과 ontology/business/design 종합
- `/graph` — Harness / Loop / Graph Engineering 설명과 지식 그래프 후보. 초기에는 네트워크 시각화보다 카드 + 관계 breadcrumb로 ResearchItem → Insight → GrowthQuestion → Decision → Artifact 흐름을 보여준다.
- `/대시보드` — 지표, 로그, 후보를 위한 비공개/관리자 bento 대시보드

## IA 원칙

공개 storytelling과 비공개 운영 데이터를 분리한다. 공개 페이지는 polish된 narrative를 보여주고, 대시보드는 더 풍부한 로그와 후보를 노출할 수 있다.

프로젝트 설명은 홈 또는 `/graph`에서 세 층으로 분명히 붙인다: **Harness**는 에이전트/도구/권한을 묶는 실행 기반, **Loop**는 매일·매주 반복되는 리서치·성장·시각·검증 리듬, **Graph Engineering**은 그 산출물을 노드와 관계로 연결해 Chris의 사고와 판단을 축적하는 구조다.
