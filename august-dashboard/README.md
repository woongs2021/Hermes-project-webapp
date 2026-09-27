# Hermes Project Webapp

Chris의 Hermes Agent Team, Personal AX, Corporate AX, Weekly Research Loop를 한 곳에서 확인하기 위한 GitHub Pages 기반 React/Vite 웹앱입니다.

Live site: https://woongs2021.github.io/Hermes-project-webapp/

## Purpose

이 웹앱은 Chris가 진행 중인 Hermes/OBD/Design DNA 실험을 다음 네 가지 관점으로 정리합니다.

- **Team**: Karina와 전문 에이전트 팀의 역할, 협업 루프, 검증 흐름
- **Personal AX**: Chris 개인의 지식·리서치·시각 자료를 운영체계처럼 연결하는 영역
- **Corporate AX**: Chris Archive와 Design DNA를 기반으로 브랜드 자산과 디자인 시스템을 구축하는 영역
- **Weekly**: 주간 리서치 후보, 검증 신호, 최근 웹앱 업데이트를 점검하는 영역

## Current Information Architecture

### Top navigation

상단 헤더에는 4개의 상위 탭만 유지합니다.

- Team
- Personal AX
- Corporate AX
- Weekly

우측 상단 햄버거 버튼은 이 상위 탭 전체를 접고 펼치는 토글로 동작합니다.

### Workspace child tabs

하위 탭은 더 이상 헤더 안에 두지 않고, 관련 본문 영역 안에만 표시합니다.

- **Personal AX** 본문 탭
  - OBD Map
  - Research
  - Visual Archive

- **Corporate AX** 본문 탭
  - Chris Archive
  - Design DNA

- **Team / Weekly**
  - 별도 본문 하위 탭 없음

### Workspace reading order

Personal AX와 Corporate AX 화면은 다음 순서로 구성합니다.

1. 그룹 설명
2. 본문 하위 탭
3. 선택된 탭의 제목과 설명
4. 실제 콘텐츠

이 구조는 상단 내비게이션의 복잡도를 줄이고, 사용자가 현재 어떤 AX 맥락 안에서 어떤 세부 화면을 보고 있는지 더 명확하게 인지하도록 설계되었습니다.

## Recent Navigation Updates

- 상단 탭은 4개 상위 그룹만 남기고, 하위 탭은 본문 안으로 이동했습니다.
- Personal AX / Corporate AX에는 각각 별도 그룹 설명을 추가했습니다.
- 선택된 세부 탭의 제목과 설명은 본문 탭 아래에 배치했습니다.
- 상단 탭 하단 margin은 최신 기준 `10px`로 조정했습니다.
- 상단/본문 탭은 stroke/card 스타일 대신 텍스트 중심의 flat navigation으로 유지합니다.
- Active 상태는 배경이나 라인이 아니라 텍스트 컬러 중심으로 표현합니다.

## Main Data-backed Areas

- **Chris Archive**
  - `public/data/chris-archive.json`
  - `public/assets/chris-archive/`
  - 시각 레퍼런스, Karina 분석, 디자인 시스템 후보를 썸네일/상세 팝업으로 표시합니다.

- **Design DNA**
  - `public/data/dna-archive.json`
  - `public/data/midjourney-dna-archive.json`
  - GPT Image / Midjourney 기반 브랜드 에셋 후보와 디자인 DNA 분석 흐름을 표시합니다.

- **Research Board**
  - `public/data/research-board.json`
  - Yuna / Go Youn-jung 리서치 후보와 주간/월간 synthesis를 표시합니다.

## Development

```bash
npm install
npm run dev
```

Production build for GitHub Pages:

```bash
npm run build:public
```

Local preview:

```bash
npm run preview -- --host 127.0.0.1
```

## QA Expectations

주요 UI 변경 후에는 다음을 확인합니다.

- `npm run build:public` 성공
- desktop / tablet / mobile Playwright QA
- GitHub Pages live URL에서 실제 DOM/computed style 확인
- 가로 overflow 없음
- 헤더 탭, 본문 탭, 모달, 이미지 asset 로딩 정상

## Deployment

Repository: https://github.com/woongs2021/Hermes-project-webapp

GitHub Pages: https://woongs2021.github.io/Hermes-project-webapp/

Vite base path is configured for `/Hermes-project-webapp/`.
