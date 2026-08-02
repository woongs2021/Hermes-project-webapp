# Hermes 웹앱 빌드 루프 스키마

루트: `/opt/data/hermes-webapp-build-loop/`

목적: Chris의 미래 Hermes/OBD 대시보드와 홈페이지 작업을 위해 Faker의 일일 웹앱 코딩 구조 계획 데이터를 축적한다. 이 프로젝트는 **하네스(Harness) / 루프(Loop) / 그래프 엔지니어링(Graph Engineering)** 세 층으로 설명한다.

## 프로젝트 설명: Harness / Loop / Graph Engineering

- **Harness / 하네스**: Karina, Yuna, Go Youn-jung, Son, Faker, Muyeol과 Hermes 도구·크론·파일 시스템을 안전하게 묶는 운영 기반이다. 권한, 라우팅, 공개/비공개 경계, delivery rule을 포함한다.
- **Loop / 루프**: 매일·매주 반복되는 리서치, 성장 질문, 시각 생성, 웹앱 구조 계획, 검증 리듬이다. Yuna/Go Youn-jung/Son/Faker/Muyeol의 결과가 날짜별로 축적된다.
- **Graph Engineering / 그래프 엔지니어링**: 루프 결과를 단순 Markdown/JSONL 로그가 아니라 `Agent`, `ResearchItem`, `Insight`, `GrowthQuestion`, `Artifact`, `Decision`, `RiskReview`, `Theme` 같은 노드와 `SUPPORTS`, `TRANSLATED_INTO`, `VALIDATED_BY`, `FEEDS` 같은 관계로 연결하는 지식/판단 구조다.

처음에는 `nodes.jsonl` + `edges.jsonl` + `schema.md` 형태의 파일 기반 그래프 MVP로 시작하고, 필요하면 KuzuDB 또는 Neo4j로 확장한다. 상세 후보는 `candidates/graph-engineering.md`에 유지한다.

## 7월 모드: 데이터 구조 + 구현 후보만

2026-07-31 KST까지 Faker는 Chris가 현재 대화에서 명시적으로 요청하지 않는 한 프로덕션 애플리케이션 코드를 작성하거나, 저장소를 수정하거나, 배포 가능한 앱을 만들거나, 구현을 시작하면 안 된다.

7월에 허용되는 산출물:
- 정보구조 후보
- 데이터 모델 후보
- 기능/모듈 후보
- UI/컴포넌트 구조 후보
- 기술 스택 가정과 트레이드오프
- 구현 백로그 후보
- 리스크, 의존성, 열린 질문
- 8월 코딩을 위한 재사용 가능한 데이터셋 항목

## 8월 모드: 구현 시작 가능

2026-08-01 KST부터 Faker는 축적된 후보를 구체적인 구현 계획으로 전환할 수 있고, Chris/Karina가 요청하면 선택된 저장소/workdir에서 코딩을 시작할 수 있다.

## 디렉터리 구조

- `daily/YYYY-MM-DD.md` — 일일 DM 브리핑과 구조화된 계획 기록
- `events.jsonl` — 일일 계획 이벤트마다 JSON 객체 1개
- `candidates/` — 계속 발전하는 후보 명세
  - `data-model.md`
  - `ia-and-routes.md`
  - `component-system.md`
  - `home-screen-layout.md`
  - `image-gallery-tab.md`
  - `graph-engineering.md` — Harness / Loop / Graph Engineering 프로젝트 설명과 그래프 노드/관계 MVP 후보
  - `why-hermes.md` — Hermes를 하네스로 선택한 이유와 웹앱 프로젝트 소개용 요약 후보
  - `implementation-backlog.md`
- `august-readiness.md` — 구현 시작을 위한 종합 준비 체크리스트

## 일일 기록 필드

각 일일 노트에는 다음을 포함한다:
- KST 날짜
- 단계: 7월 계획 전용 또는 8월 구현 준비
- 오늘의 웹앱 구조 브리프
- 데이터 구조 후보
- 구현 후보
- OBD/Hermes-growth 재사용 메모
- 코딩 리스크 / 의존성
- Chris에게 요청할 10분 결정 또는 관찰

## 프라이버시 / 안전

- 비밀값, 토큰, OAuth 값, 원시 비공개 ID, 자격 증명을 저장하지 않는다.
- 필요한 경우에만 유용한 경로, 소스 파일명, 민감하지 않은 ID를 보존한다.
- 나중에 소셜/SNS 성과를 참조하더라도 개인 식별자가 없는 지표만 저장한다.

## 이미지 갤러리 피드

미래 Pinterest형 시각 아카이브 탭에 들어갈 Go Youn-jung의 일일 그래픽은 여기에 미러링한다:

- 에셋: `assets/image-gallery/YYYY-MM-DD/*.png`
- 메타데이터: `data/image-gallery/items.jsonl`
- 일일 번들: `data/image-gallery/YYYY-MM-DD.json`

필수 항목 필드:

- `id`
- `date_kst`
- `agent`
- `title`
- `theme`
- `metaphor`
- `why` — 카드 클릭 시 보여줄 근거 bullet 배열
- `model`
- `webapp_asset_path` — 대시보드 그리드에서 기본으로 쓰는 1080px 정지 이미지
- `display_mode`
- `interaction`
- `prompt_policy`

Go Youn-jung 최종 시각 세트를 위한 선택적 리치 미디어 필드:

- `hires_still_path` — 디테일/다운로드용 원본 또는 고해상도 정지 이미지
- `loop_video_asset_path` — 가벼운 로컬 마이크로 루프 fallback
- `turntable_video_asset_path` — 사용 가능할 때 디테일 뷰의 우선 MP4 미디어
- `detail_view` — 카드 클릭/열기/닫기와 메타데이터 표시 여부를 위한 인터랙션 설정
- `private_prompt_path` — 관리자/디테일 데이터용 비공개 프롬프트 번들 경로
- `prompt_visibility` — 기본 프롬프트 렌더링 규칙; Chris가 명시적으로 요청하지 않는 한 정확한 프롬프트는 숨김

웹앱은 기본적으로 1080px 정지 이미지 카드를 보여줘야 한다. 카드 클릭 시 제목, 설명/근거, 상세 메타데이터, 사용 가능한 경우 turntable MP4(`autoplay muted loop playsinline`)가 포함된 디테일 drawer/modal을 연다. `X`를 누르면 디테일 뷰를 닫고 정지 카드 그리드로 돌아가야 한다. 정확한 프롬프트는 추적 가능성을 위해 비공개 메타데이터에 저장하되, Chris가 공개를 요청하지 않는 한 Chris/default 디테일 UI에서는 숨긴다.
