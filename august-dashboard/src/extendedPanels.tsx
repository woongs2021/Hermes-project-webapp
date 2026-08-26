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
    title: 'Catch the signal',
    lens: 'papers · visuals · team notes',
    output: '판단 가능한 신호만 public-safe 카드로 정리',
    detail: '리서치, 홈 비주얼, 팀 작업 노트를 같은 작업대 위에 올려 Chris가 바로 훑을 수 있게 만듭니다.',
  },
  {
    number: '02',
    title: 'Frame the question',
    lens: 'ontology framing',
    output: '반복 신호를 OBD 질문으로 재명명',
    detail: 'AI agency, trust, accessibility, brand value 같은 키워드를 단순 태그가 아니라 다음 판단을 여는 질문으로 바꿉니다.',
  },
  {
    number: '03',
    title: 'Translate the value',
    lens: 'business design',
    output: '제품·조직·브랜드 판단 언어로 변환',
    detail: '논문 요약에서 멈추지 않고 One UI, AI UX, 디자인 리더십에 적용 가능한 결정 문장으로 압축합니다.',
  },
  {
    number: '04',
    title: 'Shape the surface',
    lens: 'warm AI UX',
    output: '읽히는 화면과 카드 구조로 구체화',
    detail: '카드, 칸반, 상세뷰, 홈 비주얼처럼 사람이 훑고 비교하고 기억할 수 있는 형태로 옮깁니다.',
  },
  {
    number: '05',
    title: 'Return with proof',
    lens: 'Muyeol validation',
    output: '공개 범위·근거 강도·다음 행동 확정',
    detail: '민감 정보는 분리하고, Chris에게 돌아갈 수 있는 검증된 근거와 다음 실행 단위를 남깁니다.',
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
      value: 'direction and final judgment',
      description: '질문을 열고, 어떤 신호를 OBD 성장과 제품 판단으로 연결할지 최종 결정합니다.',
      cluster: 'input',
    },
    {
      id: 'karina',
      label: 'Karina',
      value: 'coordination lead',
      description: 'Chris의 방향을 실행 가능한 루프로 쪼개고, 각 에이전트의 결과를 하나의 판단 흐름으로 묶습니다.',
      cluster: 'orchestration',
    },
    {
      id: 'home',
      label: 'Home visuals',
      value: `${visualSet.items.length} stills`,
      description: '시각 은유와 톤을 제공해 OBD 질문이 화면 언어로 바뀌는 출발점을 만듭니다.',
      cluster: 'artifact',
    },
    {
      id: 'research-yuna',
      label: 'Yuna research',
      value: `${yunaCount} papers`,
      description: 'AI, agent UX, future interface 논문에서 Chris가 써먹을 수 있는 근거 신호를 뽑습니다.',
      cluster: 'artifact',
    },
    {
      id: 'research-go',
      label: 'Go Youn-jung research',
      value: `${goCount} papers`,
      description: 'UX, brand, design management 연구를 비즈니스와 디자인 리더십 언어로 연결합니다.',
      cluster: 'artifact',
    },
    {
      id: 'obd',
      label: 'OBD operating logic',
      value: 'signal → judgment loop',
      description: '수집한 자료를 질문, 가치, 화면, 검증으로 통과시켜 Chris의 다음 선택으로 되돌립니다.',
      cluster: 'synthesis',
    },
    {
      id: 'muyeol',
      label: 'Muyeol validation',
      value: `${koreanCount} Korean signals`,
      description: '근거 강도, 공개 가능성, 민감 리스크를 확인해 판단 루프가 안전하게 닫히도록 합니다.',
      cluster: 'validation',
    },
  ]
}

const graphEdges: GraphEdge[] = [
  { from: 'Chris', to: 'Karina', label: 'sets direction' },
  { from: 'Karina', to: 'Research lanes', label: 'routes evidence search' },
  { from: 'Karina', to: 'Home visuals', label: 'routes visual language' },
  { from: 'Research lanes', to: 'OBD logic', label: 'turns evidence into questions' },
  { from: 'Home visuals', to: 'OBD logic', label: 'turns imagery into metaphors' },
  { from: 'OBD logic', to: 'Muyeol', label: 'asks for risk check' },
  { from: 'Muyeol', to: 'Chris', label: 'returns usable judgment' },
]

const graphMvpContracts = [
  {
    label: 'nodes.jsonl',
    value: 'Signal · Question · Evidence · Artifact · Decision',
    detail: '대시보드의 모든 조각을 “무엇을 판단하게 해주는가” 기준으로만 노드화합니다.',
  },
  {
    label: 'edges.jsonl',
    value: 'FRAMES · SUPPORTS · TRANSLATES_TO · VALIDATED_BY',
    detail: '근거가 어떤 질문을 만들고 어떤 판단으로 이어졌는지 연결의 이유를 남깁니다.',
  },
  {
    label: 'boundary.md',
    value: 'public-safe source · confidence · next action',
    detail: 'private 원문이 아니라 공개 가능한 근거 수준과 다음 행동만 화면 계약에 올립니다.',
  },
]

const operatingMapInfographicNodes = [
  { number: '01', label: 'Chris', value: '질문과 우선순위' },
  { number: '02', label: 'Karina', value: '실행 루프 설계' },
  { number: '03', label: 'Evidence', value: '리서치와 비주얼 근거' },
  { number: '04', label: 'OBD Logic', value: '질문·가치·화면 언어' },
  { number: '05', label: 'Muyeol', value: '리스크와 공개 범위 검증' },
  { number: '06', label: 'Chris', value: '다음 판단과 실행' },
]

function SignalLoopInfographic() {
  return (
    <section className="obd-infographic signal-loop-infographic" aria-label="Signal Loop transformation infographic">
      <div className="obd-infographic-header">
        <p className="card-kicker">Signal transformation engine</p>
        <h3>자료가 판단 언어로 바뀌는 순간을 한눈에 보기</h3>
        <p>각 신호는 바로 결론이 되지 않고, 질문·가치·화면·검증을 통과한 뒤 Chris가 쓸 수 있는 판단 단위가 됩니다.</p>
      </div>

      <div className="signal-loop-diagram" aria-label="Five-step signal loop">
        {obdMilestones.map((milestone, index) => (
          <div className="obd-step-with-arrow" key={milestone.number}>
            <article className="obd-step-card signal-loop-node">
              <span>{milestone.number}</span>
              <h4>{milestone.title}</h4>
              <p>{milestone.output}</p>
            </article>
            {index < obdMilestones.length - 1 ? <span className="obd-step-arrow" aria-hidden="true">→</span> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

function OperatingMapInfographic() {
  return (
    <section className="obd-infographic operating-map-infographic" aria-label="Operating Map loop infographic">
      <div className="obd-infographic-header">
        <p className="card-kicker">Operating loop · who moves what</p>
        <h3>팀의 실행이 Chris의 다음 판단으로 돌아오는 지도</h3>
        <p>운영 지도는 조직도나 기술 그래프가 아니라, 누가 어떤 근거를 움직여 어떤 판단으로 되돌리는지 보여주는 작업 루프입니다.</p>
      </div>

      <div className="operating-loop-diagram" aria-label="Chris Karina evidence OBD Muyeol operating loop">
        {operatingMapInfographicNodes.map((node, index) => (
          <div className="obd-step-with-arrow" key={`${node.number}-${node.label}`}>
            <article className="obd-step-card operating-loop-node">
              <span>{node.number}</span>
              <h4>{node.label}</h4>
              <p>{node.value}</p>
            </article>
            {index < operatingMapInfographicNodes.length - 1 ? <span className="obd-step-arrow" aria-hidden="true">→</span> : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export function GraphRelationshipPanel() {
  const { visualSet, researchBoard } = useDashboardSources()
  const nodes = useMemo(() => buildGraphNodes(visualSet, researchBoard), [visualSet, researchBoard])

  return (
    <div className="graph-panel-grid" aria-label="OBD operating relationship map">
      <article className="content-card graph-hero-card">
        <p className="card-kicker">Operating map · evidence flow</p>
        <h3>자료가 판단이 되어 Chris에게 돌아오는 운영 지도</h3>
        <p>
          이 화면은 “그래프 탭”이 아니라 Karina가 조율한 실행, 리서치와 비주얼 근거, OBD 해석, Muyeol 검증이
          어떤 순서로 Chris의 다음 선택을 만드는지 읽게 해주는 관계 지도입니다.
        </p>
        <div className="status-row">
          <span className="status-chip">home {visualSet.items.length}</span>
          <span className="status-chip muted">research {researchBoard.items.length}</span>
          <span className="status-chip muted">oldest-first public manifests</span>
        </div>
      </article>

      <OperatingMapInfographic />

      <section className="graph-node-board" aria-label="OBD operating map nodes">
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
        <p className="card-kicker">Judgment loop</p>
        <h3>Chris의 질문이 검증된 다음 행동으로 돌아오는 순서</h3>
        <div className="edge-list" aria-label="Operating map edges">
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
        <p className="card-kicker">Public-safe map contract</p>
        <h3>관계도는 예쁜 선이 아니라, 판단 근거를 잃지 않기 위한 계약입니다</h3>
        <div className="graph-contract-grid" aria-label="OBD operating map file contract">
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
    <div className="obd-timeline-grid" aria-label="OBD signal loop timeline">
      <article className="content-card obd-hero-card">
        <p className="card-kicker">Signal loop · source to judgment</p>
        <h3>흩어진 자료를 OBD 판단 언어로 바꾸는 5단계</h3>
        <p>
          여기서는 “성장 기록”을 나열하지 않습니다. Chris가 모은 자료가 어떤 과정을 거쳐 질문, 가치, 화면 언어,
          검증 가능한 다음 행동으로 바뀌는지 보여주는 변환 루프입니다.
        </p>
        <div className="status-row">
          <span className="status-chip">signal → question</span>
          <span className="status-chip muted">value translation</span>
          <span className="status-chip muted">validated action</span>
        </div>
      </article>

      <SignalLoopInfographic />

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
    ['Next QA focus', 'OBD Operating Map은 현재 화면에서 읽히는 public-safe 운영 지도이므로, 실제 nodes/edges DB로 승격하기 전 판단 근거 schema가 필요합니다.'],
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
