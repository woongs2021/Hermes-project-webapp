# 홈 화면 레이아웃 후보 — Go Youn-jung 시각 루프 우선

상태: 7월 계획 전용. 아직 프로덕션 구현 없음.

## 2026-07-22 Chris 방향

Chris는 Faker의 미래 홈 화면 구성이 Go Youn-jung의 새 일일 시각 루프를 주요 시각 앵커로 사용하기를 원한다. 이미지를 보조 갤러리 탭으로만 다루지 않는다.

## 기준 소스

- 현재 canonical 홈 세트: `/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json`
- 일일 시각 피드/아카이브 지원: `/opt/data/hermes-webapp-build-loop/data/image-gallery/items.jsonl`
- 날짜별 시각 세트: `/opt/data/hermes-webapp-build-loop/data/image-gallery/YYYY-MM-DD.json`
- 에셋: `/opt/data/hermes-webapp-build-loop/assets/image-gallery/YYYY-MM-DD/`
- 정확한 프롬프트: `private_prompt_path`를 통해 비공개/관리자 전용; 기본 숨김.

## 홈 IA 제안

라우트: `/`

1. **Hero / 오늘의 시각 시스템**
   - 최신 Go Youn-jung 3장 이미지 세트를 최상단 시각 경험으로 사용한다.
   - 큰 lead 카드: 첫 번째/최신 선택 이미지의 정지 이미지.
   - 보조 카드 2개: 나머지 이미지.
   - 텍스트: “오늘의 시각 은유가 Chris의 판단/성장/OBD 언어를 어떻게 보여주는가.”를 한 줄 내러티브로 간결하게 표현한다.

2. **왜 이 이미지인가 drawer/modal**
   - 홈 이미지 클릭 시 시각 아카이브와 같은 디테일 패턴을 연다.
   - 기본 그리드/카드는 정적 still을 유지하고, 디테일에서는 사용 가능할 때 `turntable_video_asset_path`를 재생할 수 있다.
   - 표시: 제목, 은유, `왜 이 이미지인가`, 모델, 날짜, 소스 에이전트, 프롬프트 숨김 정책.
   - 기본적으로 정확한 프롬프트는 보여주지 않는다.

3. **오늘의 작업 루프 Bento**
   - visual hero 아래/옆에 작은 bento 카드 배치:
     - Yuna / Go Youn-jung 리서치 신호
     - Son 성장 질문/SNS 각도
     - Faker 구조 후보
     - Muyeol 검증/리스크 메모
   - 각 카드는 더 깊은 아카이브 라우트로 연결하되, 홈은 원시 로그 벽이 아니라 큐레이션된 화면이어야 한다.

4. **시각 아카이브 진입점**
   - 작은 “전체 이미지 보기” 카드가 `/visuals`로 라우팅한다.
   - `/visuals`는 Pinterest형 아카이브로 유지하고, `/`는 최신 세트를 editorial 홈페이지 재료로 사용한다.

## 컴포넌트 후보

- `HomeVisualHero`: 최신 Go Youn-jung 이미지 카드 3장, 1 lead + 2 supporting 레이아웃.
- `HomeVisualCard`: 정적 1080 still, 제목, 은유 계열, 색상 테마.
- `WhyThisImageDrawer`: 근거 + 선택적 turntable 비디오를 가진 공유 디테일 drawer.
- `TodayLoopBento`: research/growth/build/validation용 compact 카드 4개.
- `ArchiveEntryCard`: `/visuals`로 가는 CTA.

## 디자인 방향

- woongdesignv2 절제감 사용: off-white canvas, 넉넉한 spacing, rounded cards, soft shadow, restrained typography.
- 이미지 카드는 Go Youn-jung의 solid-background 에셋에서 강한 색을 가져가도 되지만, 주변 UI는 차분하게 유지한다.
- neon/glassmorphism/전형적 AI 스타트업 미감은 피한다.
- 홈은 SaaS 지표 대시보드가 먼저가 아니라 큐레이션된 design memory system처럼 느껴져야 한다.

## 데이터 요구사항

홈에는 다음을 수행하는 `latest_visual_set` 어댑터가 필요하다:

- `data/image-gallery/final/current-home-visual-set.json`이 있으면 canonical 현재 set으로 읽는다.
- canonical pointer가 없을 때만 `data/image-gallery/items.jsonl` 또는 `YYYY-MM-DD.json`의 최신 날짜 그룹으로 fallback한다.
- lead 이미지와 supporting 이미지를 선택한다.
- 정적 still 경로 `webapp_asset_path`를 먼저 읽는다.
- `turntable_video_asset_path`는 디테일 뷰에서만 사용한다.
- `prompt_visibility`와 `prompt_policy`를 존중한다.
- 비디오가 없으면 우아하게 fallback한다.

## 2026-07-23 어댑터 / 신선도 후보

`HomeVisualSetAdapter`를 `/`의 소스 게이트로 추가한다:

- 1차 소스: `data/image-gallery/final/current-home-visual-set.json`.
- canonical pointer가 없을 때만 fallback: 최신 최종 `data/image-gallery/YYYY-MM-DD.json` 또는 날짜별로 묶은 `items.jsonl`.
- Chris가 최종 저장 phrase를 주거나 end-of-day finalizer가 변경 없는 no-feedback 세트를 저장하기 전까지 `data/image-gallery/pending/`을 홈페이지나 공개 시각 아카이브로 승격하지 않는다.
- 세트를 `HomeVisualHero`용 `{ lead, supporting[2] }`로 정규화한다.
- `source_status`, `is_pinned`, `asset_health`, `detail_video_health`를 추적해 UI가 “최신 최종”, “고정 대표”, “누락/fallback” 상태를 내부 로그 노출 없이 구분할 수 있게 한다.
- 후보 제품 질문: `/`이 항상 최신 최종 3장 세트로 자동 교체되어야 할까, 아니면 Chris가 대표 시각 시스템을 pin하고 새로운 세트는 `/visuals`에 계속 축적하게 해야 할까?

## 2026-07-23 Chris 결정 — 최신 최종 3장 자동 반영

Chris는 auto-latest 정책을 선택했다. 새 3장 이미지 세트가 최종되면 `data/image-gallery/final/current-home-visual-set.json`을 대체해 홈페이지 기준 소스가 되어야 한다.

구현 함의:

- 미래에 명시적 pin 모드가 요청되지 않는 한 `/`은 항상 최신 canonical 최종 3장 세트를 읽어야 한다.
- 검토 대기 파일은 Chris가 최종하거나 finalizer가 승격하기 전까지 제외한다.
- 승격 시 기존 `current-home-visual-set.json`을 교체하기 전에 `data/image-gallery/final/archive/` 아래에 아카이브한다.
- 활성 홈 세트는 `auto_replace_policy: latest_final_3_set_replaces_current_home_visual_set`을 노출해야 한다.

## 프라이버시 / 안전

- 공개 홈: polish된 이미지, 제목, 은유, 간결한 근거만.
- 비공개/관리자: 승인 후 소스 경로, 프롬프트 가용성, 연결 refs.
- 공개 홈에서 원시 프롬프트, 비공개 운영 경로, Telegram/Slack 맥락, 토큰, 원시 로그를 절대 노출하지 않는다.

## 2026-07-24 공유 drawer 후보 — VisualDetailDisclosure

`HomeVisualHero`와 `/visuals`를 위한 공유 click-through 계약으로 `VisualDetailDisclosure`를 추가한다:

- 홈 still 카드와 시각 아카이브 masonry 카드는 같은 디테일 drawer/modal을 연다.
- 첫 화면은 polish된 `왜 이 이미지인가` 근거를 우선하고, 운영 메타데이터는 기본 접힘 상태로 둘 수 있다.
- `source_status`를 사용해 검토 대기 시각 세트가 canonical 홈페이지 데이터로 오해되지 않게 한다.
- `prompt_policy`와 `prompt_visibility`는 명시하되, Chris가 비공개/관리자 공개를 요청하지 않는 한 정확한 프롬프트는 숨긴다.
- 선택적 Son/Muyeol bridge: raw notes를 노출하지 않고 action/result/risk/permission/recovery/responsibility 같은 안전한 성장 렌즈 필드를 붙인다.

## 2026-07-25 source status gate 후보 — VisualSourceStatusGate

`HomeVisualSetAdapter` 앞단에 `VisualSourceStatusGate`를 둔다:

- `/` 홈 canonical source는 `final/current-home-visual-set.json`의 `canonical_status: final_current`만 통과시킨다.
- `pending/YYYY-MM-DD.json`과 오늘 Go Youn-jung pending set은 planning/admin preview로만 읽고, public home/feed에는 자동 노출하지 않는다.
- `/visuals` archive는 `archived_final`과 `final_current`를 기본 노출하고, `pending_review`는 비공개/admin review toggle이 있을 때만 보여준다.
- public UI field는 `title`, `theme`, `metaphor`, polish된 `why`만 허용한다.
- private/admin field는 `model`, `source_path`, `webapp_asset_path`, `prompt_policy`, `prompt_visibility`, `private_prompt_path`, `source_status`처럼 추적용 메타데이터를 접힌 영역으로 둔다.
- 8월 첫 구현 acceptance: pending source가 홈 lead/supporting card로 섞이면 실패로 본다.

## 2026-07-26 admin preview 후보 — VisualReviewQueue

`VisualReviewQueue`는 `pending/YYYY-MM-DD.json`의 Go Youn-jung 후보를 홈 canonical으로 승격하기 전 확인하는 비공개/admin-only strip이다:

- `/`의 `HomeVisualHero`는 `final/current-home-visual-set.json`만 읽고, queue는 별도 섹션 또는 admin route에서만 보인다.
- queue card는 `title`, `theme`, `metaphor_family`, `why`, `source_status`, `credit_tier`, `prompt_policy`를 보여주되 정확한 prompt와 raw 운영 로그는 숨긴다.
- Chris final-save phrase 또는 finalizer 승격 후에만 final/current와 public `/visuals` 기본 archive로 이동한다.
- acceptance: pending preview가 보이더라도 lead/supporting 홈 card의 source는 반드시 `canonical_status: final_current`여야 한다.

## 2026-07-30 partial current 후보 — HomeVisualHeroPartialFallback

2026-07-30 최신 canonical 홈 세트는 Chris의 명시 저장 지시와 Higgsfield credit 제약 때문에 `final_current_partial_2_of_3_due_to_higgsfield_credits` 상태다. 따라서 8월 구현 계약은 “최신 final 3장”만 가정하지 말고, 승인된 partial current를 어떻게 고급스럽게 보여줄지 결정해야 한다.

- source: `data/image-gallery/final/current-home-visual-set.json`
- current lead: `Soft Relation Keel`
- current supporting: `Value Tasting Spoon`
- incomplete item: `Quiet OBD Saddle`은 credit dependency 때문에 public/home canonical card로 노출하지 않는다.
- UI state 후보: `complete_3`, `approved_partial_2`, `fallback_empty`
- public home 후보: 1 lead + 1 supporting을 안정적으로 배치하고, 누락 사유는 과장된 에러가 아니라 비공개/admin 상태 배지로 접는다.
- admin/private 후보: `canonical_status`, `finalization_reason`, credit dependency, incomplete title/source ref를 접힘 메타데이터로 둔다.
- 8월 acceptance 후보: `pending_review`는 계속 차단하되, Chris가 명시 저장한 `final_current_partial_*`는 별도 allowed status로 볼지 Karina/Chris가 확인한다.

## 2026-07-31 still-only final 후보 — HomeVisualHeroStillOnlyMode

2026-07-31 최신 canonical 홈 세트는 3장 모두 final이지만 `final_current_stills_only_no_turntables` 상태다. 따라서 홈 구현은 `complete_3`과 `video_ready`를 같은 의미로 보지 말아야 한다.

- source: `data/image-gallery/final/current-home-visual-set.json`
- current lead: `Soft Evidence Keystone`
- current supporting: `Context Field Notebook`, `Trust Envelope Cushion`
- UI state 후보: `complete_3_stills_only`
- media rule: 카드/홈은 `key_screen_asset_path` 또는 `webapp_asset_path` 정적 이미지를 우선 사용한다.
- detail rule: `turntable_video_asset_path`가 없으면 `WhyThisImageDrawer`는 정적 key screen과 rationale만 보여준다.
- public copy 후보: 비디오가 없다는 운영 사유를 error처럼 드러내지 않고, Evidence / Context / Trust 3축의 홈 내러티브에 집중한다.
- admin/private 후보: `canonical_status`, `detail_video_status`, `prompt_policy`, `private_prompt_path`는 접힘 메타데이터로 둔다.
- 8월 acceptance 후보: still-only final은 홈 표시 가능 후보로 둘 수 있지만, Chris/Karina가 allowed status 목록을 확정해야 한다.
