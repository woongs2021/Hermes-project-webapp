import { useEffect, useRef, useState, type WheelEvent } from 'react'
import { fallbackManifest, loadDashboardManifest, type DashboardManifest } from './dashboardContent'
import { fallbackHomeVisualSet, loadHomeVisualSet, type HomeVisualItem, type HomeVisualSet } from './homeVisualSet'
import { fallbackResearchBoard, loadResearchBoard, type ResearchBoard, type ResearchBoardItem } from './researchBoard'
import { GraphRelationshipPanel, MonthlyResearchSynthesisPanel, MuyeolValidationPanel, ObdGrowthTimelinePanel } from './extendedPanels'
import './App.css'

type TabId = 'home' | 'obd' | 'visuals' | 'research' | 'report'
type ThemeMode = 'light' | 'dark'
type ObdSubTabId = 'growth' | 'graph' | 'about'

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
  {
    id: 'about',
    label: 'About OBD',
    eyebrow: 'definition and Chris profile',
    description: 'OBD 루프가 무엇인지 쉽게 정의하고, Chris가 왜 이 관점으로 AI 시대의 경험과 비즈니스를 탐구하는지 설명합니다.',
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
  'Ontology Business Designer for the AI era',
]

const agentProfiles: AgentProfile[] = [
  {
    name: 'Karina',
    title: 'Coordination Lead · CDO Partner',
    faceSrc: '/assets/team/karina_profile.jpg',
    summary: 'Chris의 요청을 제품 언어와 실행 순서로 정리하고, Agent Team 전체의 우선순위와 handoff를 조율합니다.',
    handoff: '최종 응답은 Karina가 하나의 명확한 synthesis로 묶어 Chris에게 돌려주는 역할입니다.',
  },
  {
    name: 'Yuna',
    title: 'Research Intelligence',
    faceSrc: '/assets/team/yuna_profile.jpg',
    summary: '논문, 시장, 레퍼런스, 지식 탐색을 맡아 AI UX와 OBD 판단에 필요한 근거를 수집합니다.',
    handoff: 'Faker나 Son이 실행 방향을 잡을 수 있도록 핵심 signal과 source 맥락을 넘깁니다.',
  },
  {
    name: 'Go Youn-jung',
    title: 'Visual / Experience Muse',
    faceSrc: '/assets/team/goyounjung_profile.jpg',
    summary: '홈 비주얼, 정서적 톤, 브랜드 감각을 통해 따뜻하고 인간적인 AI UX의 분위기를 구체화합니다.',
    handoff: '승인된 still과 turntable은 public-safe manifest를 통해 Home Visual Archive에 반영됩니다.',
  },
  {
    name: 'Son',
    title: 'Scope / Priority Strategist',
    faceSrc: '/assets/team/son_profile.jpg',
    summary: '범위, 수용 기준, 프로젝트 순서를 정리해 팀이 작은 단위로 끝까지 완료할 수 있게 합니다.',
    handoff: '속도와 품질 사이의 선택지를 분명하게 나누고 다음 실행 단위를 제안합니다.',
  },
  {
    name: 'Faker',
    title: 'Coding / Automation Builder',
    faceSrc: '/assets/team/faker_profile.jpg',
    summary: '프로토타입, 스크립트, 웹 대시보드, GitHub Pages 배포처럼 실제 작동하는 산출물을 구현합니다.',
    handoff: '빌드, lint, manifest readback, Pages smoke처럼 실행 근거를 남겨 Karina가 신뢰 있게 종합할 수 있게 합니다.',
  },
  {
    name: 'Muyeol',
    title: 'QA / Risk Validation',
    faceSrc: '/assets/team/muyeol_profile.jpg',
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

      <article className="content-card profile-statement-card">
        <p className="card-kicker">Chris profile</p>
        <h3>크리스는 AI 시대의 경험과 비즈니스 언어를 설계하는 OBD입니다</h3>
        <p>
          크리스(Chris)는 UX, 브랜드, 디자인 전략을 연결해 사람이 이해하고 신뢰할 수 있는 AI 경험을 탐구합니다.
          기술 자체보다 “이 기술이 사람에게 어떤 의미가 되는가”를 먼저 묻고, 그 의미를 제품 화면, 서비스 구조,
          브랜드 언어, 의사결정 기준으로 번역합니다.
        </p>
      </article>

      <article className="content-card intro-hero-card">
        <p className="card-kicker">Personal positioning</p>
        <h3>OBD: Ontology Business Designer</h3>
        <p>
          Designing meaning, systems, and business for the AI era. 크리스는 UX, 브랜드,
          디자인 전략을 바탕으로 사람이 안심하고 이해할 수 있는 AI 경험과 미래 One UI의 언어를 탐구합니다.
        </p>
        <div className="status-row" aria-label="Profile positioning tags">
          <span className="status-chip">CEO lens</span>
          <span className="status-chip muted">CDO partner: Karina</span>
          <span className="status-chip muted">AI-era OBD</span>
        </div>
      </article>

      <article className="content-card profile-statement-card">
        <p className="card-kicker">Profile statement</p>
        <h3>기술을 사람의 의미 체계로 번역하는 디자이너</h3>
        <p>
          Samsung MX의 시니어 UX 디자이너이자 전 LG BX 브랜드 디자이너로서, 제품 경험과 브랜드 시스템,
          리서치와 전략을 연결해 AI 시대의 새로운 판단 구조와 비즈니스 언어를 설계합니다.
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

      <section className="agent-card-grid" aria-label="Agent character profiles">
        {agentProfiles.map((agent) => (
          <article className="content-card agent-profile-card" key={agent.name}>
            <div className="agent-face-frame">
              <img src={toAppAssetSrc(agent.faceSrc)} alt={`${agent.name} character face`} loading="lazy" />
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
  return path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path
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

function ResearchKanbanPanel() {
  const [board, setBoard] = useState<ResearchBoard>(fallbackResearchBoard)
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState(getInitialResearchQuery)
  const [laneFilter, setLaneFilter] = useState<ResearchLaneFilter>(getInitialResearchLaneFilter)
  const [researchModalLane, setResearchModalLane] = useState<ResearchLaneFilter | null>(null)
  const [scrollingResearchLane, setScrollingResearchLane] = useState<ResearchBoardItem['lane'] | 'final' | null>(null)
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
        return currentStillExists ? currentId : loadedBoard.items[0]?.id ?? ''
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
  const selectedItem = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0]
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
  const lanes: Array<ResearchBoardItem['lane'] | 'final'> = ['yuna', 'goyounjung', 'final']
  const researchMetrics = {
    yuna: board.items.filter((item) => item.lane === 'yuna').length,
    goyounjung: board.items.filter((item) => item.lane === 'goyounjung').length,
    final: board.items.filter((item) => item.status === 'friday_final_pick').length,
    korean: board.items.filter((item) => /yes|korean|한국|KCI|Korea/i.test(item.koreanSourceStatus)).length,
    validated: board.items.filter((item) => item.validationStatus === 'GO').length,
    watch: board.items.filter((item) => item.validationStatus === 'WATCH').length,
    avgScore: board.items.length === 0 ? 0 : board.items.reduce((sum, item) => sum + item.score, 0) / board.items.length,
  }

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

      <section className="research-kanban" aria-label="Yuna, Go Youn-jung, and Friday final pick research lanes">
        {lanes.map((lane) => {
          const faces = laneAgentFaces(lane)
          const laneItems = lane === 'final'
            ? filteredItems.filter((item) => item.status === 'friday_final_pick')
            : filteredItems.filter((item) => item.lane === lane)
          const laneTotal = lane === 'final'
            ? board.items.filter((item) => item.status === 'friday_final_pick').length
            : board.items.filter((item) => item.lane === lane).length
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
  )
}

function ResearchDetailPanel({ item, generatedAt, policy }: { item: ResearchBoardItem; generatedAt: string; policy: string }) {
  const primaryHref = primarySourceHref(item.sourceUrlOrId)

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
          <p><strong>간단 설명</strong>{item.summary}</p>
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

function SampleDataPanel() {
  const [manifest, setManifest] = useState<DashboardManifest>(fallbackManifest)
  const [selectedPath, setSelectedPath] = useState(fallbackManifest.documents[0]?.path ?? '')
  const selectedDocument = manifest.documents.find((document) => document.path === selectedPath)

  useEffect(() => {
    let isMounted = true

    loadDashboardManifest().then((loadedManifest) => {
      if (!isMounted) return

      setManifest(loadedManifest)
      setSelectedPath((currentPath) => {
        const currentStillExists = loadedManifest.documents.some((document) => document.path === currentPath)
        return currentStillExists ? currentPath : loadedManifest.documents[0]?.path ?? ''
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <article className="content-card sample-data-card">
      <div className="sample-data-header">
        <div>
          <p className="card-kicker">Generated manifest loader</p>
          <h3>Public-safe Markdown / JSON manifest preview</h3>
        </div>
        <span className="status-chip">read-only</span>
      </div>

      <p className="manifest-policy">{manifest.sourcePolicy}</p>

      <div className="sample-data-layout">
        <div className="source-list" aria-label="Manifest data sources">
          {manifest.documents.map((document) => (
            <button
              key={document.path}
              type="button"
              className={document.path === selectedPath ? 'source-button active' : 'source-button'}
              onClick={() => setSelectedPath(document.path)}
            >
              <strong>{document.title}</strong>
              <span>{document.path}</span>
            </button>
          ))}
        </div>

        {selectedDocument ? (
          <section className="source-preview" aria-label="Selected manifest source preview">
            <div className="preview-meta">
              <span>{selectedDocument.section}</span>
              <span>{selectedDocument.format}</span>
              <span>{selectedDocument.publicSafe ? 'public-safe manifest' : 'private hold'}</span>
              <span>v{manifest.version}</span>
            </div>
            <h4>{selectedDocument.title}</h4>
            <p>{selectedDocument.summary}</p>
            <pre>{selectedDocument.bodyPreview}</pre>
          </section>
        ) : null}
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
      <SampleDataPanel />

      <article className="content-card boundary-card">
        <p className="card-kicker">Boundary rule</p>
        <h3>Public-safe shell 먼저, private source는 나중에 분리</h3>
        <div className="boundary-lanes" aria-label="Privacy boundary lanes">
          <div>
            <strong>Allowed in UI</strong>
            <p>요약, 상태, 공개 가능한 rationale, 로컬 샘플 데이터, aggregate counts.</p>
          </div>
          <div>
            <strong>Hold / private</strong>
            <p>원본 DM, credentials, raw private IDs, OAuth/API keys, 내부 판단 전문.</p>
          </div>
        </div>
      </article>
    </div>
  )
}

function ObdKnowledgeLoopPanel() {
  const [activeObdSubTab, setActiveObdSubTab] = useState<ObdSubTabId>(() => (
    window.location.hash === '#about' || window.location.hash === '#intro' ? 'about' : 'growth'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isDarkMode = themeMode === 'dark'

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode
    document.documentElement.style.colorScheme = themeMode
    window.localStorage.setItem('august-dashboard-theme', themeMode)
  }, [themeMode])

  function selectTab(tab: Tab) {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab.id}`)
  }

  function toggleThemeMode() {
    setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
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
          onClick={() => setIsMenuOpen((open) => !open)}
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
          <ResearchKanbanPanel />
        ) : activeTab.id === 'report' ? (
          <>
            <MonthlyResearchSynthesisPanel />
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
