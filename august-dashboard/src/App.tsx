import { useEffect, useState } from 'react'
import { fallbackManifest, loadDashboardManifest, type DashboardManifest } from './dashboardContent'
import './App.css'

type TabId = 'home' | 'intro' | 'team' | 'obd' | 'research' | 'graph' | 'report' | 'architecture'

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

type GraphLayer = {
  title: string
  subtitle: string
  description: string
  nodes: string[]
}

type RelationExample = {
  from: string
  relation: string
  to: string
}

type HomeVisualItem = {
  id: string
  role: 'Lead' | 'Support'
  title: string
  theme: string
  metaphor: string
  why: string[]
  model: string
  imagePath: string
}

const tabs: Tab[] = [
  {
    id: 'home',
    label: 'Home',
    eyebrow: 'Local command center',
    title: 'August Dashboard',
    description: 'Chris, Karina, and the agent-team loops will land here as a calm local operating overview.',
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
    description: 'A future place for agent roles, handoffs, and current task surfaces without exposing private credentials.',
  },
  {
    id: 'obd',
    label: 'OBD',
    eyebrow: 'Growth loop',
    title: 'OBD Loop',
    description: 'A lightweight shell for daily and weekly OBD reflections, patterns, and next-action placeholders.',
  },
  {
    id: 'research',
    label: 'Research',
    eyebrow: 'Knowledge loop',
    title: 'Research Library',
    description: 'A quiet reading surface for papers, insights, and synthesis cards once static sample data is introduced.',
  },
  {
    id: 'graph',
    label: 'Graph',
    eyebrow: 'Harness / Loop / Graph Engineering',
    title: 'Graph Engineering MVP',
    description: '루프 결과를 공개 안전한 노드와 관계 카드로 바꾸는 첫 번째 파일 기반 그래프 후보입니다.',
  },
  {
    id: 'report',
    label: 'Muyeol Report',
    eyebrow: 'Validation loop',
    title: 'Muyeol Report',
    description: 'A report shell for risk checks, recommendations, and weekly validation notes after Week 1 handoff.',
  },
  {
    id: 'architecture',
    label: 'Dev Architecture',
    eyebrow: 'Hierarchy map',
    title: '2-Screen Dev Architecture',
    description: 'A UI-native architecture tab that separates the user-facing command loop from the public-safe data contract screen.',
  },
]

const metricPlaceholders = ['Primary signal', 'Open loops', 'Weekly check-in']
const listPlaceholders = ['Next handoff note', 'Recent validation slot', 'Reference card surface']

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

const graphLayers: GraphLayer[] = [
  {
    title: 'Harness',
    subtitle: 'Safe operating base',
    description: 'Karina, specialist agents, Hermes tools, cron, files, routing, permissions, and public/private boundaries를 한 운영 기반으로 묶습니다.',
    nodes: ['Agent', 'Tool', 'Route', 'Permission', 'Boundary'],
  },
  {
    title: 'Loop',
    subtitle: 'Recurring judgment rhythm',
    description: 'Yuna research, Go Youn-jung visual interpretation, Son growth translation, Faker webapp structuring, Muyeol validation이 매일/매주 반복됩니다.',
    nodes: ['ResearchItem', 'Insight', 'GrowthQuestion', 'Artifact', 'RiskReview'],
  },
  {
    title: 'Graph Engineering',
    subtitle: 'Relation-first memory',
    description: 'Markdown/JSONL 로그를 명시적인 nodes.jsonl, edges.jsonl, schema.md 후보로 바꿔 판단의 연결 구조를 남깁니다.',
    nodes: ['Theme', 'Decision', 'FEEDS', 'VALIDATED_BY', 'BELONGS_TO_THEME'],
  },
]

const relationExamples: RelationExample[] = [
  { from: 'Yuna ResearchItem', relation: 'SUPPORTS', to: 'AI/AX job-shift Insight' },
  { from: 'Go Youn-jung Artifact', relation: 'FEEDS', to: 'HomeVisualHero / Visual Archive' },
  { from: 'Muyeol RiskReview', relation: 'VALIDATED_BY', to: 'public-safe Graph Card' },
]

const homeVisualSet = {
  dateKst: '2026-08-03',
  status: 'final current',
  source: 'current-home-visual-set.json',
  promptPolicy: 'Exact prompts hidden by default',
  items: [
    {
      id: '2026-08-03-goyounjung-01-mint-calm-settlement-basin',
      role: 'Lead',
      title: 'Calm Settlement Basin',
      theme: 'mint / #10C19F·#A6E6D4·#04221C',
      metaphor: 'single rounded shallow basin for settling signals into shared value rules',
      why: [
        '복잡한 사용자 신호가 즉시 결론으로 튀지 않고, 한 번 가라앉아 공통의 가치 규칙으로 정리되는 과정을 표현합니다.',
        '조용한 표면과 무게 중심으로 OBD 판단의 안정감을 실험한 final visual입니다.',
      ],
      model: 'seedream_v5_pro',
      imagePath: 'image-gallery/2026-08-03/01-mint-calm-settlement-basin-1080.png',
    },
    {
      id: '2026-08-03-goyounjung-02-neutral-frictionless-journey-slipper',
      role: 'Support',
      title: 'Frictionless Journey Slipper',
      theme: 'neutral off-white/ink with blue accent / #FCFCFF·#010102·#4065F8·#A1D0F6',
      metaphor: 'single rounded soft slipper for low-friction AI UX adoption and emotional safety',
      why: [
        '미래 One UI의 좋은 AI 경험을 사용자가 부담 없이 발을 들이는 낮은 마찰의 동선으로 해석합니다.',
        '몸의 감각과 진입 장벽을 다루는 footwear 메타포로 더 인간적인 UX 신호를 보여줍니다.',
      ],
      model: 'seedream_v5_pro',
      imagePath: 'image-gallery/2026-08-03/02-neutral-frictionless-journey-slipper-1080.png',
    },
  ] satisfies HomeVisualItem[],
}

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

function GraphEngineeringPanel() {
  return (
    <div className="graph-grid" aria-label="Harness Loop Graph Engineering MVP">
      <article className="content-card graph-hero-card">
        <p className="card-kicker">Public-safe graph candidate</p>
        <h3>운영 로그를 관계가 보이는 제품 구조로 바꿉니다</h3>
        <p>
          오늘은 무거운 DB 없이, 웹앱 안에서 먼저 읽히는 세 층 설명과 relation breadcrumb를 만들었습니다.
          이후 nodes.jsonl, edges.jsonl, schema.md로 옮겨도 같은 언어를 유지할 수 있습니다.
        </p>
        <div className="status-row" aria-label="Graph MVP status">
          <span className="status-chip">File-first MVP</span>
          <span className="status-chip muted">No raw private logs</span>
          <span className="status-chip muted">Card before network</span>
        </div>
      </article>

      <section className="graph-layer-grid" aria-label="Three graph layers">
        {graphLayers.map((layer) => (
          <article className="content-card graph-layer-card" key={layer.title}>
            <p className="card-kicker">{layer.subtitle}</p>
            <h3>{layer.title}</h3>
            <p>{layer.description}</p>
            <div className="node-chip-row" aria-label={`${layer.title} candidate nodes`}>
              {layer.nodes.map((node) => (
                <span key={node}>{node}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <article className="content-card relation-card">
        <p className="card-kicker">Relation breadcrumb</p>
        <h3>초기 그래프는 선명한 연결 문장부터</h3>
        <div className="relation-list" aria-label="Public-safe relation examples">
          {relationExamples.map((edge) => (
            <div className="relation-row" key={`${edge.from}-${edge.relation}-${edge.to}`}>
              <span>{edge.from}</span>
              <strong>{edge.relation}</strong>
              <span>{edge.to}</span>
            </div>
          ))}
        </div>
      </article>
    </div>
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

function HomeVisualHero() {
  const [leadItem, ...supportItems] = homeVisualSet.items

  return (
    <div className="home-visual-grid" aria-label="Today's Visual System">
      <article className="content-card home-visual-copy-card">
        <p className="card-kicker">Today&apos;s Visual System</p>
        <h3>Go Youn-jung의 final visual set을 홈의 첫 장면으로 연결합니다</h3>
        <p>
          최신 canonical final 세트를 public-safe card로 변환했습니다. 원본 프롬프트는 숨기고,
          이미지가 왜 필요한지와 Harness / Loop / Graph Engineering 맥락만 노출합니다.
        </p>
        <div className="status-row" aria-label="Home visual source status">
          <span className="status-chip">{homeVisualSet.status}</span>
          <span className="status-chip muted">{homeVisualSet.dateKst}</span>
          <span className="status-chip muted">{homeVisualSet.promptPolicy}</span>
        </div>
      </article>

      {leadItem ? (
        <article className="content-card visual-card visual-card-lead" key={leadItem.id}>
          <img src={`${import.meta.env.BASE_URL}${leadItem.imagePath}`} alt={`${leadItem.title} visual`} />
          <div className="visual-card-body">
            <p className="card-kicker">{leadItem.role} · {homeVisualSet.source}</p>
            <h3>{leadItem.title}</h3>
            <p>{leadItem.metaphor}</p>
            <ul>
              {leadItem.why.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <span>{leadItem.model}</span>
          </div>
        </article>
      ) : null}

      <section className="support-visual-stack" aria-label="Supporting visual cards">
        {supportItems.map((item) => (
          <article className="content-card visual-card visual-card-support" key={item.id}>
            <img src={`${import.meta.env.BASE_URL}${item.imagePath}`} alt={`${item.title} visual`} />
            <div className="visual-card-body">
              <p className="card-kicker">{item.role}</p>
              <h3>{item.title}</h3>
              <p>{item.theme}</p>
              <span>{item.model}</span>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function HomePanel() {
  return (
    <>
      <HomeVisualHero />
      <PlaceholderPanel tab={tabs[0]} />
    </>
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

  function selectTab(tab: Tab) {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab.id}`)
  }

  return (
    <main className="app-shell">
      <aside className="app-sidebar" aria-label="Dashboard navigation">
        <div className="brand-block">
          <p className="eyebrow">August Dashboard</p>
          <h1>Local admin shell</h1>
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
          <HomePanel />
        ) : activeTab.id === 'intro' ? (
          <ChrisIntroPanel />
        ) : activeTab.id === 'graph' ? (
          <GraphEngineeringPanel />
        ) : activeTab.id === 'architecture' ? (
          <DevArchitecturePanel />
        ) : (
          <PlaceholderPanel tab={activeTab} />
        )}
      </section>
    </main>
  )
}

export default App
