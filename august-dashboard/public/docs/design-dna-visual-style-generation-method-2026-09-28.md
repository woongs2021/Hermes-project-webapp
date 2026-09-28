# 2026-09-28 GoYJ Visual Style Generation Method

## 한 줄 정의
Chris Archive의 한두 가지 익숙한 조형(capsule, circle, contour line)에 수렴하지 않도록, 후보 생성 전 서로 다른 archive reference axis를 강제로 분산 배치하는 방식입니다.

## 배경
2026-09-28 첫 후보 5개 중 01은 저장되었지만, 02–05는 기존 warm-gray, capsule, circle, line 계열 반복이 강하다는 피드백이 있었습니다. 이후 GoYJ는 Chris Archive의 다른 시각 계열을 의도적으로 샘플링해 02–05를 다시 생성했고, Chris는 재생성 결과가 훨씬 낫다고 평가하며 전체 저장을 승인했습니다.

## 핵심 원칙
1. 기본값 반복 금지
   - warm-gray surface, capsule, circle seal, contour line, orbit, dot motif를 매번 기본값처럼 쓰지 않습니다.
   - 이전 저장본과 너무 닮은 조형은 새 후보군의 중심이 아니라 비교군 또는 1개 이하의 보조 후보로만 둡니다.

2. Archive axis 먼저 선택
   - 이미지를 만들기 전에 5개의 서로 다른 reference axis를 먼저 정합니다.
   - 각 axis는 Chris Archive에서 실제로 반복 관찰된 다른 미감 계열이어야 합니다.

3. 후보 간 거리 확보
   - 5개 후보는 색만 다른 변주가 아니라 조형 문법 자체가 달라야 합니다.
   - block, surface, bitmap, bloom, material, editorial, pattern처럼 역할과 구조가 서로 달라야 합니다.

4. 완성 포스터가 아니라 합성 가능한 재료
   - 결과물은 poster, logo, package label, app icon, UI screenshot이 아니라 나중에 브랜드/패키지/모바일 UI에 합성할 수 있는 motif material이어야 합니다.
   - crop, mask, overlay, repeat, background, accent로 활용 가능한 상태를 우선합니다.

5. No-text / no-logo guardrail
   - readable text, letter, number, logo, watermark, UI chrome, product mockup, people을 금지합니다.
   - 참고 레퍼런스에 텍스트가 있더라도 텍스트를 복제하지 않고 구조·리듬·색장만 추출합니다.

## 2026-09-28에 웹앱에 남긴 4개 axis
1. Monochrome Editorial Block System
   - 역할: 강한 editorial crop / geometric poster surface
   - 강점: black/warm-white/lime-gray, 비대칭 block tension, capsule/line 반복 탈출

2. Iridescent Chrome Surface Field
   - 역할: hero background / material mood surface
   - 강점: pearl, graphite, smoky lavender, oily cyan 계열의 tactile optical material
   - 주의: chrome 물성이 과해지면 object-like해질 수 있어 필요 시 더 flat하게 조정합니다.

3. Bitmap Stripe Rhythm Surface
   - 역할: repeat pattern / energetic card or package texture
   - 강점: pixel block, horizontal stripe, riso/screenprint texture, 가장 뚜렷한 style divergence

4. Floral Signal Void Field
   - 역할: bold accent/background surface
   - 강점: bloom-like radial color field, red void, magenta-cyan tension, 감성적 signal field

삭제 기록: `Warm Gray Context Surface Field`는 2026-09-28에 Chris 판단으로 웹앱/DNA Dashboard와 selected archive에서 제거했습니다. 다음 생성 방식에서는 warm-gray/capsule/circle/line 기본값으로 수렴하지 않기 위한 반례로만 참고합니다.

## 다음 생성 시 운영 규칙
- 5개 후보를 만들 때 최소 4개는 서로 다른 archive axis에서 출발합니다.
- 지난 2회 저장본과 같은 조형 언어는 후보군에서 감점합니다.
- GoYJ는 후보 설명에 `reference axis`, `motif type`, `intended later use`, `why different`를 남깁니다.
- Chris가 “반복된다”고 느끼면 색상 변경이 아니라 axis 자체를 바꿉니다.

## Prompt skeleton
```text
PURE 2D GRAPHIC MOTIF MATERIAL ONLY.
No readable text, letters, numbers, logos, watermark, poster copy, app icon, UI screenshot, product mockup, people, photography.

Create a square 1:1 composable motif material from this Chris Archive reference axis: [AXIS NAME].
Do not copy any reference layout. Extract only structure, rhythm, material mood, color tension, and crop logic.
The output must be useful as [background / overlay / repeat pattern / package surface / mobile UI accent].
Avoid recent saved defaults: warm-gray capsule, circular seal, contour line, orbit, dot motif, generic AI glow.
Make it visually distant from the other candidates in this set.
```

## 품질 체크리스트
- [ ] 5개 후보가 서로 다른 조형 문법을 갖는가?
- [ ] 이전 저장본과 너무 유사한 후보가 2개 이상 반복되지 않는가?
- [ ] 텍스트/로고/숫자/워터마크가 없는가?
- [ ] 완성 포스터가 아니라 후합성 가능한 재료인가?
- [ ] 각 후보의 intended later use가 서로 다른가?
- [ ] Chris Archive의 특정 축에서 출발했다는 근거가 남아 있는가?
