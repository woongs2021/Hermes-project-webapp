import { useEffect, useState } from 'react'
import { fallbackManifest, loadDashboardManifest, type DashboardManifest } from './dashboardContent'
import { fallbackHomeVisualSet, loadHomeVisualSet, type HomeVisualItem, type HomeVisualSet } from './homeVisualSet'
import { fallbackResearchBoard, loadResearchBoard, type ResearchBoard, type ResearchBoardItem } from './researchBoard'
import { GraphRelationshipPanel, MonthlyResearchSynthesisPanel, MuyeolValidationPanel, ObdGrowthTimelinePanel } from './extendedPanels'
import './App.css'

type TabId = 'home' | 'intro' | 'team' | 'obd' | 'research' | 'report' | 'architecture'
type ThemeMode = 'light' | 'dark'

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

const tabs: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    eyebrow: 'Today’s visual system',
    title: 'Home Visual Archive',
    description: '최종 승인된 Go Youn-jung 홈 비주얼을 오래된 순서로 누적하고, 각 still을 클릭하면 turntable detail을 확인합니다.',
  },
  {
    id: 'intro',
    label: 'Intro',
    eyebrow: 'Chris profile',
    title: 'Ontology Business Designer',
    description: 'Chris의 이력과 AI 시대 OBD 포지셔닝을 한 장의 소개 화면으로 정리합니다.',
  },
  {
    id: 'team',
    label: 'Team',
    eyebrow: 'Orchestration',
    title: 'Karina Hermes Team',
    description: 'Chris의 지시를 Karina가 조율하고, Agent Team이 실행하며, Muyeol이 검증한 뒤 다시 Chris에게 돌아오는 작업 완료 루프입니다.',
  },
  {
    id: 'obd',
    label: 'OBD',
    eyebrow: 'Growth timeline',
    title: 'OBD Growth Loop',
    description: '수집된 자료가 온톨로지, 비즈니스 판단, 따뜻한 AI UX 언어로 바뀌는 카드형 성장 타임라인입니다.',
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
  {
    id: 'architecture',
    label: 'Graph',
    eyebrow: 'OBD relation graph',
    title: 'Dashboard Knowledge Graph',
    description: 'Home visual, research, OBD, Muyeol validation을 Chris에게 돌아오는 하나의 관계 루프로 연결합니다.',
  },
]

const metricPlaceholders = ['Primary signal', 'Open loops', 'Weekly check-in']
const listPlaceholders = ['Next handoff note', 'Recent validation slot', 'Reference card surface']
const researchLaneFilters = ['all', 'yuna', 'goyounjung', 'final'] as const

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
    title: 'Metaphor Loops',
    intent: '세계관 진입점',
    children: ['Command Garden', 'Research Constellation', 'Growth Loom', 'Entry links'],
  },
  {
    title: 'Overview',
    intent: '오늘의 운영 요약',
    children: ['Today Summary', 'Loop Status', 'Key Metrics', 'Recent Activity', 'Quick Actions'],
  },
  {
    title: 'Team',
    intent: 'Karina 중심 실행 루프',
    children: ['Task Completion Loop', 'Agent Role Cards', 'Active Handoffs', 'Blockers'],
  },
  {
    title: 'OBD',
    intent: '일간/주간 성장 기록',
    children: ['Daily Growth', 'Weekly Growth', 'OBD Lens', 'Growth Visualization'],
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
    title: '/data/metaphor-loops',
    intent: '첫 화면 개념 카드 원문',
    children: ['command-garden.md', 'research-constellation.md', 'growth-loom.md'],
  },
  {
    title: '/data/overview',
    intent: '운영 요약 소스',
    children: ['today.md', 'weekly-summary.md', 'recent-activity.json'],
  },
  {
    title: '/data/team',
    intent: '에이전트 역할과 handoff',
    children: ['agents.md', 'orchestration.md', 'handoffs.md'],
  },
  {
    title: '/data/obd',
    intent: '성장 루프 로컬 기록',
    children: ['daily/YYYY-MM-DD.md', 'weekly/YYYY-Www.md', 'patterns.json'],
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
        <p className="card-kicker">Personal positioning</p>
        <h3>OBD: Ontology Business Designer</h3>
        <p>
          Designing meaning, systems, and business for the AI era. Chris는 UX, 브랜드,
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

function toAppAssetSrc(path: string) {
  return path.startsWith('/') ? `${import.meta.env.BASE_URL}${path.slice(1)}` : path
}

function HomeVisualHeroPanel() {
  const [visualSet, setVisualSet] = useState<HomeVisualSet>(fallbackHomeVisualSet)
  const [selectedId, setSelectedId] = useState('')

  useEffect(() => {
    let isMounted = true

    loadHomeVisualSet().then((loadedSet) => {
      if (!isMounted) return

      setVisualSet(loadedSet)
      setSelectedId((currentId) => {
        const currentStillExists = loadedSet.items.some((item) => item.id === currentId)
        return currentStillExists ? currentId : loadedSet.items[0]?.id ?? ''
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  const selectedItem = visualSet.items.find((item) => item.id === selectedId) ?? visualSet.items[0]
  const selectedIndex = selectedItem ? visualSet.items.findIndex((item) => item.id === selectedItem.id) : -1
  const turntableCount = visualSet.items.filter((item) => item.videoSrc).length
  const firstDate = visualSet.items[0]?.dateKst ?? 'pending'
  const latestDate = visualSet.items.at(-1)?.dateKst ?? 'pending'
  const latestItems = visualSet.items.filter((item) => item.dateKst === latestDate)
  const latestLead = latestItems[0]
  const latestSupport = latestItems.slice(1)

  return (
    <div className="home-visual-grid" aria-label="Public-safe home visual archive">
      <article className="content-card home-visual-brief archive-summary-card">
        <div>
          <p className="card-kicker">Today’s visual system</p>
          <h3>최신 final 세트를 먼저 읽고, 아래에 archive를 누적합니다</h3>
          <p>
            홈은 canonical final set을 오늘의 시각 시스템으로 먼저 보여주고, 승인된 still history는 아래 masonry archive에 이어 붙입니다.
            카드를 누르면 detail 영역에서 해당 still 또는 turntable을 바로 확인합니다.
          </p>
        </div>
        <div className="archive-stat-grid" aria-label="Home visual archive summary">
          <span><strong>{visualSet.items.length}</strong> approved stills</span>
          <span><strong>{turntableCount}</strong> turntables</span>
          <span><strong>{firstDate}</strong> first saved</span>
          <span><strong>{latestDate}</strong> current final</span>
        </div>
      </article>

      {latestItems.length > 0 ? (
        <section className="content-card latest-visual-system" aria-label="Latest final home visual set">
          <div className="latest-visual-copy">
            <p className="card-kicker">Canonical source gate</p>
            <h3>{latestDate} final visual set</h3>
            <p>
              pending 이미지는 섞지 않고, public-safe manifest를 통과한 최신 final 항목만 홈 상단에 고정합니다.
              아래 전체 archive와 같은 detail disclosure를 공유합니다.
            </p>
            <ol className="latest-visual-trace" aria-label="Home visual graph bridge">
              <li>Final visual source</li>
              <li>HomeVisualHero</li>
              <li>Visual Archive</li>
              <li>Graph Artifact</li>
            </ol>
          </div>
          <div className="latest-visual-cards">
            {latestLead ? (
              <button
                key={latestLead.id}
                type="button"
                className={latestLead.id === selectedItem?.id ? 'latest-visual-card lead active' : 'latest-visual-card lead'}
                aria-pressed={latestLead.id === selectedItem?.id}
                onClick={() => setSelectedId(latestLead.id)}
              >
                <img src={toAppAssetSrc(latestLead.imageSrc)} alt={`${latestLead.title} latest final lead still`} loading="lazy" />
                <span>Lead · {latestLead.mediaCapability}</span>
                <strong>{latestLead.title}</strong>
              </button>
            ) : null}
            <div className="latest-support-stack" aria-label="Supporting latest visual cards">
              {latestSupport.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === selectedItem?.id ? 'latest-visual-card support active' : 'latest-visual-card support'}
                  aria-pressed={item.id === selectedItem?.id}
                  onClick={() => setSelectedId(item.id)}
                >
                  <img src={toAppAssetSrc(item.imageSrc)} alt={`${item.title} latest final support still`} loading="lazy" />
                  <span>Support · {item.mediaCapability}</span>
                  <strong>{item.title}</strong>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="visual-board visual-archive-board" aria-label="Final public home visual archive cards">
        {visualSet.items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={item.id === selectedItem?.id ? 'visual-card active' : 'visual-card'}
            aria-pressed={item.id === selectedItem?.id}
            onClick={() => setSelectedId(item.id)}
          >
            <img src={toAppAssetSrc(item.imageSrc)} alt={`${item.title} public home still`} loading="lazy" />
            <span className="visual-index">{String(index + 1).padStart(2, '0')} · {item.dateKst}</span>
            <div className="visual-card-copy">
              <strong>{item.title}</strong>
              <span>{item.theme}</span>
            </div>
          </button>
        ))}
      </section>

      {selectedItem ? <HomeVisualDetail item={selectedItem} selectedPosition={selectedIndex + 1} totalItems={visualSet.items.length} generatedAt={visualSet.generatedAt} policy={visualSet.sourcePolicy} /> : (
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
              src={toAppAssetSrc(item.videoSrc)}
              poster={toAppAssetSrc(item.imageSrc)}
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
        </div>
      </div>

      <p className="manifest-policy">{policy}</p>
      <p className="visual-generated-at">Generated: {generatedAt}</p>
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

  useEffect(() => {
    let isMounted = true

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
                <p className="card-kicker">{boardLaneLabel(lane)}</p>
                <strong>{laneCountLabel}</strong>
              </div>
              <div className="research-card-list">
                {laneItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={item.id === selectedItem?.id ? 'research-card active' : 'research-card'}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <span className="research-thumb">{item.thumbnailLabel}</span>
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

function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const hashTab = tabs.find((tab) => `#${tab.id}` === window.location.hash)
    return hashTab ?? tabs[0]
  })
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)
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
      <aside className="app-sidebar" aria-label="Dashboard navigation">
        <div className="brand-block">
          <p className="eyebrow">August Dashboard</p>
          <h1>Local admin shell</h1>
        </div>

        <div className="theme-mode-panel" aria-label="Display mode">
          <span>{isDarkMode ? 'Dark mode' : 'Light mode'}</span>
          <button
            type="button"
            className="theme-toggle-button"
            aria-pressed={isDarkMode}
            onClick={toggleThemeMode}
          >
            <span className="theme-toggle-track" aria-hidden="true">
              <span className="theme-toggle-thumb" />
            </span>
            {isDarkMode ? 'Switch to light' : 'Switch to dark'}
          </button>
        </div>

        <nav className="tab-nav" aria-label="Sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={tab.id === activeTab.id ? 'tab-button active' : 'tab-button'}
              aria-pressed={tab.id === activeTab.id}
              onClick={() => selectTab(tab)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace" aria-live="polite">
        <div className="workspace-header">
          <p className="eyebrow">{activeTab.eyebrow}</p>
          <h2>{activeTab.title}</h2>
          <p>{activeTab.description}</p>
        </div>

        {activeTab.id === 'home' ? (
          <HomeVisualHeroPanel />
        ) : activeTab.id === 'intro' ? (
          <ChrisIntroPanel />
        ) : activeTab.id === 'obd' ? (
          <ObdGrowthTimelinePanel />
        ) : activeTab.id === 'research' ? (
          <ResearchKanbanPanel />
        ) : activeTab.id === 'report' ? (
          <>
            <MonthlyResearchSynthesisPanel />
            <MuyeolValidationPanel />
          </>
        ) : activeTab.id === 'architecture' ? (
          <>
            <GraphRelationshipPanel />
            <DevArchitecturePanel />
          </>
        ) : (
          <PlaceholderPanel tab={activeTab} />
        )}
      </section>
    </main>
  )
}

export default App
