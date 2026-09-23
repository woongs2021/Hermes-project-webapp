# Design DNA System Principles

> Chris Archive와 GoYJ 생성/선택 루프에서 정리된, 향후 브랜드·패키지·UI·목업 합성을 위한 그래픽 모티프 생성 원칙.

## 1. 목적

GoYJ가 생성하는 이미지는 완성된 그래픽 디자인 산출물이 아니다.  
Chris가 나중에 목업 디자인, 패키지, 브랜드 에셋, UI 표면과 합성할 수 있는 **그래픽 모티프 재료**다.

따라서 결과물은 다음에 적합해야 한다.

- crop
- mask
- overlay
- repeat
- layering
- package surface 적용
- mobile UI/card background 적용
- brand system texture 또는 signal로 확장

## 2. 생성물의 기본 정의

생성물은 아래가 아니다.

- 완성 포스터
- 완성 패키지 라벨
- 앱 아이콘
- 로고
- 제품 목업
- UI 스크린샷
- 캠페인 키비주얼
- 단독 artwork

생성물은 아래에 가깝다.

- surface field
- stroke / line overlay
- soft object seed
- repeatable pattern fragment
- signal / accent motif
- material texture
- crop-friendly visual layer

## 3. Chris Archive 우선 원칙

모든 후보는 generic AI aesthetic이 아니라 Chris가 직접 넣은 Chris Archive의 시각 언어에서 출발한다.

참고해야 하는 것:

- 색의 온도와 비율
- 여백의 사용 방식
- 조용한 editorial 구조
- 표면감과 재질감
- motif rhythm
- 그래픽 밀도
- 브랜드로 확장 가능한 반복 구조

하지 말아야 하는 것:

- archive 이미지를 그대로 복제
- 제3자 브랜드/포스터/패키지 레이아웃 모방
- AI가 자주 만드는 neon/glow/sparkle/robot/brain 클리셰 사용
- 예쁜 배경 이미지나 추상 wallpaper로 도망가기

## 4. 5개 후보의 역할

### 01. Surface Field Motif

패키지나 UI 배경에 깔 수 있는 부드러운 field / texture.

원칙:

- 넓은 여백
- 조용한 surface utility
- broad color field
- material tone 중심
- 중심 오브젝트보다 배경 적용성 우선

금지:

- 부차적인 라인
- 랜덤 데코레이션
- 스크래치
- 불필요한 궤도/점선
- fake UI fragment

### 02. Stroke / Line Motif

브랜드 그래픽 위에 얹을 수 있는 line-only overlay.

원칙:

- line / stroke / contour / ring / rhythm만 사용
- quiet neutral base 위에서 작동
- crop / overlay 가능해야 함

강한 금지:

- 면
- filled blob
- color block
- surface patch
- object render
- 그림자 덩어리
- decorative texture field
- secondary motif

### 03. Soft Object Motif

독립 배치하거나 crop 가능한 부드러운 object / mark seed.

원칙:

- 단순한 형태
- protected void 또는 soft presence 감각
- 필요할 때 원형/정형 geometry 우선
- 단독 로고처럼 완성하지 않기

금지:

- 앱 아이콘처럼 보이는 framing
- 복잡한 오브젝트 렌더
- 주변 장식 라인
- 의미가 과한 메타포

### 04. Pattern / Repeat Motif

반복/마스킹 가능한 pattern fragment.

원칙:

- 한 가지 명확한 pattern logic
- 복잡도 낮추기
- module size와 negative space 확보
- 매번 같은 팔레트가 아니라 color tone 변주

금지:

- 여러 패턴 시스템 혼합
- 과밀한 texture
- 작은 장식 요소 과다
- dots/lines가 의도 없이 늘어나는 구조

### 05. Signal / Accent Motif

작은 badge, seal fragment, state signal, corner accent처럼 쓸 수 있는 material.

원칙:

- 작게 얹어도 읽히는 accent
- 조용한 agency cue
- 필요할 때 원형/정형 geometry 우선
- 목업 위에 붙일 수 있는 신호성

금지:

- 노란색 line graphic 장식
- 불필요한 orbit line
- decorative scratch
- 완성 로고처럼 보이는 구조
- 과하게 상징적인 메타포

노란색은 필요할 때만 **filled accent / material cue**로 제한한다.

## 5. 전체 Negative Prompt 원칙

항상 피해야 할 것:

- readable text
- third-party text
- brand names
- logos
- finished poster
- completed package label
- app icon
- exact reference layout
- product mockup
- UI screenshot
- robot
- brain symbol
- magic sparkle
- generic AI startup neon gradient
- cinematic object render
- decorative wallpaper-only image
- surveillance dashboard
- fake UI copy
- copyrighted character
- known package imitation
- sharp aggressive objects
- cluttered interface
- incidental decorative lines
- random scratches
- unnecessary orbit marks
- mixed visual systems
- yellow line graphic decoration

## 6. 품질 판단 기준

좋은 후보는 다음 질문에 답할 수 있어야 한다.

- 목업 위에 얹기 쉬운가?
- crop해도 살아남는가?
- mask로 잘라 써도 구조가 유지되는가?
- background field로 깔아도 부담 없는가?
- package surface에 들어가도 Hermes Design DNA가 유지되는가?
- 너무 완결된 AI artwork처럼 보이지 않는가?
- 반복/마스킹/레이어 합성이 가능한가?
- 충분한 negative space와 clear edge behavior가 있는가?
- Chris Archive의 시각 언어와 연결되는가?

## 7. 저장 원칙

GoYJ 후보는 기본적으로 임시 review set이다.

- Chris가 `저장해줘`라고 명시한 것만 저장한다.
- 저장 위치는 **Design DNA → DNA Dashboard**다.
- Chris Archive는 사용자가 직접 넣은 reference/evidence 공간으로 유지한다.
- unselected candidates는 public webapp에 올리지 않는다.

## 8. 현재 운영 규칙 요약

- M/W/F 5장 생성
- 모델은 GPT Image 2.5만 사용
- 다른 모델 fallback 금지
- 생성물은 final output이 아니라 graphic motif material
- Chris Archive / Design DNA 원칙 우선
- line-clean / decoration-clean 상시 적용
- 02는 line-only
- 03/05는 필요 시 원형/정형 geometry 우선
- 04는 복잡도 축소와 color tone 변화
- 05는 노란색 line graphic 장식 금지
