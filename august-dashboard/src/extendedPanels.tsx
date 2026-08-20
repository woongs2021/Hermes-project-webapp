import { useEffect, useMemo, useState } from 'react'
import { fallbackHomeVisualSet, loadHomeVisualSet, type HomeVisualSet } from './homeVisualSet'
import { fallbackResearchBoard, loadResearchBoard, type ResearchBoard, type ResearchBoardItem } from './researchBoard'

type GraphNode = {
  id: string
  label: string
  value: string
  description: string
  cluster: 'input' | 'orchestration' | 'artifact' | 'validation' | 'synthesis'
}

type GraphEdge = {
  from: string
  to: string
  label: string
}

type ObdMilestone = {
  number: string
  title: string
  lens: string
  output: string
  detail: string
}

const obdMilestones: ObdMilestone[] = [
  {
    number: '01',
    title: 'Collect signals',
    lens: '논문 · 시각자료 · 작업 로그',
    output: '흩어진 자료를 public-safe 카드로 변환',
    detail: 'Yuna/Go Youn-jung research, HomeVisualHero, 팀 작업 로그를 같은 시간축에 올립니다.',
  },
  {
    number: '02',
    title: 'Name the pattern',
    lens: 'Ontology design',
    output: '반복되는 개념을 노드와 관계로 명명',
    detail: 'AI agency, trust, accessibility, brand value, design education 같은 반복 주제를 Chris의 성장 언어로 묶습니다.',
  },
  {
    number: '03',
    title: 'Translate to business',
    lens: 'Business design',
    output: '제품/조직 판단 기준으로 번역',
    detail: '논문 요약에서 끝내지 않고 One UI, AI UX, 디자인 리더십의 의사결정 문장으로 바꿉니다.',
  },
  {
    number: '04',
    title: 'Prototype the surface',
    lens: 'Warm AI dashboard',
    output: '대시보드·칸반·상세뷰로 시각화',
    detail: '사용자가 바로 훑고, 클릭하고, 근거를 확인할 수 있는 조용한 작업실 UI를 만듭니다.',
  },
  {
    number: '05',
    title: 'Validate the loop',
    lens: 'Muyeol QA',
    output: '리스크·공개범위·다음 행동 확인',
    detail: '비밀값과 private source를 분리하고, 공개 가능한 근거와 다음 구현 단위를 남깁니다.',
  },
]

function laneLabel(lane: ResearchBoardItem['lane']) {
  return lane === 'yuna' ? 'Yuna · AI / agent UX' : 'Go Youn-jung · UX / brand / design'
}

function shortMonth(dateKst: string) {
  return dateKst.slice(0, 7)
}

function compactRatio(value: number, total: number) {
  if (total === 0) return '0%'
  return `${Math.round((value / total) * 100)}%`
}

function useDashboardSources() {
  const [visualSet, setVisualSet] = useState<HomeVisualSet>(fallbackHomeVisualSet)
  const [researchBoard, setResearchBoard] = useState<ResearchBoard>(fallbackResearchBoard)

  useEffect(() => {
    let isMounted = true

    Promise.all([loadHomeVisualSet(), loadResearchBoard()]).then(([loadedVisualSet, loadedResearchBoard]) => {
      if (!isMounted) return
      setVisualSet(loadedVisualSet)
      setResearchBoard(loadedResearchBoard)
    })

    return () => {
      isMounted = false
    }
  }, [])

  return { visualSet, researchBoard }
}

function buildGraphNodes(visualSet: HomeVisualSet, researchBoard: ResearchBoard): GraphNode[] {
  const yunaCount = researchBoard.items.filter((item) => item.lane === 'yuna').length
  const goCount = researchBoard.items.filter((item) => item.lane === 'goyounjung').length
  const koreanCount = researchBoard.items.filter((item) => /yes|korean|한국|KCI|Korea/i.test(item.koreanSourceStatus)).length

  return [
    {
      id: 'chris',
      label: 'Chris',
      value: 'OBD command',
      description: '방향을 주고, 어떤 자료가 성장과 제품 판단으로 이어질지 결정합니다.',
      cluster: 'input',
    },
    {
      id: 'karina',
      label: 'Karina',
      value: 'coordination lead',
      description: '팀 실행을 조율하고 결과를 하나의 읽기 쉬운 루프로 종합합니다.',
      cluster: 'orchestration',
    },
    {
      id: 'home',
      label: 'Home visuals',
      value: `${visualSet.items.length} stills`,
      description: '시간순 still 카드와 클릭 turntable detail로 AI visual 자료를 안전하게 보여줍니다.',
      cluster: 'artifact',
    },
    {
      id: 'research-yuna',
      label: 'Yuna research',
      value: `${yunaCount} papers`,
      description: 'AI / agent UX / future interface 논문을 시간순 칸반으로 정리합니다.',
      cluster: 'artifact',
    },
    {
      id: 'research-go',
      label: 'Go Youn-jung research',
      value: `${goCount} papers`,
      description: 'UX, brand, design management 논문과 사례를 성장 렌즈로 정리합니다.',
      cluster: 'artifact',
    },
    {
      id: 'obd',
      label: 'OBD growth loop',
      value: '5-step timeline',
      description: '수집 → 패턴 명명 → 비즈니스 번역 → 시각화 → 검증의 반복 구조입니다.',
      cluster: 'synthesis',
    },
    {
      id: 'muyeol',
      label: 'Muyeol validation',
      value: `${koreanCount} Korean signals`,
      description: '공개 범위, 근거 강도, 민감 리스크, 전이 가능성을 최종 확인하는 검증 관문입니다.',
      cluster: 'validation',
    },
  ]
}

const graphEdges: GraphEdge[] = [
  { from: 'Chris', to: 'Karina', label: 'asks / sets priority' },
  { from: 'Karina', to: 'Research lanes', label: 'routes papers' },
  { from: 'Karina', to: 'Home visuals', label: 'routes visual material' },
  { from: 'Research lanes', to: 'OBD loop', label: 'feeds concepts' },
  { from: 'Home visuals', to: 'OBD loop', label: 'feeds metaphors' },
  { from: 'OBD loop', to: 'Muyeol', label: 'requests validation' },
  { from: 'Muyeol', to: 'Chris', label: 'returns safe synthesis' },
]

const graphMvpContracts = [
  {
    label: 'nodes.jsonl',
    value: 'Agent · ResearchItem · Insight · Artifact · Decision',
    detail: '루프 산출물을 공개 가능한 노드 단위로만 승격합니다.',
  },
  {
    label: 'edges.jsonl',
    value: 'SUPPORTS · FEEDS · VALIDATED_BY · BELONGS_TO_THEME',
    detail: '근거가 어떤 화면과 판단으로 이어지는지 relation breadcrumb를 남깁니다.',
  },
  {
    label: 'schema.md',
    value: 'public-safe boundary · validation_status · source confidence',
    detail: 'raw log, prompt, credential, private path는 기본 UI 계약 밖에 둡니다.',
  },
]

export function GraphRelationshipPanel() {
  const { visualSet, researchBoard } = useDashboardSources()
  const nodes = useMemo(() => buildGraphNodes(visualSet, researchBoard), [visualSet, researchBoard])

  return (
    <div className="graph-panel-grid" aria-label="OBD dashboard relationship graph">
      <article className="content-card graph-hero-card">
        <p className="card-kicker">Graph tab · living map</p>
        <h3>자료가 Chris의 OBD 판단으로 돌아오는 관계 지도</h3>
        <p>
          Home visual, Yuna research, Go Youn-jung research, OBD growth loop, Muyeol validation을 하나의 작업 완료 루프로 연결했습니다.
          아직 DB graph가 아니라 화면에서 바로 읽히는 IA-style relation graph입니다.
        </p>
        <div className="status-row">
          <span className="status-chip">home {visualSet.items.length}</span>
          <span className="status-chip muted">research {researchBoard.items.length}</span>
          <span className="status-chip muted">oldest-first public manifests</span>
        </div>
      </article>

      <section className="graph-node-board" aria-label="Dashboard relation nodes">
        {nodes.map((node) => (
          <article className={`graph-node ${node.cluster}`} key={node.id}>
            <p className="card-kicker">{node.cluster}</p>
            <h3>{node.label}</h3>
            <strong>{node.value}</strong>
            <p>{node.description}</p>
          </article>
        ))}
      </section>

      <article className="content-card graph-edge-card">
        <p className="card-kicker">Completion loop</p>
        <h3>Chris → Karina → Agent Team → Muyeol → Chris</h3>
        <div className="edge-list" aria-label="Graph edges">
          {graphEdges.map((edge, index) => (
            <div className="edge-row" key={`${edge.from}-${edge.to}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{edge.from}</strong>
              <small>{edge.label}</small>
              <strong>{edge.to}</strong>
            </div>
          ))}
        </div>
      </article>

      <article className="content-card graph-contract-card">
        <p className="card-kicker">File-based MVP contract</p>
        <h3>무거운 DB 전에, 안전한 파일 그래프 계약부터 고정합니다</h3>
        <div className="graph-contract-grid" aria-label="Graph MVP file contract">
          {graphMvpContracts.map((contract) => (
            <section className="graph-contract-item" key={contract.label}>
              <span>{contract.label}</span>
              <strong>{contract.value}</strong>
              <p>{contract.detail}</p>
            </section>
          ))}
        </div>
      </article>
    </div>
  )
}

export function ObdGrowthTimelinePanel() {
  return (
    <div className="obd-timeline-grid" aria-label="OBD growth loop timeline">
      <article className="content-card obd-hero-card">
        <p className="card-kicker">OBD growth loop</p>
        <h3>Ontology Business Designer로 성장하는 5단계 루프</h3>
        <p>
          이 탭은 일간 기록장이 아니라 Chris의 자료가 어떤 순서로 의미 체계, 비즈니스 판단, 제품/브랜드 언어로 바뀌는지 보여주는 카드형 타임라인입니다.
        </p>
        <div className="status-row">
          <span className="status-chip">signal → ontology</span>
          <span className="status-chip muted">business translation</span>
          <span className="status-chip muted">validation loop</span>
        </div>
      </article>

      <section className="timeline-rail" aria-label="OBD timeline cards">
        {obdMilestones.map((milestone) => (
          <article className="timeline-card" key={milestone.number}>
            <span className="timeline-number">{milestone.number}</span>
            <div>
              <p className="card-kicker">{milestone.lens}</p>
              <h3>{milestone.title}</h3>
              <strong>{milestone.output}</strong>
              <p>{milestone.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export function MonthlyResearchSynthesisPanel() {
  const { researchBoard } = useDashboardSources()

  const monthly = useMemo(() => {
    const items = researchBoard.items
    const months = new Map<string, ResearchBoardItem[]>()
    for (const item of items) {
      const month = shortMonth(item.dateKst)
      months.set(month, [...(months.get(month) ?? []), item])
    }

    const selectedMonth = [...months.keys()].sort()[0] ?? 'pending'
    const monthItems = months.get(selectedMonth) ?? []
    const yuna = monthItems.filter((item) => item.lane === 'yuna')
    const go = monthItems.filter((item) => item.lane === 'goyounjung')
    const korean = monthItems.filter((item) => /yes|korean|한국|KCI|Korea/i.test(item.koreanSourceStatus))
    const avgScore = monthItems.length === 0 ? 0 : monthItems.reduce((sum, item) => sum + item.score, 0) / monthItems.length
    const weeks = [...new Set(monthItems.map((item) => item.isoWeek))].sort()
    const topItems = [...monthItems].sort((left, right) => right.score - left.score).slice(0, 6)

    return { selectedMonth, monthItems, yuna, go, korean, avgScore, weeks, topItems }
  }, [researchBoard])

  const themes = [
    {
      title: 'Agent UX는 자동화보다 조율권',
      body: 'permission, plan visibility, uncertainty, memory control 같은 논문이 반복 출현해 “사람이 언제 개입할 수 있는가”가 핵심 축으로 보입니다.',
    },
    {
      title: '디자인 리더십은 조직 언어',
      body: 'strategic design, design management, partnership, governance 연구가 UX/BX를 경영 의사결정 언어로 번역하게 만듭니다.',
    },
    {
      title: 'AI 교육은 툴 숙련보다 판단 구조',
      body: '주니어 교육, 프롬프트, 노코드, 리서치 분석 논문이 산출물 제작보다 문제정의·검증·협업 능력을 강조합니다.',
    },
  ]

  return (
    <div className="monthly-panel-grid" aria-label="Monthly research synthesis">
      <article className="content-card monthly-hero-card">
        <p className="card-kicker">Monthly synthesis · {monthly.selectedMonth}</p>
        <h3>144개 리서치 후보를 Chris 성장 언어로 압축하는 결산 화면</h3>
        <p>
          매일 쌓인 논문 카드를 월간 단위로 다시 읽어, Yuna의 AI UX 축과 Go Youn-jung의 UX/BX/design management 축이 어디에서 만나는지 보여줍니다.
        </p>
      </article>

      <section className="monthly-metric-grid" aria-label="Monthly research metrics">
        <article className="metric-card monthly-metric">
          <p className="card-kicker">Total papers</p>
          <h3>{monthly.monthItems.length}</h3>
          <p>{monthly.weeks.join(' · ')}</p>
        </article>
        <article className="metric-card monthly-metric">
          <p className="card-kicker">Lane balance</p>
          <h3>{monthly.yuna.length} / {monthly.go.length}</h3>
          <p>Yuna / Go Youn-jung</p>
        </article>
        <article className="metric-card monthly-metric">
          <p className="card-kicker">Korean signal</p>
          <h3>{monthly.korean.length}</h3>
          <p>{compactRatio(monthly.korean.length, monthly.monthItems.length)} of monthly items</p>
        </article>
        <article className="metric-card monthly-metric">
          <p className="card-kicker">Avg relevance</p>
          <h3>{monthly.avgScore.toFixed(1)}</h3>
          <p>initial_score_5 aggregate</p>
        </article>
      </section>

      <section className="monthly-theme-grid" aria-label="Monthly synthesis themes">
        {themes.map((theme) => (
          <article className="content-card theme-card" key={theme.title}>
            <p className="card-kicker">Synthesis hook</p>
            <h3>{theme.title}</h3>
            <p>{theme.body}</p>
          </article>
        ))}
      </section>

      <article className="content-card monthly-shortlist-card">
        <p className="card-kicker">High-signal shortlist</p>
        <h3>점수 기준 상위 후보</h3>
        <div className="shortlist-stack" aria-label="Monthly shortlist papers">
          {monthly.topItems.map((item) => (
            <div className="shortlist-row" key={item.id}>
              <span>{item.score.toFixed(1)}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{laneLabel(item.lane)} · {item.dateKst} · {item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

export function MuyeolValidationPanel() {
  const checks = [
    ['Public-safe manifests', 'home-visual-set과 research-board 모두 generator/validator를 통해 public/data로만 노출합니다.'],
    ['Source separation', 'raw logs, private paths, model/job IDs, credentials-like strings는 UI 계약 밖에 둡니다.'],
    ['Evidence quality', '논문 상세뷰에는 source access, Korean source status, duplicate signal을 함께 보여 과잉 일반화를 줄입니다.'],
    ['Next QA focus', 'Graph tab은 현재 IA-style relation graph이므로 실제 nodes/edges DB로 승격하기 전 schema가 필요합니다.'],
  ]

  return (
    <div className="validation-panel-grid" aria-label="Muyeol validation report">
      <article className="content-card validation-hero-card">
        <p className="card-kicker">Muyeol report · current dashboard QA</p>
        <h3>공개 가능한 근거와 아직 private로 남겨야 할 원천을 분리</h3>
        <p>
          이번 화면은 최종 제품 판단 전 단계의 QA 요약입니다. 작동하는 화면은 만들되, 원본 작업 로그와 민감 경로는 public-safe manifest 뒤에 숨기는 원칙을 유지합니다.
        </p>
      </article>
      <section className="validation-check-grid">
        {checks.map(([title, body]) => (
          <article className="content-card validation-check-card" key={title}>
            <p className="card-kicker">QA check</p>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </section>
    </div>
  )
}
