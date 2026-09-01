import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { fallbackHomeVisualSet, loadHomeVisualSet, type HomeVisualItem, type HomeVisualSet } from './homeVisualSet'
import { fallbackResearchBoard, loadResearchBoard, type ResearchBoard, type ResearchBoardItem } from './researchBoard'
import { GraphRelationshipPanel, MonthlyResearchSynthesisPanel, MuyeolValidationPanel, ObdGrowthTimelinePanel } from './extendedPanels'
import './App.css'

const publicAssetPath = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
const sonProfileImageSrc = publicAssetPath('/assets/team/son_profile.jpg')

type TabId = 'home' | 'obd' | 'visuals' | 'research' | 'report'
type ThemeMode = 'light' | 'dark'
type ObdSubTabId = 'growth' | 'graph' | 'about'
type TextSegment = { text: string; emphasis?: boolean }

type Tab = {
  id: TabId
  label: string
  eyebrow: string
  title: string
  description: string
}

type ArchitectureBranch = {
  title: string
  intent: string
  children: string[]
}

type ArchitectureScreen = {
  number: string
  title: string
  role: string
  lead: string
  rhythm: string[]
  focus: string[]
}

type ProfileCredential = {
  label: string
  value: string
  detail: string
}

type SonQuestionSignal = {
  question: string
  axis: string
  answerSignal: string
  scoringFormula: string
}

type AgentProfile = {
  name: string
  title: string
  faceSrc: string
  summary: string
  handoff: string
}

const tabs: Tab[] = [
  {
    id: 'home',
    label: 'Team',
    eyebrow: 'Orchestration',
    title: 'Karina Hermes Team',
    description: 'Chris의 지시를 Karina가 조율하고, Agent Team이 실행하며, Muyeol이 검증한 뒤 다시 Chris에게 돌아오는 작업 완료 루프입니다.',
  },
  {
    id: 'obd',
    label: 'OBD Map',
    eyebrow: 'Operating map',
    title: 'OBD Operating Map',
    description: 'Chris의 자료가 신호, 개념, 비즈니스 판단, 검증으로 순환하는 방식을 하나의 운영 지도로 정리합니다.',
  },
  {
    id: 'visuals',
    label: 'Visual Archive',
    eyebrow: 'Home visual system',
    title: 'Go Youn-jung Visual Archive',
    description: '최종 승인된 Go Youn-jung 홈 비주얼을 오래된 순서로 누적하고, 각 still을 클릭하면 turntable detail을 확인합니다.',
  },
  {
    id: 'research',
    label: 'Research',
    eyebrow: 'Chronological research board',
    title: 'Yuna / Go Youn-jung Research Kanban',
    description: 'Yuna와 Go Youn-jung의 논문 리서치 루프를 초창기 기록부터 시간순으로 긁어와 썸네일 카드와 클릭 상세 정보로 보여줍니다.',
  },
  {
    id: 'report',
    label: 'Monthly',
    eyebrow: 'Monthly research synthesis',
    title: 'Research Month Review',
    description: 'Yuna / Go Youn-jung 리서치 후보를 월간 지표와 주제 hook, 상위 후보로 압축해 Chris의 성장 방향을 읽습니다.',
  },
]

const metricPlaceholders = ['Primary signal', 'Open loops', 'Weekly check-in']
const listPlaceholders = ['Next handoff note', 'Recent validation slot', 'Reference card surface']
const researchLaneFilters = ['all', 'yuna', 'goyounjung', 'final'] as const
const obdSubTabs: { id: ObdSubTabId; label: string; eyebrow: string; description: string }[] = [
  {
    id: 'about',
    label: 'About OBD',
    eyebrow: 'definition and Chris profile',
    description: 'OBD 루프가 무엇인지 쉽게 정의하고, Chris가 왜 이 관점으로 AI 시대의 경험과 비즈니스를 탐구하는지 설명합니다.',
  },
  {
    id: 'growth',
    label: 'Signal Loop',
    eyebrow: 'from source to judgment',
    description: '흩어진 자료를 모으고, 질문으로 바꾸고, 화면에 올린 뒤 검증해서 Chris의 다음 선택으로 되돌리는 쉬운 5단계입니다.',
  },
  {
    id: 'graph',
    label: 'Operating Map',
    eyebrow: 'team loop and evidence flow',
    description: 'Karina의 조율, 에이전트 실행, Muyeol 검증, Chris의 최종 판단이 어떻게 이어지는지 보여줍니다.',
  },
]

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  const savedTheme = window.localStorage.getItem('august-dashboard-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme

  return 'light'
}

type ResearchLaneFilter = (typeof researchLaneFilters)[number]

function getInitialResearchQuery() {
  if (typeof window === 'undefined') return ''

  return new URLSearchParams(window.location.search).get('q') ?? ''
}

function getInitialResearchLaneFilter(): ResearchLaneFilter {
  if (typeof window === 'undefined') return 'all'

  const lane = new URLSearchParams(window.location.search).get('lane')
  return researchLaneFilters.includes(lane as ResearchLaneFilter) ? (lane as ResearchLaneFilter) : 'all'
}

const profileCredentials: ProfileCredential[] = [
  {
    label: 'Current role',
    value: 'Samsung MX Senior UX Designer',
    detail: '미래 모바일 경험, One UI, 인간적인 AI UX를 탐구하는 제품/경험 디자이너',
  },
  {
    label: 'Previous role',
    value: 'LG BX Brand Designer',
    detail: '브랜드 경험과 시스템적 시각 언어를 다뤄온 BX 기반의 전략적 감각',
  },
  {
    label: 'Education',
    value: 'Brunel MA · Yonsei MS',
    detail: 'Design Strategy & Innovation, Design Intelligence 기반의 리서치/전략 역량',
  },
]

const profileLenses = [
  'UX / Brand / Design Strategy',
  'AI UX · 정서적 안정감 · 인간적인 인터랙션',
  'Research · Awards · IP · Mentoring',
  'Karina Hermes Agent Team이 만들어가는 OBD operating rhythm',
]

const sonQuestionSignals: SonQuestionSignal[] = [
  {
    question: 'Chris가 지금 어떤 역할로 판단하고 싶은가?',
    axis: 'Role ontology',
    answerSignal: '답변 안에서 UX, BX, AI UX, 전략, 교육, 리더십이 서로 어떤 관계로 묶이는지 봅니다.',
    scoringFormula: '역할 명료도 40% + 영역 연결성 35% + 다음 판단 언어 25%',
  },
  {
    question: '이 판단은 어디까지 공개 가능한가?',
    axis: 'Public-safe decision log',
    answerSignal: 'private 원문을 드러내지 않고도 남길 수 있는 결정, 근거 수준, 공개 가능한 표현을 분리합니다.',
    scoringFormula: '공개 가능성 35% + 근거 표시 35% + 민감정보 제거 30%',
  },
  {
    question: '답변이 어떤 산출물과 연결되는가?',
    axis: 'Artifact relationship',
    answerSignal: '말로 끝나는 답인지, 카드·그래프·리서치 보드·디자인 프롬프트 같은 화면 산출물로 이어지는지 확인합니다.',
    scoringFormula: '산출물 연결 40% + 재사용 가능성 30% + 화면화 난이도 역점수 30%',
  },
  {
    question: 'Karina와 팀에게 어디까지 맡길 수 있는가?',
    axis: 'Delegation boundary',
    answerSignal: 'Chris가 직접 결정해야 하는 부분과 에이전트가 실행해도 되는 부분이 얼마나 분명한지 읽습니다.',
    scoringFormula: '결정권 분리 40% + 담당자 명확성 35% + 블로커 가시성 25%',
  },
  {
    question: '이 방향을 누가 받아들이고 어떻게 통제하는가?',
    axis: 'Control & adoption map',
    answerSignal: '사용자, 팀, 조직, 외부 공개 맥락에서 누가 이해하고 승인해야 하는지의 흐름을 잡습니다.',
    scoringFormula: '통제 지점 35% + 채택 대상 35% + 설명 가능성 30%',
  },
  {
    question: '이 판단은 검증 가능한가?',
    axis: 'Evaluation validity',
    answerSignal: '좋아 보이는 해석인지, 실제 근거·QA·다음 실험으로 확인 가능한 판단인지 구분합니다.',
    scoringFormula: '검증 가능성 40% + 반증 가능성 30% + 다음 액션 선명도 30%',
  },
]

const agentProfiles: AgentProfile[] = [
  {
    name: 'Karina',
    title: 'Coordination Lead · CDO Partner',
    faceSrc: publicAssetPath('/assets/team/karina_profile.jpg'),
    summary: 'Chris의 요청을 제품 언어와 실행 순서로 정리하고, Agent Team 전체의 우선순위와 handoff를 조율합니다.',
    handoff: '최종 응답은 Karina가 하나의 명확한 synthesis로 묶어 Chris에게 돌려주는 역할입니다.',
  },
  {
    name: 'Yuna',
    title: 'Research Intelligence',
    faceSrc: publicAssetPath('/assets/team/yuna_profile.jpg'),
    summary: '논문, 시장, 레퍼런스, 지식 탐색을 맡아 AI UX와 OBD 판단에 필요한 근거를 수집합니다.',
    handoff: 'Faker나 Son이 실행 방향을 잡을 수 있도록 핵심 signal과 source 맥락을 넘깁니다.',
  },
  {
    name: 'Go Youn-jung',
    title: 'Visual / Experience Muse',
    faceSrc: publicAssetPath('/assets/team/goyounjung_profile.jpg'),
    summary: '홈 비주얼, 정서적 톤, 브랜드 감각을 통해 따뜻하고 인간적인 AI UX의 분위기를 구체화합니다.',
    handoff: '승인된 still과 turntable은 public-safe manifest를 통해 Home Visual Archive에 반영됩니다.',
  },
  {
    name: 'Son',
    title: 'Scope / Priority Strategist',
    faceSrc: sonProfileImageSrc,
    summary: '범위, 수용 기준, 프로젝트 순서를 정리해 팀이 작은 단위로 끝까지 완료할 수 있게 합니다.',
    handoff: '속도와 품질 사이의 선택지를 분명하게 나누고 다음 실행 단위를 제안합니다.',
  },
  {
    name: 'Faker',
    title: 'Coding / Automation Builder',
    faceSrc: publicAssetPath('/assets/team/faker_profile.jpg'),
    summary: '프로토타입, 스크립트, 웹 대시보드, GitHub Pages 배포처럼 실제 작동하는 산출물을 구현합니다.',
    handoff: '빌드, lint, manifest readback, Pages smoke처럼 실행 근거를 남겨 Karina가 신뢰 있게 종합할 수 있게 합니다.',
  },
  {
    name: 'Muyeol',
    title: 'QA / Risk Validation',
    faceSrc: publicAssetPath('/assets/team/muyeol_profile.jpg'),
    summary: '보안, 프라이버시, public-safe 경계, 최종 품질 리스크를 검토하는 validation 담당입니다.',
    handoff: '비밀값 노출, private source leakage, UI/데이터 불일치를 점검한 뒤 final go/no-go를 제공합니다.',
  },
]

const architectureScreens: ArchitectureScreen[] = [
  {
    number: '01',
    title: 'Command Loop',
    role: '사용자가 처음 보는 운영 루프 화면',
    lead: 'Chris의 지시가 Karina 조율, Agent Team 실행, Muyeol 검증을 거쳐 다시 Chris에게 돌아오는 한 바퀴를 먼저 보여줍니다.',
    rhythm: ['Chris Order', 'Karina Framing', 'Agent Team Execution', 'Muyeol Validation', 'Karina Synthesis'],
    focus: ['현재 루프 상태', '팀 handoff', '오늘의 안전한 요약'],
  },
  {
    number: '02',
    title: 'Data Contract',
    role: '개발/QA가 보는 public-safe 데이터 계약 화면',
    lead: '화면에 들어오는 모든 Markdown/JSON 후보가 safe source, validator, generated manifest를 통과했는지 확인하는 두 번째 장입니다.',
    rhythm: ['External Safe Source', 'Shared Validator', 'JSON Schema', 'Public Manifest', 'Read-only Preview'],
    focus: ['schema contract', 'secret-like gate', 'Muyeol QA handoff'],
  },
]

const productBranches: ArchitectureBranch[] = [
  {
    title: 'Team',
    intent: '기본 진입점 · Karina 중심 실행 루프',
    children: ['Task Completion Loop', 'Agent Role Cards', 'Active Handoffs', 'Blockers'],
  },
  {
    title: 'OBD Map',
    intent: '신호가 판단으로 돌아오는 운영 지도',
    children: ['Signal Loop', 'Operating Map', 'Evidence Flow', 'Muyeol Validation'],
  },
  {
    title: 'Visual Archive',
    intent: '승인된 홈 비주얼 누적 아카이브',
    children: ['Oldest-first Stills', 'Turntable Detail', 'Visual Manifest', 'Public-safe Assets'],
  },
  {
    title: 'Research',
    intent: '논문/자료/인사이트 루프',
    children: ['Search', 'Paper Library', 'Insight Notes', 'Karina Synthesis'],
  },
  {
    title: 'Muyeol Report',
    intent: 'QA/리스크/권고 리포트',
    children: ['Weekly Report', 'Monthly Report', 'Risk Categories', 'Recommendations'],
  },
]

const dataBranches: ArchitectureBranch[] = [
  {
    title: '/data/team',
    intent: '기본 홈의 에이전트 역할과 handoff',
    children: ['agents.md', 'orchestration.md', 'handoffs.md'],
  },
  {
    title: '/data/obd',
    intent: '운영 지도와 판단 루프 로컬 기록',
    children: ['signal-loop.md', 'operating-map.md', 'patterns.json'],
  },
  {
    title: '/public/data/home-visual-set.json',
    intent: 'Visual Archive 공개 안전 manifest',
    children: ['items[].still', 'items[].turntable', 'sourcePolicy'],
  },
  {
    title: '/data/research',
    intent: 'Markdown-first research library',
    children: ['papers/*.md', 'notes/*.md', 'index.json'],
  },
  {
    title: '/data/reports/muyeol',
    intent: '검증 리포트',
    children: ['weekly/YYYY-Www.md', 'monthly/YYYY-MM.md', 'risk-index.json'],
  },
]

function MetricStrip() {
  return (
    <div className="metric-strip" aria-label="Dashboard metric placeholders">
      {metricPlaceholders.map((label) => (
        <article className="metric-card" key={label}>
          <p className="card-kicker">Placeholder</p>
          <div className="metric-value" aria-hidden="true" />
          <h3>{label}</h3>
          <p>Static visual slot for future local-only dashboard data.</p>
        </article>
      ))}
    </div>
  )
}

function ArchitectureSpreadPanel() {
  return (
    <section className="screen-spread" aria-label="Two screen composition proposal">
      {architectureScreens.map((screen) => (
        <article className="screen-card" key={screen.number}>
          <div className="screen-card-topline">
            <span>{screen.number}</span>
            <p>{screen.role}</p>
          </div>

          <div className="screen-card-copy">
            <p className="card-kicker">Two-screen composition</p>
            <h3>{screen.title}</h3>
            <p>{screen.lead}</p>
          </div>

          <div className="loop-strip" aria-label={`${screen.title} rhythm`}>
            {screen.rhythm.map((step, index) => (
              <div className="loop-step" key={step}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </div>
            ))}
          </div>

          <div className="focus-row" aria-label={`${screen.title} focus points`}>
            {screen.focus.map((item) => (
              <span className="focus-chip" key={item}>{item}</span>
            ))}
          </div>
        </article>
      ))}
    </section>
  )
}

const sonWeeklyQuestionGroups = [
  {
    week: '2026-W30 · Jul 20–26',
    theme: '역할·공개 안전·위임 경계',
    signal: 'Son 질문 7개',
    questions: [
      'Hermes 팀의 역할이 나뉘면서 Chris가 직접 더 잘하게 된 판단은 무엇인가요?',
      '공개해도 되는 학습과 공개하지 말아야 할 내부 맥락은 각각 무엇인가요?',
      '작업 상태, 판단 지점, 아티팩트 관계로 다시 그린다면 가장 먼저 보존해야 할 핵심 객체는 무엇인가요?',
      '사용자가 이 AI가 내 편이라고 느끼려면 어떤 관계가 화면·정책·말투에 보여야 할까요?',
      '언제 개입하고, 언제 멈추고, 무엇은 절대 하지 않을 것인가를 어떻게 정의하시겠습니까?',
    ],
  },
  {
    week: '2026-W31 · Jul 27–30',
    theme: '제어권·조직 승인·검증 유효성',
    signal: 'Son 질문 4개',
    questions: [
      'AI 판단 지점과 사용자의 제어·수정·이의제기/중단 지점을 어떻게 나눌 것인가요?',
      'AI 역할, 인간 책임, 사용자 통제, 평가 기준, 조직 승인 신호를 어떻게 나눌 것인가요?',
      'AI가 자동 실행할 단계, 사용자가 개입해야 할 단계, 오류가 났을 때 회복해야 할 단계를 어떻게 나누시겠습니까?',
      'LLM/AI로 빠르게 시뮬레이션할 것, 반드시 실제 사람에게 검증할 것, 불확실하면 멈춰야 할 것을 어떻게 나누시겠습니까?',
    ],
  },
]

const chrisGrowthGraphPoints = [
  {
    id: 'role-ontology',
    time: 'Jul 20–21',
    growth: 22,
    x: 6,
    y: 65,
    metric: '2 Son questions',
    question: 'Hermes 팀의 역할이 나뉘면서 Chris가 직접 더 잘하게 된 판단은 무엇인가요?',
    label: 'Role ontology',
    detail: '이 점은 Chris의 체감 성장 점수가 아니라 Son 질문 로그의 구조화 단계입니다. Son은 AI 팀 소개보다 역할 → 맡기는 일 → Chris가 책임지는 판단을 먼저 정리했습니다.',
  },
  {
    id: 'public-decision-log',
    time: 'Jul 22–23',
    growth: 27,
    x: 24,
    y: 61,
    metric: '2 decision frames',
    question: '공개해도 되는 학습과 공개하지 말아야 할 내부 맥락은 각각 무엇인가요?',
    label: 'Public-safe decision log',
    detail: 'Son의 실제 질문은 상황을 추상화하고, 공개 가능한 학습과 숨겨야 할 내부 맥락을 나누는 쪽으로 이동했습니다. 그래서 상승폭은 “성장 체감”이 아니라 공개 안전 구조가 한 단계 선명해진 정도만 표시합니다.',
  },
  {
    id: 'artifact-relationship',
    time: 'Jul 23',
    growth: 31,
    x: 42,
    y: 58,
    metric: 'work-state map',
    question: '기능명이 아니라 작업 상태, 판단 지점, 아티팩트 관계로 다시 그린다면 무엇을 보존해야 하나요?',
    label: 'Artifact relationship',
    detail: 'OBD를 기능 목록이 아니라 work state → judgment point → artifact relationship → reason to return으로 보는 단계입니다. 그래프는 개인 성취 곡선보다 질문 체계가 조금 더 다층화된 흐름으로 낮춰 그렸습니다.',
  },
  {
    id: 'delegation-boundary',
    time: 'Jul 24–26',
    growth: 35,
    x: 60,
    y: 54,
    metric: '3 trust frames',
    question: '행동, 예상 결과, 위험, 사용자 허락, 되돌리기, 책임 주체 중 무엇을 연결해야 하나요?',
    label: 'Delegation boundary',
    detail: 'Son 질문은 위임 행동, 위험, 회복 경로, 권한, 멈춤 조건, 금지 행동을 묶었습니다. 이 단계도 “Chris가 크게 성장했다”가 아니라 위임을 안전하게 설명하는 기준이 조금 더 촘촘해진 상태입니다.',
  },
  {
    id: 'control-adoption',
    time: 'Jul 27–29',
    growth: 39,
    x: 78,
    y: 50,
    metric: '3 control maps',
    question: 'AI 판단 지점과 사용자의 제어·수정·이의제기/중단 지점을 어떻게 나눌 것인가요?',
    label: 'Control and adoption map',
    detail: '사용자 제어, 수정 가능 지점, 중단/이의제기 경로, 인간 책임, 조직 승인 신호가 연결됩니다. y축은 체감 성장값이 아니라 Son이 본 OBD 질문의 구조화 밀도입니다.',
  },
  {
    id: 'evaluation-validity',
    time: 'Jul 30',
    growth: 43,
    x: 94,
    y: 46,
    metric: 'validity boundary',
    question: 'LLM/AI로 빠르게 시뮬레이션할 것, 실제 사람에게 검증할 것, 불확실하면 멈춰야 할 것은 무엇인가요?',
    label: 'Evaluation validity',
    detail: '마지막 점은 빠른 합성 평가 / 실제 인간 검증 / 불확실성 표시 / 멈춤 기준 / 책임 주체입니다. 그래서 숫자는 높게 뛰는 성장 점수가 아니라, 검증 질문까지 도달한 구조화 체크포인트로 낮췄습니다.',
  },
]

function ChrisGrowthGraphPanel() {
  const [activePointId, setActivePointId] = useState(chrisGrowthGraphPoints.at(-1)?.id ?? '')
  const activePoint = chrisGrowthGraphPoints.find((point) => point.id === activePointId) ?? chrisGrowthGraphPoints.at(-1)!
  const polylinePoints = chrisGrowthGraphPoints.map((point) => `${point.x},${point.y}`).join(' ')
  const toGraphLayerTop = (y: number) => `${(y / 86) * 100}%`

  return (
    <section className="content-card chris-growth-graph-card" aria-label="Son questions and OBD structure graph">
      <div className="growth-graph-copy">
        <div className="growth-title-row">
          <img src={sonProfileImageSrc} alt="Son profile" loading="eager" decoding="async" width="52" height="52" />
          <div>
            <p className="card-kicker">Son’s strategic questions · OBD operating map</p>
            <h3>질문이 쌓일수록, OBD는 더 선명한 운영 언어가 됩니다</h3>
          </div>
        </div>
        <p>
          Son의 질문은 Chris의 변화를 점수로 단정하지 않습니다. 대신 2026년 7월 20일부터 30일까지의 실제 growth loop를 따라, 역할 정의에서 공개 안전 판단, 위임 경계, 제어권, 검증 기준까지 OBD가 어떤 운영 언어로 정리되어 왔는지 보여줍니다. 선은 의도적으로 완만하게 두어 “급격한 성장”보다 “질문 체계가 조금씩 선명해지는 과정”으로 읽히게 했습니다.
        </p>
        <div className="growth-data-strip" aria-label="Son growth loop data summary">
          <span>11 Son growth entries</span>
          <span>2 weekly groups</span>
          <span>8 Son prep files</span>
          <span>10 Muyeol guardrails</span>
        </div>
      </div>

      <div className="growth-graph-stage" aria-label="Interactive graph with Son question structure on y axis and actual log flow on x axis">
        <svg className="growth-graph-svg" viewBox="0 0 100 86" preserveAspectRatio="none" role="img" aria-label="OBD structure graph: actual Son logs move left to right and structure level rises gently">
          <line className="growth-axis growth-axis-y" x1="5" y1="78" x2="5" y2="10" />
          <line className="growth-axis growth-axis-x" x1="5" y1="78" x2="97" y2="78" />
          <polyline className="growth-line-shadow" points={polylinePoints} />
          <polyline className="growth-line" points={polylinePoints} />
          {chrisGrowthGraphPoints.map((point) => (
            <g key={point.id}>
              <line className="growth-guide" x1={point.x} y1={point.y} x2={point.x} y2="78" />
            </g>
          ))}
        </svg>

        <div className="growth-axis-label-layer" aria-hidden="true">
          <span className="growth-axis-label y">질문 구조화</span>
          <span className="growth-axis-label x">Son 실제 로그 흐름</span>
        </div>

        <div className="growth-dot-layer" aria-hidden="true">
          {chrisGrowthGraphPoints.map((point) => (
            <span
              className={point.id === activePoint.id ? 'growth-dot active' : 'growth-dot'}
              key={`growth-dot-${point.id}`}
              style={{ left: `${point.x}%`, top: toGraphLayerTop(point.y) }}
            />
          ))}
        </div>

        <div className="growth-point-layer" aria-label="Interactive OBD structure milestones">
          {chrisGrowthGraphPoints.map((point) => (
            <button
              key={point.id}
              type="button"
              className={point.id === activePoint.id ? 'growth-point active' : 'growth-point'}
              style={{ left: `${point.x}%`, top: toGraphLayerTop(point.y) }}
              onClick={() => setActivePointId(point.id)}
              onMouseEnter={() => setActivePointId(point.id)}
              onFocus={() => setActivePointId(point.id)}
              aria-pressed={point.id === activePoint.id}
            >
              <span>{point.time}</span>
              <strong>{point.label}</strong>
              <em>{point.metric}</em>
            </button>
          ))}
        </div>
      </div>

      <aside className="growth-question-panel" aria-live="polite">
        <p className="card-kicker">Active Son question</p>
        <h4>{activePoint.question}</h4>
        <p>{activePoint.detail}</p>
        <span>{activePoint.metric} · structure checkpoint {activePoint.growth}</span>
      </aside>

      <div className="son-weekly-question-card" aria-label="Weekly Son question list">
        <div className="son-weekly-question-header">
          <img src={sonProfileImageSrc} alt="Son profile" loading="lazy" decoding="async" width="44" height="44" />
          <div>
            <p className="card-kicker">Son weekly question archive</p>
            <h4>Son이 실제로 던졌던 주요 질문들</h4>
            <p>주 단위로 묶어 스크롤하면서 볼 수 있게 정리했습니다.</p>
          </div>
        </div>
        <div className="son-weekly-question-scroll" role="list">
          {sonWeeklyQuestionGroups.map((group) => (
            <article className="son-weekly-question-group" key={group.week} role="listitem">
              <div className="son-weekly-question-meta">
                <span>{group.week}</span>
                <em>{group.signal}</em>
              </div>
              <h5>{group.theme}</h5>
              <ol>
                {group.questions.map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function ChrisIntroPanel() {
  return (
    <div className="intro-grid" aria-label="Chris introduction slide">
      <article className="content-card intro-hero-card">
        <p className="card-kicker">OBD loop definition</p>
        <h3>OBD 루프는 자료를 결정 가능한 의미로 바꾸는 반복 구조입니다</h3>
        <p>
          OBD는 Ontology Business Design의 약자입니다. 쉽게 말해 흩어진 논문, 이미지, 작업 기록을 그냥 쌓아두지 않고,
          “무엇이 중요하고, 왜 중요하며, 다음에 무엇을 선택해야 하는가”로 정리해 다시 실행으로 돌려보내는 방식입니다.
        </p>
        <div className="team-loop-steps" aria-label="OBD loop definition sequence">
          {['자료 수집', '질문 정리', '의미 추출', '화면화', '근거 확인', '다음 선택'].map((step, index) => (
            <span key={step}>{String(index + 1).padStart(2, '0')} · {step}</span>
          ))}
        </div>
      </article>

      <figure className="content-card obd-definition-image-card">
        <img
          src={publicAssetPath('/assets/obd/obd-definition-threshold.jpg')}
          alt="Dark abstract threshold landscape for OBD definition"
          width="1280"
          height="674"
          loading="eager"
          decoding="async"
        />
      </figure>

      <article className="content-card profile-statement-card profile-why-card">
        <p className="card-kicker">Why this loop exists</p>
        <h3>OBD는 크리스가 이미 갖고 있는 직함이 아니라, Karina Hermes Agent Team이 함께 만들어가는 역할입니다</h3>
        <p>
          크리스는 AI UX, One UI, 브랜드, 리서치, 디자인 전략을 동시에 다룹니다. 그래서 자료가 많아질수록 단순한 저장소만으로는
          방향을 잡기 어렵습니다. OBD 루프는 Karina Hermes Agent Team이 그 복잡한 자료를 크리스의 질문, 판단 기준, 화면 언어, 실행 순서로 계속 번역하기 위해 만들어졌습니다.
        </p>
        <p>
          이 루프 안에서 Chris는 마지막 결정을 내리는 사람이고, Karina와 Agent Team은 자료를 정리하고 검증 가능한 형태로 되돌려주는 운영 체계입니다.
          즉 OBD 루프는 크리스를 이미 완성된 OBD로 규정하는 것이 아니라, 크리스가 더 빠르고 선명하게 판단하며 점점 OBD로 성장하도록 만드는 작업 리듬입니다.
        </p>
      </article>

      <article className="content-card profile-statement-card profile-chris-card">
        <p className="card-kicker">Chris profile</p>
        <h3>Karina Hermes Agent Team은 크리스가 OBD로 작동할 수 있는 환경을 만듭니다</h3>
        <p>
          크리스(Chris)는 UX, 브랜드, 디자인 전략을 연결해 사람이 이해하고 신뢰할 수 있는 AI 경험을 탐구합니다.
          Karina Hermes Agent Team은 그 탐구가 흩어지지 않도록 자료를 정리하고, 질문을 세우고, 근거를 검증해
          크리스가 Ontology Business Designer처럼 판단하고 실행할 수 있는 구조를 만들어줍니다.
        </p>
      </article>

      <ChrisGrowthGraphPanel />

      <article className="content-card son-question-formula-card">
        <p className="card-kicker">Son question analysis · public-safe formula</p>
        <h3>손의 질문은 Chris의 답변을 6개 판단 신호로 바꿔 그래프에 올립니다</h3>
        <p>
          아래 계산식은 실제 답변 원문을 노출하는 수식이 아니라, Son이 답변에서 어떤 신호를 읽고 OBD 그래프 축으로 환산했는지 보여주는
          공개 가능한 scoring rule입니다. 각 축은 0–5점으로 정규화하고, 최종 그래프에는 축별 평균 신뢰도만 표시합니다.
        </p>
        <div className="son-formula-summary" aria-label="Son score normalization formula">
          <strong>axis score</strong>
          <span>= Σ(answer signal × weight) ÷ available evidence</span>
        </div>
        <div className="son-question-signal-grid" aria-label="Son questions and graph scoring formulas">
          {sonQuestionSignals.map((signal, index) => (
            <section className="son-question-signal" key={signal.axis}>
              <span className="son-question-number">Q{String(index + 1).padStart(2, '0')}</span>
              <div>
                <p className="son-question-text">{signal.question}</p>
                <h4>{signal.axis}</h4>
                <p>{signal.answerSignal}</p>
                <code>{signal.scoringFormula}</code>
              </div>
            </section>
          ))}
        </div>
      </article>

      <article className="content-card intro-hero-card">
        <p className="card-kicker">Personal positioning</p>
        <h3>OBD: Becoming an Ontology Business Designer</h3>
        <p>
          Designing meaning, systems, and business for the AI era. 크리스는 UX, 브랜드,
          디자인 전략을 바탕으로 사람이 안심하고 이해할 수 있는 AI 경험과 미래 One UI의 언어를 탐구하고,
          Karina Hermes Agent Team은 그 탐구가 OBD의 작업 방식으로 축적되도록 돕습니다.
        </p>
        <div className="status-row" aria-label="Profile positioning tags">
          <span className="status-chip">CEO lens</span>
          <span className="status-chip muted">CDO partner: Karina</span>
          <span className="status-chip muted">AI-era OBD</span>
        </div>
      </article>

      <article className="content-card profile-statement-card">
        <p className="card-kicker">Profile statement</p>
        <h3>석사 연구, 삼성·LG 실무, OBD 루프를 연결해 AI 시대의 경험 언어를 만드는 디자이너</h3>
        <p>
          Chris Park은 디자인 석사 과정에서 쌓은 연구 기반의 사고와 LG에서의 브랜드 경험, Samsung MX에서의 제품 UX 경험을 바탕으로
          기술이 사람에게 어떻게 이해되고 신뢰되는지 탐구하는 UX·브랜드·디자인 전략가입니다.
        </p>
        <p>
          현재 Chris는 Karina Hermes Agent Team과 함께 논문, 작업 기록, 화면 실험, 비즈니스 판단을 OBD 루프로 연결하며,
          흩어진 자료를 AI UX와 미래 One UI를 위한 판단 언어로 바꾸고 있습니다. 즉 그의 현재 상태는 단순한 경력 요약이 아니라,
          석사 연구의 깊이와 삼성·LG 실무의 현실감, 그리고 OBD식 운영 루프가 결합되어 다음 세대 AI 경험을 정의해가는 전환점입니다.
        </p>
      </article>

      <section className="profile-credential-grid" aria-label="Chris career and education highlights">
        {profileCredentials.map((credential) => (
          <article className="content-card credential-card" key={credential.label}>
            <p className="card-kicker">{credential.label}</p>
            <h3>{credential.value}</h3>
            <p>{credential.detail}</p>
          </article>
        ))}
      </section>

      <article className="content-card profile-lens-card">
        <p className="card-kicker">Core lenses</p>
        <h3>소개 장표에 남길 키워드</h3>
        <div className="lens-list" aria-label="Profile keywords">
          {profileLenses.map((lens) => (
            <span key={lens}>{lens}</span>
          ))}
        </div>
      </article>
    </div>
  )
}

function TeamPanel() {
  return (
    <div className="team-grid" aria-label="Karina Hermes Agent Team">
      <article className="content-card team-loop-card">
        <p className="card-kicker">Task completion loop</p>
        <h3>Chris → Karina → Agent Team → Muyeol → Karina → Chris</h3>
        <p>
          팀은 하나의 루프로 움직입니다. Chris의 지시는 Karina가 정리하고, 각 전문 에이전트가 실행한 뒤,
          Muyeol이 리스크와 public-safe 경계를 확인하고, Karina가 다시 하나의 결과로 종합합니다.
        </p>
        <div className="team-loop-steps" aria-label="Team operating sequence">
          {['Chris order', 'Karina framing', 'Specialist execution', 'Muyeol validation', 'Karina synthesis'].map((step, index) => (
            <span key={step}>{String(index + 1).padStart(2, '0')} · {step}</span>
          ))}
        </div>
      </article>

      <figure className="content-card team-orchestration-image-card" aria-label="Calm orchestration horizon illustration">
        <img
          src={publicAssetPath('/assets/team/team-orchestration-horizon.jpg')}
          alt="Calm blue horizon with a small sailboat for Karina team orchestration"
          width="1280"
          height="640"
          loading="eager"
          decoding="async"
        />
      </figure>

      <section className="agent-card-grid" aria-label="Agent character profiles">
        {agentProfiles.map((agent) => (
          <article className="content-card agent-profile-card" key={agent.name}>
            <div className="agent-face-frame">
              <img src={toAppAssetSrc(agent.faceSrc)} alt={`${agent.name} character face`} width="92" height="92" loading="eager" decoding="async" />
            </div>
            <div className="agent-profile-copy">
              <p className="card-kicker">{agent.title}</p>
              <h3>{agent.name}</h3>
              <p>{agent.summary}</p>
              <p className="agent-handoff">{agent.handoff}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function toAppAssetSrc(path: string) {
  if (path.startsWith('http') || path.startsWith(import.meta.env.BASE_URL)) return path
  return path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path
}

function getTopResearchItemForCurrentWeek(items: ResearchBoardItem[]) {
  if (items.length === 0) return undefined

  const latestWeek = [...new Set(items.map((item) => item.isoWeek))].sort().at(-1)
  const weekItems = latestWeek ? items.filter((item) => item.isoWeek === latestWeek) : items

  return [...weekItems].sort((a, b) => {
    const scoreDelta = b.score - a.score
    if (scoreDelta !== 0) return scoreDelta
    const finalDelta = Number(b.status === 'friday_final_pick') - Number(a.status === 'friday_final_pick')
    if (finalDelta !== 0) return finalDelta
    const validationDelta = Number(b.validationStatus === 'GO') - Number(a.validationStatus === 'GO')
    if (validationDelta !== 0) return validationDelta
    return a.title.localeCompare(b.title)
  })[0]
}

function wrapVisualIndex(index: number, total: number) {
  if (total <= 0) return 0
  return ((index % total) + total) % total
}

function getVisualCarouselOffset(index: number, activeIndex: number, total: number) {
  if (total <= 0) return 0
  let offset = index - activeIndex
  if (offset > total / 2) offset -= total
  if (offset < -total / 2) offset += total
  return offset
}

function HomeVisualHeroPanel() {
  const [visualSet, setVisualSet] = useState<HomeVisualSet>(fallbackHomeVisualSet)
  const [activeIndex, setActiveIndex] = useState(0)
  const [marqueeBoost, setMarqueeBoost] = useState<'left' | 'right' | null>(null)
  const lastWheelAtRef = useRef(0)
  const dragStartRef = useRef<{ x: number; time: number } | null>(null)
  const marqueeBoostTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    let isMounted = true

    loadHomeVisualSet().then((loadedSet) => {
      if (!isMounted) return

      setVisualSet(loadedSet)
      setActiveIndex((currentIndex) => {
        if (loadedSet.items.length === 0) return 0
        return currentIndex > 0 && currentIndex < loadedSet.items.length ? currentIndex : loadedSet.items.length - 1
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    return () => {
      if (marqueeBoostTimeoutRef.current !== null) {
        window.clearTimeout(marqueeBoostTimeoutRef.current)
      }
    }
  }, [])

  const totalItems = visualSet.items.length
  const selectedIndex = totalItems > 0 ? wrapVisualIndex(activeIndex, totalItems) : -1
  const selectedItem = selectedIndex >= 0 ? visualSet.items[selectedIndex] : undefined
  const turntableCount = visualSet.items.filter((item) => item.videoSrc).length
  const firstDate = visualSet.items[0]?.dateKst ?? 'pending'
  const latestDate = visualSet.items.at(-1)?.dateKst ?? 'pending'
  const latestCount = visualSet.items.filter((item) => item.dateKst === latestDate).length

  const triggerMarqueeBoost = (direction: 'left' | 'right') => {
    setMarqueeBoost(direction)
    if (marqueeBoostTimeoutRef.current !== null) {
      window.clearTimeout(marqueeBoostTimeoutRef.current)
    }
    marqueeBoostTimeoutRef.current = window.setTimeout(() => {
      setMarqueeBoost(null)
      marqueeBoostTimeoutRef.current = null
    }, 900)
  }

  const moveCarousel = (delta: number, shouldBoost = false) => {
    if (totalItems < 2) return
    setActiveIndex((currentIndex) => wrapVisualIndex(currentIndex + delta, totalItems))
    if (shouldBoost) triggerMarqueeBoost(delta > 0 ? 'left' : 'right')
  }

  const handleFastMove = (delta: number) => {
    moveCarousel(delta, true)
  }

  const handleCarouselWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (totalItems < 2) return

    const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (Math.abs(dominantDelta) < 20) return

    const now = Date.now()
    if (now - lastWheelAtRef.current < 260) return
    lastWheelAtRef.current = now
    const steps = Math.min(10, Math.max(3, Math.round(Math.abs(dominantDelta) / 42)))
    moveCarousel(dominantDelta > 0 ? steps : -steps, Math.abs(event.deltaX) >= Math.abs(event.deltaY))
  }

  const handleCarouselSwipeEnd = (clientX: number) => {
    if (!dragStartRef.current || totalItems < 2) return

    const deltaX = clientX - dragStartRef.current.x
    const elapsed = Math.max(Date.now() - dragStartRef.current.time, 1)
    dragStartRef.current = null
    if (Math.abs(deltaX) < 28) return

    const distanceSteps = Math.floor(Math.abs(deltaX) / 34)
    const velocity = Math.abs(deltaX) / elapsed
    const velocitySteps = velocity > 1.45 ? 6 : velocity > 0.9 ? 4 : 2
    const steps = Math.min(18, Math.max(4, distanceSteps + velocitySteps))
    moveCarousel(deltaX < 0 ? steps : -steps, true)
  }

  const handleCarouselDragMove = (clientX: number) => {
    if (!dragStartRef.current || totalItems < 2) return

    const deltaX = clientX - dragStartRef.current.x
    if (Math.abs(deltaX) < 72) return

    const steps = Math.min(12, Math.max(5, Math.round(Math.abs(deltaX) / 32)))
    moveCarousel(deltaX < 0 ? steps : -steps, true)
    dragStartRef.current = { x: clientX, time: Date.now() }
  }

  return (
    <div className="home-visual-grid" aria-label="Public-safe home visual carousel">
      <section className="content-card home-visual-carousel-system" aria-label="Viscose-inspired home visual carousel">
        <div className="home-visual-carousel-copy">
          <p className="card-kicker">Home visual flow</p>
          <h3>정면 visual cards 60개가 10px 간격으로 천천히 흐릅니다</h3>
          <p>
            모든 final visual이 회전 없이 정면 상태로 좌측 순환하고, 카드를 클릭하거나 화살표/터치 스크롤로 빠르게 넘기면 아래 turntable detail이 선택 카드에 맞춰 자동재생됩니다.
          </p>
          <div className="archive-stat-grid" aria-label="Home visual archive summary">
            <span><strong>{totalItems}</strong> approved stills</span>
            <span><strong>{turntableCount}</strong> turntables</span>
            <span><strong>{firstDate}</strong> first saved</span>
            <span><strong>{latestDate}</strong> latest final · {latestCount}</span>
          </div>
        </div>

        <div className="home-flow-shell">
          {selectedItem ? (
            <div className="home-flow-meta" aria-label="Selected visual flow metadata">
              <div>
                <span>{String(selectedIndex + 1).padStart(2, '0')}</span>
                <strong>{selectedItem.title}</strong>
                <small>{selectedItem.dateKst}</small>
              </div>
              <div>
                <span>{selectedItem.theme}</span>
                <strong>{selectedItem.mediaCapability}</strong>
              </div>
            </div>
          ) : null}
          <div
            className={`home-flow-stage${marqueeBoost ? ` boost-${marqueeBoost}` : ''}`}
            aria-label="Clean front-facing home visual flow"
            onWheel={handleCarouselWheel}
            onPointerDown={(event) => {
              dragStartRef.current = { x: event.clientX, time: Date.now() }
            }}
            onPointerMove={(event) => {
              handleCarouselDragMove(event.clientX)
            }}
            onPointerUp={(event) => {
              handleCarouselSwipeEnd(event.clientX)
            }}
            onPointerCancel={() => {
              dragStartRef.current = null
            }}
          >
            <div className="home-flow-track" aria-label="Continuous front-facing home visual card row">
              {[...visualSet.items, ...visualSet.items].map((item, loopIndex) => {
                const originalIndex = totalItems > 0 ? loopIndex % totalItems : 0
                const offset = getVisualCarouselOffset(originalIndex, selectedIndex, totalItems)
                const distance = Math.abs(offset)

                return (
                  <button
                    key={`${item.id}-${loopIndex}`}
                    type="button"
                    className={originalIndex === selectedIndex ? 'home-flow-card active' : 'home-flow-card'}
                    aria-pressed={originalIndex === selectedIndex}
                    onClick={() => setActiveIndex(originalIndex)}
                  >
                    <img src={toAppAssetSrc(item.imageSrc)} alt={`${item.title} public home still`} loading={distance <= 2 ? 'eager' : 'lazy'} />
                    <span className="home-flow-index">{String(originalIndex + 1).padStart(2, '0')}</span>
                    <strong>{item.title}</strong>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="home-flow-controls" aria-label="Home visual flow controls">
            <button type="button" className="home-flow-arrow" onClick={() => handleFastMove(-8)} disabled={totalItems < 2} aria-label="홈 비주얼 이전으로 빠르게 이동">
              <span aria-hidden="true">←</span>
            </button>
            <span>{selectedIndex + 1 > 0 ? String(selectedIndex + 1).padStart(2, '0') : '00'} / {String(totalItems).padStart(2, '0')}</span>
            <button type="button" className="home-flow-arrow" onClick={() => handleFastMove(8)} disabled={totalItems < 2} aria-label="홈 비주얼 다음으로 빠르게 이동">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>

      <figure className="content-card visual-archive-image-card">
        <img
          src={publicAssetPath('/assets/visuals/visual-archive-camera-object.jpg')}
          alt="Yellow retro camera object for Visual Archive"
          width="1280"
          height="640"
          loading="eager"
          decoding="async"
        />
      </figure>

      <section className="visual-filmstrip" aria-label="Chronological visual archive quick jump">
        {visualSet.items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === selectedIndex ? 'filmstrip-card active' : 'filmstrip-card'}
            aria-pressed={index === selectedIndex}
            onClick={() => setActiveIndex(index)}
          >
            <img src={toAppAssetSrc(item.imageSrc)} alt={`${item.title} thumbnail`} loading="lazy" />
            <span>{String(index + 1).padStart(2, '0')}</span>
          </button>
        ))}
      </section>

      {selectedItem ? <HomeVisualDetail item={selectedItem} selectedPosition={selectedIndex + 1} totalItems={totalItems} generatedAt={visualSet.generatedAt} policy={visualSet.sourcePolicy} /> : (
        <article className="content-card visual-detail-card">
          <p className="card-kicker">Manifest pending</p>
          <h3>home-visual-set.json을 기다리는 중</h3>
          <p>생성된 public-safe visual manifest가 없으면 UI는 비공개 source를 직접 읽지 않고 빈 fallback 상태로 멈춥니다.</p>
        </article>
      )}
    </div>
  )
}

function HomeVisualDetail({
  item,
  selectedPosition,
  totalItems,
  generatedAt,
  policy,
}: {
  item: HomeVisualItem
  selectedPosition: number
  totalItems: number
  generatedAt: string
  policy: string
}) {
  return (
    <article className="content-card visual-detail-card" aria-label="Selected public home visual detail">
      <div className="visual-detail-header">
        <div>
          <p className="card-kicker">Selected archive item · {selectedPosition}/{totalItems}</p>
          <h3>{item.title}</h3>
        </div>
        <span className="status-chip">{item.status}</span>
      </div>

      <div className="visual-detail-layout">
        <div className="visual-media-frame">
          {item.videoSrc ? (
            <video
              key={item.id}
              src={toAppAssetSrc(item.videoSrc)}
              poster={toAppAssetSrc(item.imageSrc)}
              autoPlay
              controls
              muted
              loop
              playsInline
              aria-label={`${item.title} turntable detail video`}
            />
          ) : (
            <img src={toAppAssetSrc(item.imageSrc)} alt={`${item.title} large static still`} />
          )}
        </div>
        <div className="visual-detail-copy">
          <p><strong>Metaphor</strong> {item.metaphor}</p>
          <p><strong>Dashboard display</strong> chronological static still</p>
          <p><strong>Detail media</strong> {item.detailMedia}</p>
          <p><strong>Media capability</strong> {item.mediaCapability}</p>
          <div className="metadata-grid" aria-label="Public-safe visual metadata">
            <span>Date: {item.metadata.dateKst}</span>
            <span>Source status: {item.metadata.sourceStatus}</span>
            <span>Display: {item.metadata.displayMode}</span>
            <span>Fallback: {item.metadata.detailFallback}</span>
            <span>Prompt: hidden by default</span>
          </div>
          <div className="why-list" aria-label="Public display rationale">
            {item.why.map((reason) => (
              <p key={reason}>{reason}</p>
            ))}
          </div>
        </div>
      </div>

      <p className="manifest-policy">{policy}</p>
      <p className="visual-generated-at">Generated: {generatedAt}</p>
      <div className="research-graph-trace visual-graph-trace" aria-label="Home visual graph breadcrumb">
        <span>HomeVisualGraphBridge</span>
        <ol>
          <li>Artifact</li>
          <li>{item.metadata.sourceStatus}</li>
          <li>Theme: {item.theme}</li>
          <li>HomeVisualHero</li>
          <li>Visual Archive</li>
        </ol>
      </div>
    </article>
  )
}

function laneLabel(lane: ResearchBoardItem['lane']) {
  return lane === 'yuna' ? 'Yuna · AI / agent UX' : 'Go Youn-jung · UX / brand / design'
}

function researchGraphTrace(item: ResearchBoardItem) {
  const sourceNode = item.lane === 'yuna' ? 'Yuna ResearchItem' : 'Go Youn-jung ResearchItem'
  const insightNode = item.lane === 'yuna' ? 'AI/AX Insight' : 'UX·Design Insight'
  const validationNode = item.status === 'friday_final_pick' ? 'Muyeol final pick' : `${item.validationStatus} review queue`

  return [sourceNode, insightNode, 'Chris OBD relevance', validationNode, 'Research Board Artifact']
}

function boardLaneLabel(lane: ResearchBoardItem['lane'] | 'final') {
  return lane === 'final' ? 'Friday final picks · Muyeol validated' : laneLabel(lane)
}

function laneAgentFaces(lane: ResearchBoardItem['lane'] | 'final') {
  if (lane === 'yuna') return [{ name: 'Yuna', src: `${import.meta.env.BASE_URL}assets/team/yuna_profile.jpg` }]
  if (lane === 'goyounjung') return [{ name: 'Go Youn-jung', src: `${import.meta.env.BASE_URL}assets/team/goyounjung_profile.jpg` }]

  return [
    { name: 'Yuna', src: `${import.meta.env.BASE_URL}assets/team/yuna_profile.jpg` },
    { name: 'Go Youn-jung', src: `${import.meta.env.BASE_URL}assets/team/goyounjung_profile.jpg` },
    { name: 'Muyeol', src: `${import.meta.env.BASE_URL}assets/team/muyeol_profile.jpg` },
  ]
}

function primarySourceHref(sourceUrlOrId: string) {
  return sourceUrlOrId.match(/https?:\/\/[^\s;)]+/i)?.[0]
}

function sourceAccessLabel(item: ResearchBoardItem) {
  if (/full/i.test(item.sourceAccess)) return 'full read'
  if (/abstract|metadata/i.test(item.sourceAccess)) return 'abstract / metadata'
  if (/paywall|purchase|subscriber/i.test(item.sourceAccess)) return 'access limited'
  return 'source noted'
}

function ResearchKanbanPanel({ selectedResearchId }: { selectedResearchId?: string }) {
  const [board, setBoard] = useState<ResearchBoard>(fallbackResearchBoard)
  const [selectedId, setSelectedId] = useState('')
  const [validatedStackOrder, setValidatedStackOrder] = useState<string[]>([])
  const [isValidatedMarqueePaused, setIsValidatedMarqueePaused] = useState(false)
  const [query, setQuery] = useState(getInitialResearchQuery)
  const [laneFilter, setLaneFilter] = useState<ResearchLaneFilter>(getInitialResearchLaneFilter)
  const [researchModalLane, setResearchModalLane] = useState<ResearchLaneFilter | null>(null)
  const [scrollingResearchLane, setScrollingResearchLane] = useState<ResearchBoardItem['lane'] | 'final' | null>(null)
  const researchDetailRef = useRef<HTMLDivElement | null>(null)
  const lastMonthlyScrollTargetRef = useRef('')
  const researchScrollTimers = useRef<Partial<Record<ResearchBoardItem['lane'] | 'final', number>>>({})

  const handleResearchLaneScroll = (lane: ResearchBoardItem['lane'] | 'final') => {
    setScrollingResearchLane(lane)

    if (researchScrollTimers.current[lane]) {
      window.clearTimeout(researchScrollTimers.current[lane])
    }

    researchScrollTimers.current[lane] = window.setTimeout(() => {
      setScrollingResearchLane((currentLane) => (currentLane === lane ? null : currentLane))
      delete researchScrollTimers.current[lane]
    }, 900)
  }

  useEffect(() => {
    let isMounted = true
    const scrollTimers = researchScrollTimers.current

    loadResearchBoard().then((loadedBoard) => {
      if (!isMounted) return

      setBoard(loadedBoard)
      setSelectedId((currentId) => {
        const currentStillExists = loadedBoard.items.some((item) => item.id === currentId)
        return currentStillExists ? currentId : getTopResearchItemForCurrentWeek(loadedBoard.items)?.id ?? ''
      })
    })

    return () => {
      isMounted = false
      Object.values(scrollTimers).forEach((timer) => {
        if (timer) window.clearTimeout(timer)
      })
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const searchParams = new URLSearchParams(window.location.search)

    if (query.trim()) {
      searchParams.set('q', query.trim())
    } else {
      searchParams.delete('q')
    }

    if (laneFilter !== 'all') {
      searchParams.set('lane', laneFilter)
    } else {
      searchParams.delete('lane')
    }

    const nextSearch = searchParams.toString()
    const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`

    if (nextUrl !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.history.replaceState(null, '', nextUrl)
    }
  }, [query, laneFilter])

  useEffect(() => {
    const validatedIds = board.items
      .filter((item) => item.status === 'friday_final_pick')
      .map((item) => item.id)

    setValidatedStackOrder((currentOrder) => {
      const keptIds = currentOrder.filter((id) => validatedIds.includes(id))
      const missingIds = validatedIds.filter((id) => !keptIds.includes(id))
      const nextOrder = [...keptIds, ...missingIds]

      return nextOrder.length === currentOrder.length && nextOrder.every((id, index) => id === currentOrder[index])
        ? currentOrder
        : nextOrder
    })
  }, [board.items])

  useEffect(() => {
    if (!selectedResearchId) return
    const targetItem = board.items.find((item) => item.id === selectedResearchId)
    if (!targetItem) return

    setQuery('')
    setLaneFilter('all')
    setSelectedId(targetItem.id)
  }, [board.items, selectedResearchId])

  const normalizedQuery = query.trim().toLowerCase()
  const filteredItems = board.items.filter((item) => {
    const laneMatches = laneFilter === 'all' || item.lane === laneFilter || (laneFilter === 'final' && item.status === 'friday_final_pick')
    const searchableText = [
      item.title,
      item.sourceVenue,
      item.sourceAccess,
      item.sourceUrlOrId,
      item.isoWeek,
      item.dateKst,
      item.summary,
      item.chrisRelevance,
      item.koreanSourceStatus,
      item.duplicateSignal,
      item.status,
      item.validationStatus,
      laneLabel(item.lane),
    ]
      .join(' ')
      .toLowerCase()

    return laneMatches && (!normalizedQuery || searchableText.includes(normalizedQuery))
  })
  const selectedItem = filteredItems.find((item) => item.id === selectedId) ?? getTopResearchItemForCurrentWeek(filteredItems)

  useEffect(() => {
    if (!selectedResearchId || selectedItem?.id !== selectedResearchId) return
    if (lastMonthlyScrollTargetRef.current === selectedResearchId) return

    lastMonthlyScrollTargetRef.current = selectedResearchId
    window.requestAnimationFrame(() => {
      const detailTop = researchDetailRef.current?.getBoundingClientRect().top ?? 0
      const targetY = Math.max(window.scrollY + detailTop - 96, 0)
      window.scrollTo({ top: targetY, left: 0, behavior: 'smooth' })
    })
  }, [selectedItem?.id, selectedResearchId])

  const validatedItemsById = new Map(filteredItems
    .filter((item) => item.status === 'friday_final_pick')
    .map((item) => [item.id, item]))
  const orderedValidatedItems = [
    ...validatedStackOrder.map((id) => validatedItemsById.get(id)).filter((item): item is ResearchBoardItem => Boolean(item)),
    ...filteredItems.filter((item) => item.status === 'friday_final_pick' && !validatedStackOrder.includes(item.id)),
  ]
  const validatedTotal = board.items.filter((item) => item.status === 'friday_final_pick').length
  const visibleValidatedTotal = orderedValidatedItems.length
  const modalItems = researchModalLane === 'all'
    ? filteredItems
    : researchModalLane === 'final'
      ? filteredItems.filter((item) => item.status === 'friday_final_pick')
      : researchModalLane
        ? filteredItems.filter((item) => item.lane === researchModalLane)
        : []
  const modalTitle = researchModalLane === 'yuna'
    ? 'Yuna 리서치 아이템 전체 보기'
    : researchModalLane === 'goyounjung'
      ? 'Go Youn-jung 리서치 아이템 전체 보기'
      : '현재 조건의 리서치 아이템 전체 보기'
  const lanes: Array<ResearchBoardItem['lane']> = ['yuna', 'goyounjung']
  const researchMetrics = {
    yuna: board.items.filter((item) => item.lane === 'yuna').length,
    goyounjung: board.items.filter((item) => item.lane === 'goyounjung').length,
    final: board.items.filter((item) => item.status === 'friday_final_pick').length,
    korean: board.items.filter((item) => /yes|korean|한국|KCI|Korea/i.test(item.koreanSourceStatus)).length,
    validated: board.items.filter((item) => item.validationStatus === 'GO').length,
    watch: board.items.filter((item) => item.validationStatus === 'WATCH').length,
    avgScore: board.items.length === 0 ? 0 : board.items.reduce((sum, item) => sum + item.score, 0) / board.items.length,
  }
  const validatedMarqueeRows = [
    orderedValidatedItems.slice(0, 6),
    orderedValidatedItems.slice(6, 12),
  ]
  const selectedWeekItems = selectedItem ? board.items.filter((item) => item.isoWeek === selectedItem.isoWeek) : []
  const selectedWeekTrend = selectedItem ? buildWeeklyResearchTrend(selectedItem, selectedWeekItems) : null

  return (
    <div className="research-board-grid" aria-label="Chronological research kanban board">
      <article className="content-card research-board-brief">
        <p className="card-kicker">Research loop archive</p>
        <h3>초창기 기록부터 시간순으로 보는 논문 칸반</h3>
        <p>
          `all-research-items.jsonl`에 쌓인 Yuna / Go Youn-jung 리서치 후보를 public-safe manifest로 정규화했습니다.
          대시보드에서는 작은 썸네일 카드로 빠르게 훑고, 클릭하면 상세 근거와 Chris relevance를 확인합니다.
        </p>
        <div className="status-row" aria-label="Research board status">
          <span className="status-chip">items {board.items.length}</span>
          <span className="status-chip">showing {filteredItems.length}</span>
          <span className="status-chip muted">oldest first</span>
          <span className="status-chip muted">public-safe metadata</span>
          <button type="button" className="research-more-button" onClick={() => setResearchModalLane('all')}>More</button>
        </div>
      </article>

      <figure className="content-card research-loop-image-card">
        <img
          src={publicAssetPath('/assets/research/research-loop-archive-pool.jpg')}
          alt="Dark threshold corridor landscape for research loop archive"
          width="1280"
          height="640"
          loading="eager"
          decoding="async"
        />
      </figure>

      <section className="content-card research-filter-card" aria-label="Research board search and lane filters">
        <label className="research-search-field">
          <span>Search papers, sources, weeks, relevance notes</span>
          <input
            type="search"
            value={query}
            placeholder="예: agent UX, KCI, 2026-W32, 브랜드, responsibility"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <div className="research-filter-chips" aria-label="Research lane filter">
          {researchLaneFilters.map((lane) => (
            <button
              key={lane}
              type="button"
              className={laneFilter === lane ? 'filter-chip active' : 'filter-chip'}
              onClick={() => setLaneFilter(lane)}
            >
              {lane === 'all' ? 'All lanes' : boardLaneLabel(lane)}
            </button>
          ))}
          {(query || laneFilter !== 'all') ? (
            <button
              type="button"
              className="filter-chip quiet"
              onClick={() => {
                setQuery('')
                setLaneFilter('all')
              }}
            >
              Clear filters
            </button>
          ) : null}
        </div>
        <p className="research-filter-note">
          검색어와 lane 선택은 URL의 <code>q</code>, <code>lane</code> 파라미터로 조용히 보존됩니다. 특정 연구 묶음을 다시 열 때 같은 화면 상태로 복원됩니다.
        </p>
        <div className="research-context-strip" aria-label="Research board public-safe context metrics">
          <span>Yuna {researchMetrics.yuna}</span>
          <span>Go Youn-jung {researchMetrics.goyounjung}</span>
          <span>Friday picks {researchMetrics.final}</span>
          <span>Muyeol GO {researchMetrics.validated}</span>
          <span>WATCH {researchMetrics.watch}</span>
          <span>Korean signal {researchMetrics.korean}</span>
          <span>Avg {researchMetrics.avgScore.toFixed(1)}</span>
        </div>
      </section>

      <section className="content-card validated-paper-stack-card" aria-label="Muyeol validated key papers stack">
        <div className="validated-paper-stack-header">
          <div>
            <p className="card-kicker">Muyeol validated · key papers</p>
            <h3>검증이 끝난 주요 논문 {visibleValidatedTotal}개</h3>
            <p>
              Muyeol이 GO로 확인한 Friday final pick을 일반 후보와 분리했습니다. 현재 검색/필터 조건에 맞는 {visibleValidatedTotal}개를 보여주며, 전체 검증 논문은 {validatedTotal}개입니다.
              매주 월요일 새 리서치 루프가 시작되면 최신 주차의 1픽과 주간 흐름으로 자동 교체됩니다.
            </p>
          </div>
          <div className="validated-paper-header-actions" aria-label="Validated paper marquee controls">
            <button
              type="button"
              className="marquee-toggle-button"
              aria-label={isValidatedMarqueePaused ? '검증 논문 흐름 재생' : '검증 논문 흐름 정지'}
              aria-pressed={isValidatedMarqueePaused}
              title={isValidatedMarqueePaused ? '재생' : '정지'}
              onClick={() => setIsValidatedMarqueePaused((isPaused) => !isPaused)}
            >
              <span aria-hidden="true">{isValidatedMarqueePaused ? '▶' : 'Ⅱ'}</span>
            </button>
            <button type="button" className="research-more-button" onClick={() => setResearchModalLane('final')}>More</button>
          </div>
        </div>
        <div
          className={isValidatedMarqueePaused ? 'validated-paper-marquee is-marquee-paused' : 'validated-paper-marquee'}
          aria-label="Animated Muyeol validated paper marquee"
        >
          {validatedMarqueeRows.map((rowItems, rowIndex) => (
            <div
              className={rowIndex === 0 ? 'validated-paper-marquee-row left' : 'validated-paper-marquee-row right'}
              key={rowIndex === 0 ? 'left-row' : 'right-row'}
            >
              <div className="validated-paper-marquee-track">
                {[...rowItems, ...rowItems].map((item, index) => (
                  <button
                    key={`${rowIndex}-${item.id}-${index}`}
                    type="button"
                    className="validated-paper-card"
                    aria-label={`${(index % rowItems.length) + 1}번 검증 논문 카드: ${item.title}`}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="validated-paper-rank">{String((index % rowItems.length) + 1 + rowIndex * 6).padStart(2, '0')}</span>
                    <span className="validated-paper-copy">
                      <strong>{item.title}</strong>
                      <small>{laneLabel(item.lane)} · {item.dateKst} · {item.isoWeek}</small>
                      <span>{item.chrisRelevance || item.summary}</span>
                    </span>
                    <span className="validated-paper-badge">Muyeol GO</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div ref={researchDetailRef} className="research-detail-anchor">
        {selectedItem ? <ResearchDetailPanel item={selectedItem} generatedAt={board.generatedAt} policy={board.sourcePolicy} /> : (
          <article className="content-card research-detail-card">
            <p className="card-kicker">{board.items.length > 0 ? 'No matching result' : 'Manifest pending'}</p>
            <h3>{board.items.length > 0 ? '검색 조건에 맞는 카드가 없습니다' : 'research-board.json을 기다리는 중'}</h3>
            <p>
              {board.items.length > 0
                ? '검색어를 줄이거나 All lanes로 되돌리면 public-safe 리서치 후보를 다시 볼 수 있습니다.'
                : '생성된 public-safe research manifest가 없으면 원본 작업 로그를 직접 읽지 않고 fallback 상태로 멈춥니다.'}
            </p>
          </article>
        )}
      </div>

      <section className="research-kanban" aria-label="Yuna and Go Youn-jung research lanes">
        {lanes.map((lane) => {
          const faces = laneAgentFaces(lane)
          const laneItems = filteredItems.filter((item) => item.lane === lane)
          const laneTotal = board.items.filter((item) => item.lane === lane).length
          const laneCountLabel = laneItems.length === laneTotal
            ? `${laneItems.length} items`
            : `${laneItems.length} / ${laneTotal} shown`

          return (
            <article className={`research-lane ${lane}`} key={lane}>
              <div className="research-lane-header">
                <div className="research-lane-title-row">
                  <div className="research-agent-face-stack" aria-label={`${boardLaneLabel(lane)} agents`}>
                    {faces.map((face) => (
                      <img className="research-agent-face" src={face.src} alt={face.name} key={face.name} />
                    ))}
                  </div>
                  <div>
                    <p className="card-kicker">{boardLaneLabel(lane)}</p>
                    <strong>{laneCountLabel}</strong>
                  </div>
                </div>
                {lane === 'yuna' || lane === 'goyounjung' ? (
                  <button type="button" className="research-more-button lane-more" onClick={() => setResearchModalLane(lane)}>
                    More
                  </button>
                ) : null}
              </div>
              <div
                className={scrollingResearchLane === lane ? 'research-card-list is-scrolling' : 'research-card-list'}
                onScroll={() => handleResearchLaneScroll(lane)}
              >
                {laneItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === selectedItem?.id ? 'research-card active' : 'research-card'}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="research-thumb">
                      <span>{item.thumbnailLabel}</span>
                    </span>
                    <span className="research-card-copy">
                      <strong>{item.title}</strong>
                      <small>{item.dateKst} · {item.isoWeek}</small>
                      <span className="research-card-meta">
                        <em>{item.validationStatus}</em>
                        <em>{sourceAccessLabel(item)}</em>
                        {item.status === 'friday_final_pick' ? <em>final pick</em> : null}
                      </span>
                      <span className="research-card-venue">{item.sourceVenue}</span>
                      <span>{item.summary}</span>
                    </span>
                  </button>
                ))}
              </div>
            </article>
          )
        })}
      </section>


      {researchModalLane ? (
        <div className="research-modal-backdrop" role="dialog" aria-modal="true" aria-label="All visible research items">
          <section className="research-modal-panel">
            <div className="research-modal-header">
              <div>
                <p className="card-kicker">Research popup · {modalItems.length} visible</p>
                <h3>{modalTitle}</h3>
              </div>
              <button type="button" className="research-modal-close" aria-label="Close research popup" onClick={() => setResearchModalLane(null)}>×</button>
            </div>
            <div className="research-modal-list">
              {modalItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === selectedItem?.id ? 'research-modal-item active' : 'research-modal-item'}
                  onClick={() => {
                    setSelectedId(item.id)
                    setResearchModalLane(null)
                  }}
                >
                  <span>{item.thumbnailLabel}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <small>{laneLabel(item.lane)} · {item.dateKst} · {item.isoWeek} · {item.validationStatus}</small>
                    <p>{item.summary}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {selectedWeekTrend ? <WeeklyResearchTrendPanel trend={selectedWeekTrend} /> : null}

    </div>
  )
}

function buildWeeklyResearchTrend(selectedItem: ResearchBoardItem, weekItems: ResearchBoardItem[]) {
  const finalCount = weekItems.filter((item) => item.status === 'friday_final_pick').length
  const goCount = weekItems.filter((item) => item.validationStatus === 'GO').length
  const watchCount = weekItems.filter((item) => item.validationStatus === 'WATCH').length
  const weekLabel = selectedItem.isoWeek.match(/W\d+$/)?.[0] ?? selectedItem.isoWeek
  const topTitles = [...weekItems]
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title))
    .slice(0, 3)
    .map((item) => item.title)

  if (weekItems.length === 0) {
    return {
      weekLabel,
      isoWeek: selectedItem.isoWeek,
      segments: [
        { text: `${selectedItem.isoWeek}에는 이 논문을 중심으로 한 공개 가능한 주간 트렌드 데이터가 아직 충분하지 않습니다. 현재는 ` },
        { text: '선택한 논문 자체의 요약과 Chris relevance', emphasis: true },
        { text: '를 먼저 보고, 이후 같은 주차 데이터가 쌓이면 한 주의 흐름을 다시 묶어 볼 수 있습니다.' },
      ],
    }
  }

  return {
    weekLabel,
    isoWeek: selectedItem.isoWeek,
    segments: [
      { text: `${weekLabel}의 핵심 인사이트는 AI 경험을 단순한 기능 목록이 아니라 ` },
      { text: '“기억하고, 맥락을 이해하고, 사람이 판단하기 쉽게 다시 정리해주는 시스템”', emphasis: true },
      { text: `으로 봐야 한다는 점입니다. 이번 주에 검토된 ${weekItems.length}개 논문 중 ${finalCount}개가 final pick으로 좁혀졌고, Muyeol 기준으로 GO ${goCount}개와 WATCH ${watchCount}개 신호가 남았습니다. 특히 ${topTitles.join(' · ')} 같은 논문들은 ` },
      { text: 'agent memory, AI UX, 디자인 의사결정, 한국어/로컬 맥락', emphasis: true },
      { text: '이 따로 떨어진 주제가 아니라 하나의 운영 루프로 연결된다는 점을 보여줍니다. 그래서 이 주의 결론은 ' },
      { text: '“좋은 AI UX는 더 많은 답을 보여주는 화면이 아니라, 사용자의 과거 맥락과 현재 목표를 묶어 다음 선택을 더 선명하게 만들어주는 구조”', emphasis: true },
      { text: '라는 쪽에 가깝습니다. 여기서 중요한 것은 AI가 똑똑해 보이는가보다, 사용자가 지금 무엇을 판단해야 하는지 덜 헤매게 만드는가입니다. 기억 관련 논문은 과거 대화와 작업 맥락을 어떻게 보존해야 하는지 알려주고, UX/디자인 의사결정 관련 논문은 그 기억이 화면에서 어떤 우선순위와 설명 구조로 나타나야 하는지 보여줍니다. 한국어/로컬 맥락 논문은 글로벌 AI 패턴을 그대로 가져오는 것이 아니라 Chris의 언어, 한국 사용자, 삼성·LG에서 익힌 제품 현실감에 맞게 다시 번역해야 한다는 신호를 줍니다. Chris에게는 이 흐름이 OBD 루프를 설계할 때 중요한 기준이 됩니다. 논문을 많이 읽었다는 사실보다, 어떤 정보를 기억해야 하고, 어떤 근거를 남겨야 하며, 어떤 순간에 화면이 판단을 도와야 하는지까지 제품 언어로 바꿔볼 수 있는 주간이기 때문입니다. 결국 ' },
      { text: `${weekLabel}의 논문들은 AI UX를 “답변 생성”이 아니라 “맥락을 축적하고, 의미를 압축하고, 다음 행동을 선택하게 돕는 운영 구조”로 보게 만듭니다.`, emphasis: true },
      { text: ' 이 관점은 Research 탭의 논문 카드, OBD Map의 루프, 그리고 앞으로의 One UI 탐구가 서로 따로 노는 것이 아니라 하나의 판단 시스템으로 이어져야 한다는 방향을 강화합니다.' },
    ],
  }
}

function renderTextSegments(segments: TextSegment[]) {
  return segments.map((segment, index) => (
    segment.emphasis ? <strong key={`${segment.text}-${index}`}>{segment.text}</strong> : <span key={`${segment.text}-${index}`}>{segment.text}</span>
  ))
}

function buildResearchDetailParagraphs(item: ResearchBoardItem): TextSegment[][] {
  const ownerName = laneLabel(item.lane)
  const validationCopy = item.status === 'friday_final_pick'
    ? `Muyeol이 ${item.validationStatus}로 확인한 Friday final pick이며, ${item.isoWeek} 안에서 score ${item.score.toFixed(1)}로 선별된 핵심 후보입니다.`
    : `${item.isoWeek}의 daily candidate이며, 현재 ${item.validationStatus} 검증 상태로 추적 중인 후보입니다.`

  return [
    [
      { text: `${item.title}은 ${ownerName}가 수집한 리서치 흐름에서 ` },
      { text: item.summary, emphasis: true },
      { text: ` ${validationCopy}` },
    ],
    [
      { text: 'Chris 관점에서는 ' },
      { text: item.chrisRelevance, emphasis: true },
      { text: '로 읽힙니다.' },
    ],
    [
      { text: `출처는 ${item.sourceVenue}이며 접근 조건은 ${item.sourceAccess}입니다. ` },
      { text: `한국어/로컬 근거 상태는 ${item.koreanSourceStatus}`, emphasis: true },
      { text: `이고, 중복 검토 메모는 ${item.duplicateSignal}입니다.` },
    ],
    [
      { text: '따라서 이 항목은 단순 카드 요약이 아니라 ' },
      { text: '“핵심 주장 → Chris relevance → 검증 상태 → 출처/접근성 → 중복·로컬 맥락”', emphasis: true },
      { text: '까지 한 번에 판단하기 위한 상세 내용으로 다룹니다.' },
    ],
  ]
}

function renderTextSegmentParagraphs(paragraphs: TextSegment[][]) {
  return paragraphs.map((paragraph, index) => (
    <p className="research-detail-segments" key={`research-detail-paragraph-${index}`}>
      {renderTextSegments(paragraph)}
    </p>
  ))
}

function buildValidatedPaperSynthesis(item: ResearchBoardItem) {
  const summarySegments: TextSegment[] = [
    { text: `${item.title}은 ` },
    { text: 'Muyeol이 GO로 확인한 Friday final pick', emphasis: true },
    { text: '입니다. 핵심 주장은 ' },
    { text: item.summary, emphasis: true },
    { text: '입니다.' },
  ]
  const detailParagraphs = buildResearchDetailParagraphs(item)

  return { summarySegments, detailParagraphs }
}

function ResearchDetailPanel({ item, generatedAt, policy }: { item: ResearchBoardItem; generatedAt: string; policy: string }) {
  const primaryHref = primarySourceHref(item.sourceUrlOrId)
  const validatedSynthesis = item.status === 'friday_final_pick' ? buildValidatedPaperSynthesis(item) : null

  return (
    <article className="content-card research-detail-card" aria-label="Selected research item detail">
      <div className="research-detail-header">
        <div>
          <p className="card-kicker">{laneLabel(item.lane)}</p>
          <h3>{item.title}</h3>
        </div>
        <span className="status-chip">score {item.score.toFixed(1)}</span>
      </div>

      <div className="research-detail-layout">
        <div className={`research-detail-thumb ${item.lane}`} aria-hidden="true">
          <span>{item.thumbnailLabel}</span>
          <small>{item.dateKst}</small>
        </div>
        <div className="research-detail-copy">
          {validatedSynthesis ? (
            <section className="validated-detail-synthesis" aria-label="Validated paper synthesis">
              <div>
                <strong>상세 내용</strong>
                <div className="research-detail-paragraphs">{renderTextSegmentParagraphs(validatedSynthesis.detailParagraphs)}</div>
              </div>
              <div>
                <strong>핵심 요약</strong>
                <p className="research-detail-segments">{renderTextSegments(validatedSynthesis.summarySegments)}</p>
              </div>
            </section>
          ) : (
            <section className="validated-detail-synthesis" aria-label="Research detail synthesis">
              <div>
                <strong>상세 내용</strong>
                <div className="research-detail-paragraphs">{renderTextSegmentParagraphs(buildResearchDetailParagraphs(item))}</div>
              </div>
            </section>
          )}
          <p><strong>Chris relevance</strong>{item.chrisRelevance}</p>
          <div className="metadata-grid" aria-label="Research metadata">
            <span>Week: {item.isoWeek}</span>
            <span>Status: {item.status}</span>
            <span>Muyeol: {item.validationStatus}</span>
            <span>Publication: {item.publicationDate}</span>
            <span>Access: {item.sourceAccess}</span>
            <span>Korean source: {item.koreanSourceStatus}</span>
          </div>
          <div className="research-source-row">
            <p><strong>Source / ID</strong>{item.sourceUrlOrId}</p>
            {primaryHref ? (
              <a className="research-source-link" href={primaryHref} target="_blank" rel="noreferrer">
                안전한 공개 소스 열기
              </a>
            ) : null}
          </div>
          <p><strong>Venue</strong>{item.sourceVenue}</p>
          <p><strong>De-dup note</strong>{item.duplicateSignal}</p>
          <div className="research-graph-trace" aria-label="Research item graph breadcrumb">
            <span>Graph trace</span>
            <ol>
              {researchGraphTrace(item).map((node) => (
                <li key={node}>{node}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <p className="manifest-policy">{policy}</p>
      <p className="visual-generated-at">Generated: {generatedAt}</p>
    </article>
  )
}

function WeeklyResearchTrendPanel({ trend }: { trend: ReturnType<typeof buildWeeklyResearchTrend> }) {
  return (
    <section className="content-card weekly-research-trend" aria-label="Weekly research trend summary">
      <div className="weekly-research-trend-header">
        <p className="card-kicker">한주 논문 요약 트렌드</p>
        <h3><span>{trend.weekLabel}</span> 리서치 흐름</h3>
        <small>{trend.isoWeek} · Monday loop refresh</small>
      </div>
      <p>
        {trend.segments.map((segment, index) => (
          segment.emphasis ? <strong key={`${segment.text}-${index}`}>{segment.text}</strong> : <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ))}
      </p>
    </section>
  )
}

function PlaceholderPanel({ tab }: { tab: Tab }) {
  return (
    <div className="dashboard-grid">
      <article className="content-card hero-card">
        <div>
          <p className="card-kicker">Next build target</p>
          <h3>{tab.title}</h3>
          <p>{tab.description}</p>
        </div>
        <div className="status-row" aria-label="Visual placeholder statuses">
          <span className="status-chip">Local only</span>
          <span className="status-chip muted">No live data</span>
        </div>
      </article>

      <MetricStrip />

      <article className="content-card list-card">
        <p className="card-kicker">Future list surface</p>
        <h3>Calm operating queue</h3>
        <div className="list-stack" aria-label="List placeholders">
          {listPlaceholders.map((label) => (
            <div className="list-item" key={label}>
              <span className="list-dot" />
              <div>
                <strong>{label}</strong>
                <p>Reserved layout row; real content is intentionally deferred.</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

function ArchitectureColumn({ title, branches }: { title: string; branches: ArchitectureBranch[] }) {
  return (
    <article className="content-card architecture-column">
      <div className="architecture-column-header">
        <p className="card-kicker">Hierarchy</p>
        <h3>{title}</h3>
      </div>

      <div className="architecture-tree">
        {branches.map((branch) => (
          <section className="architecture-node" key={branch.title}>
            <div className="node-heading">
              <strong>{branch.title}</strong>
              <span>{branch.intent}</span>
            </div>
            <ul>
              {branch.children.map((child) => (
                <li key={child}>{child}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </article>
  )
}

function DevArchitecturePanel() {
  return (
    <div className="architecture-grid" aria-label="Development hierarchy architecture">
      <article className="content-card architecture-summary">
        <p className="card-kicker">Dev whole map</p>
        <h3>2장으로 읽는 운영 화면과 데이터 계약</h3>
        <p>
          첫 장은 Chris → Karina → Agent Team → Muyeol → Chris로 돌아오는 실제 운영 루프,
          두 번째 장은 그 루프가 화면에 올라오기 전에 통과해야 하는 public-safe data contract입니다.
          이미지 다이어그램이 아니라 dashboard 안에서 바로 검토하는 구성으로 잡았습니다.
        </p>
        <div className="status-row">
          <span className="status-chip">No credentials</span>
          <span className="status-chip muted">Markdown-first</span>
          <span className="status-chip muted">Two screens</span>
        </div>
      </article>

      <ArchitectureSpreadPanel />

      <ArchitectureColumn title="Product IA" branches={productBranches} />
      <ArchitectureColumn title="Local Data Layer" branches={dataBranches} />
    </div>
  )
}

function ObdKnowledgeLoopPanel() {
  const [activeObdSubTab, setActiveObdSubTab] = useState<ObdSubTabId>(() => (
    window.location.hash === '#architecture' ? 'graph' : 'about'
  ))
  const currentSubTab = obdSubTabs.find((subTab) => subTab.id === activeObdSubTab) ?? obdSubTabs[0]

  function selectObdSubTab(subTab: ObdSubTabId) {
    setActiveObdSubTab(subTab)
    window.history.replaceState(null, '', subTab === 'about' ? '#about' : '#obd')
  }

  return (
    <div className="obd-knowledge-shell">
      <nav className="obd-subtab-nav" aria-label="OBD knowledge loop sections">
        {obdSubTabs.map((subTab) => (
          <button
            key={subTab.id}
            type="button"
            className={subTab.id === activeObdSubTab ? 'obd-subtab-button active' : 'obd-subtab-button'}
            aria-pressed={subTab.id === activeObdSubTab}
            onClick={() => selectObdSubTab(subTab.id)}
          >
            <span>{subTab.label}</span>
            <small>{subTab.eyebrow}</small>
          </button>
        ))}
      </nav>

      <section className="obd-subtab-intro" aria-live="polite">
        <p className="card-kicker">{currentSubTab.eyebrow}</p>
        <h3>{currentSubTab.label}</h3>
        <p>{currentSubTab.description}</p>
      </section>

      {activeObdSubTab === 'growth' ? (
        <ObdGrowthTimelinePanel />
      ) : activeObdSubTab === 'about' ? (
        <ChrisIntroPanel />
      ) : (
        <>
          <GraphRelationshipPanel />
          <DevArchitecturePanel />
        </>
      )}
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const normalizedHash = window.location.hash === '#intro' || window.location.hash === '#about'
      ? '#obd'
      : window.location.hash === '#architecture'
        ? '#obd'
        : window.location.hash === '#team'
          ? '#home'
          : window.location.hash
    const hashTab = tabs.find((tab) => `#${tab.id}` === normalizedHash)
    return hashTab ?? tabs[0]
  })
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
  const [isMenuOpen, setIsMenuOpen] = useState(true)
  const [selectedResearchIdFromMonthly, setSelectedResearchIdFromMonthly] = useState('')
  const isDarkMode = themeMode === 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.style.colorScheme = themeMode
    window.localStorage.setItem('august-dashboard-theme', themeMode)
  }, [themeMode])

  function selectTab(tab: Tab) {
    setSelectedResearchIdFromMonthly('')
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab.id}`)
  }

  function openResearchItemFromMonthly(itemId: string) {
    const researchTab = tabs.find((tab) => tab.id === 'research') ?? tabs[0]
    setSelectedResearchIdFromMonthly(itemId)
    setActiveTab(researchTab)
    window.history.replaceState(null, '', `#${researchTab.id}`)
  }

  function toggleThemeMode() {
    setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  function toggleMenuOpen() {
    const currentScrollY = window.scrollY
    setIsMenuOpen((open) => !open)
    window.requestAnimationFrame(() => {
      const maxScrollY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0)
      window.scrollTo({ top: Math.min(currentScrollY, maxScrollY), left: 0 })
    })
  }

  return (
    <main className="app-shell">
      <header className="topbar" aria-label="Dashboard navigation">
        <div className="brand-block">
          <button type="button" className="brand-home-button" onClick={() => selectTab(tabs[0])}>
            Hermes Project Webapp
          </button>
        </div>

        <button
          type="button"
          className="theme-icon-button"
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={isDarkMode}
          onClick={toggleThemeMode}
        >
          {isDarkMode ? (
            <svg className="theme-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M12 2.75v2.5M12 18.75v2.5M4.5 4.5l1.8 1.8M17.7 17.7l1.8 1.8M2.75 12h2.5M18.75 12h2.5M4.5 19.5l1.8-1.8M17.7 6.3l1.8-1.8" />
              <circle cx="12" cy="12" r="4.25" />
            </svg>
          ) : (
            <svg className="theme-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
              <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          className="hamburger-button"
          aria-label={isMenuOpen ? 'Close section menu' : 'Open section menu'}
          aria-expanded={isMenuOpen}
          onClick={toggleMenuOpen}
        >
          <svg className="menu-icon" aria-hidden="true" viewBox="0 0 24 24" focusable="false">
            <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <nav className={isMenuOpen ? 'tab-nav open' : 'tab-nav'} aria-label="Sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab.id ? 'tab-button active' : 'tab-button'}
              aria-pressed={tab.id === activeTab.id}
              onClick={() => selectTab(tab)}
            >
              <span>{tab.label}</span>
              <small>{tab.eyebrow}</small>
            </button>
          ))}
        </nav>
      </header>

      <section className={`workspace ${activeTab.id}-workspace`} aria-live="polite">
        <div className="workspace-header">
          <p className="eyebrow">{activeTab.eyebrow}</p>
          <h2>{activeTab.title}</h2>
          <p>{activeTab.description}</p>
        </div>

        {activeTab.id === 'home' ? (
          <TeamPanel />
        ) : activeTab.id === 'visuals' ? (
          <HomeVisualHeroPanel />
        ) : activeTab.id === 'obd' ? (
          <ObdKnowledgeLoopPanel />
        ) : activeTab.id === 'research' ? (
          <ResearchKanbanPanel selectedResearchId={selectedResearchIdFromMonthly} />
        ) : activeTab.id === 'report' ? (
          <>
            <MonthlyResearchSynthesisPanel onSelectResearchItem={openResearchItemFromMonthly} />
            <MuyeolValidationPanel />
          </>
        ) : (
          <PlaceholderPanel tab={activeTab} />
        )}
      </section>
    </main>
  )
}

export default App
