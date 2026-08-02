# 이미지 갤러리 탭 후보 — Go Youn-jung 시각 루프

## 목적

미래 Hermes/OBD 웹앱에 Pinterest형 시각 탭을 추가해 Chris가 매일 생성되는 Go Youn-jung Higgsfield 이미지를 진화하는 디자인 영감 아카이브로 탐색할 수 있게 한다.

## 소스

- 1차 소스: `/opt/data/agent-team-work-log/visuals/daily-graphics/`
- 웹앱 준비 에셋 미러: `/opt/data/hermes-webapp-build-loop/assets/image-gallery/YYYY-MM-DD/`
- 웹앱 메타데이터 피드: `/opt/data/hermes-webapp-build-loop/data/image-gallery/items.jsonl` 및 `YYYY-MM-DD.json`

## IA 후보

- 최상위 탭: `Images` 또는 `시각 아카이브`
- 라우트 후보: `/visuals`
- 하위 필터: 날짜, 테마, 은유 계열, 에이전트, 모델, 품질 상태
- 기본 레이아웃: 1:1 이미지 카드가 있는 Pinterest 스타일 masonry 대시보드

## 카드 모델

각 이미지 카드는 다음을 포함한다:

- 이미지 썸네일
- 제목
- 날짜
- 테마 색상 계열
- 은유 라벨
- 소스 에이전트: Go Youn-jung
- 사용 모델
- 프롬프트는 기본 숨김

## 클릭 인터랙션

Chris가 카드를 클릭하면 디테일 drawer/modal을 연다:

- 기본 그리드는 **1080px 정적 still**만 보여준다. masonry grid에서는 비디오를 autoplay하지 않는다.
- 디테일 뷰는 사용 가능할 때 메인 미디어를 `turntable_video_asset_path`로 교체한다.
- 비디오 동작: `autoplay muted loop playsinline`, 1:1, object centered.
- 디테일 콘텐츠:
  - 제목
  - 짧은 은유 설명
  - `왜 이 이미지인가` bullets
  - 모델 / 생성 체인
  - 소스 날짜와 저장 경로
  - 팔레트/테마 메타데이터
  - 프롬프트 정책과 비공개 프롬프트 가용 상태
- 닫기 동작: 보이는 `X` 버튼은 still-card grid로 돌아간다. Escape/backdrop은 보조 닫기 affordance로 지원할 수 있다.
- 프롬프트 처리: 정확한 프롬프트는 추적/관리자 용도로 `private_prompt_path`에 저장하지만, Chris가 명시적으로 공개를 요청하지 않는 한 기본 Chris 디테일 UI에서는 렌더링하지 않는다.
- Fallback: turntable MP4가 없거나 실패하면 `webapp_asset_path` still을 보여주고, 선택적으로 `loop_video_asset_path`를 보조 미디어로 노출한다.

## 근거 bridge 후보

각 카드가 갤러리를 원시 로그 뷰어로 만들지 않으면서도 리서치, SNS/growth, OBD 소스 refs와 선택적으로 연결될 수 있도록 작은 `VisualEvidenceBridge` layer를 추가한다.

- 공개 masonry 카드: 이미지, 제목, 날짜, 테마, 은유만.
- 비공개/디테일 drawer: `왜 이 이미지인가`, 은유 계열, 연결된 research refs, 연결된 growth refs, source-access confidence, 모델, 프롬프트 숨김 정책.
- 2026-07-22의 예시 source hook: AI-generated brand-language semantic consistency, accessibility as operating infrastructure, agent privacy decisions via logical entailment, 공개 안전 decision-log structure.
- 거버넌스: 원시 프롬프트와 운영 로그는 기본 숨김으로 유지한다. 공개 근거는 prompt log를 복사하지 않고 polish된 내러티브로 다시 써야 한다.

## 프라이버시 / 범위

- 정확한 프롬프트는 기본 비공개로 취급한다.
- 공개 버전에서 raw 토큰, bot IDs, prompt logs, 비공개 운영 경로를 노출하지 않는다.
- 공개 버전은 polish된 이미지 + 짧은 근거를 보여줄 수 있고, 비공개 대시보드는 더 풍부한 메타데이터를 보여줄 수 있다.

## 현재 seed 세트

현재 홈 seed 세트: Go Youn-jung의 2026-07-22 refined 3-image set. `data/image-gallery/2026-07-22.json`에 미러링되어 있으며 홈페이지 `HomeVisualHero`에 적합하다:

1. Lantern Guidance
2. Key Possibility
3. Anchor Stability

이전 seed 세트: Go Youn-jung의 차분하게 재생성된 2026-07-21 세트:

1. Blue Modular Archive Cabinet
2. Mint Calibration Lamp
3. Violet Rounded Decision Cushion

## 구현 백로그 후보

- `data/image-gallery/items.jsonl`을 읽는 로컬 어댑터를 만든다.
- 앱 build/runtime에서 정규화된 gallery items를 생성한다.
- Masonry grid: CSS columns 또는 variable card heights를 가진 responsive grid.
- Detail drawer/modal은 카드 클릭 시 열리고 근거를 보여준다.
- “copy prompt”는 비공개/관리자 모드에서만, Chris 승인 후에만 추가한다.
- source-link chips는 연결된 각 research/growth 항목에 민감하지 않은 URL/DOI/path와 source-access confidence label이 있을 때만 추가한다.
