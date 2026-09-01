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
    title: '자료를 모읍니다',
    lens: '논문 · 비주얼 · 팀 노트',
    output: '흩어진 자료 중 지금 볼 만한 것만 골라 한곳에 모읍니다.',
    detail: '논문, 이미지, 작업 노트처럼 서로 다른 자료를 먼저 같은 책상 위에 올립니다. 이 단계의 목표는 결론을 내리는 것이 아니라, 놓치면 아까운 단서를 모으는 것입니다.',
  },
  {
    number: '02',
    title: '질문으로 바꿉니다',
    lens: '무엇을 봐야 하는지 정리',
    output: '모은 자료를 “그래서 무엇을 판단해야 하지?”라는 질문으로 바꿉니다.',
    detail: '좋아 보이는 자료를 그대로 쌓아두지 않고, Chris가 실제로 결정해야 할 질문으로 바꿉니다. 예를 들면 “이 기술이 왜 중요한가?”, “우리 화면에 어떻게 보이면 좋은가?”처럼 다시 묻습니다.',
  },
  {
    number: '03',
    title: '의미를 뽑아냅니다',
    lens: '제품 · 브랜드 · 사용자 경험',
    output: '어려운 내용을 제품, 브랜드, 사용자 경험 관점의 쉬운 의미로 풀어냅니다.',
    detail: '논문 요약이나 전문 용어에서 멈추지 않고, One UI나 AI UX에 어떤 도움이 되는지 사람이 이해할 수 있는 문장으로 바꿉니다.',
  },
  {
    number: '04',
    title: '화면으로 보여줍니다',
    lens: '카드 · 칸반 · 대시보드',
    output: '읽고 비교하기 쉬운 카드, 리스트, 대시보드 형태로 정리합니다.',
    detail: '좋은 생각도 화면에서 바로 읽히지 않으면 쓰기 어렵습니다. 그래서 핵심만 남겨 카드, 칸반, 상세 화면처럼 훑어보기 쉬운 형태로 만듭니다.',
  },
  {
    number: '05',
    title: '근거를 확인합니다',
    lens: '검증 · 공개 가능 범위 · 다음 행동',
    output: '공개해도 되는지, 근거가 충분한지, 다음에 무엇을 할지 확인합니다.',
    detail: '마지막에는 Muyeol 기준으로 민감한 정보는 빼고, 근거가 약한 내용은 표시합니다. Chris에게 돌아가는 결과는 “이제 무엇을 선택하면 되는지”가 보이는 상태여야 합니다.',
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

const teamFaceSrc = (fileName: string) => `${import.meta.env.BASE_URL}assets/team/${fileName}`

const operatingMapInfographicNodes = [
  {
    number: '01',
    label: 'Chris',
    value: 'Chris가 지금 필요한 질문, 우선순위, 최종 판단 기준을 던지면 팀의 실행 루프가 시작됩니다.',
    faces: [],
  },
  {
    number: '02',
    label: 'Karina',
    value: 'Karina가 요청을 작은 실행 단위로 나누고, 담당 에이전트와 검증 순서를 정해 루프를 설계합니다.',
    faces: [{ name: 'Karina', src: teamFaceSrc('karina_profile.jpg') }],
  },
  {
    number: '03',
    label: 'Evidence',
    value: 'Yuna와 Go Youn-jung이 리서치, 레퍼런스, 비주얼 단서를 모아 판단에 쓸 수 있는 근거로 정리합니다.',
    faces: [
      { name: 'Yuna', src: teamFaceSrc('yuna_profile.jpg') },
      { name: 'Go Youn-jung', src: teamFaceSrc('goyounjung_profile.jpg') },
    ],
  },
  {
    number: '04',
    label: 'OBD Logic',
    value: '수집된 근거는 질문·가치·화면 언어로 번역되어, 단순 자료가 아니라 다음 의사결정의 구조가 됩니다.',
    faces: [{ name: 'Karina', src: teamFaceSrc('karina_profile.jpg') }],
  },
  {
    number: '05',
    label: 'Muyeol',
    value: 'Muyeol이 공개 가능 범위, 리스크, 품질 기준을 확인해 Chris에게 전달해도 되는 결과만 남깁니다.',
    faces: [{ name: 'Muyeol', src: teamFaceSrc('muyeol_profile.jpg') }],
  },
  {
    number: '06',
    label: 'Chris',
    value: '검증된 결과는 다시 Chris의 다음 선택으로 돌아가고, 승인·수정·다음 실행 중 하나로 이어집니다.',
    faces: [],
  },
]

function SignalLoopInfographic() {
  return (
    <section className="obd-infographic signal-loop-infographic" aria-label="Signal Loop transformation infographic">
      <div className="obd-infographic-header">
        <p className="card-kicker">Signal loop · easy version</p>
        <h3>자료가 Chris의 다음 선택으로 바뀌는 5단계</h3>
        <p>Signal Loop는 어려운 분석표가 아니라, 흩어진 자료를 모아 “무엇을 결정하면 되는지”까지 정리해 돌려주는 과정입니다.</p>
      </div>

      <div className="signal-loop-diagram" aria-label="Five-step signal loop">
        {obdMilestones.map((milestone, index) => (
          <div className="obd-step-with-arrow" key={milestone.number}>
            <article className="obd-step-card signal-loop-node">
              <span>{milestone.number}</span>
              <h4>{milestone.title}</h4>
              <p>{milestone.output}</p>
            </article>
            {index < obdMilestones.length - 1 ? <span className="obd-step-arrow" aria-hidden="true">↓</span> : null}
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
              <div className="obd-step-card-head">
                {node.faces.length > 0 ? (
                  <div className="obd-agent-face-row" aria-label={`${node.label} agent faces`}>
                    {node.faces.map((face) => (
                      <img className="obd-agent-face" src={face.src} alt={face.name} key={face.name} />
                    ))}
                  </div>
                ) : null}
                <span>{node.number}</span>
              </div>
              <h4>{node.label}</h4>
              <p>{node.value}</p>
            </article>
            {index < operatingMapInfographicNodes.length - 1 ? <span className="obd-step-arrow" aria-hidden="true">↓</span> : null}
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

      <figure className="content-card operating-map-image-card">
        <img
          src={`${import.meta.env.BASE_URL}assets/obd/operating-map-concrete-frame.jpg`}
          alt="Concrete interior frame for OBD Operating Map"
          width="1280"
          height="640"
          loading="eager"
          decoding="async"
        />
      </figure>

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

      <figure className="content-card signal-loop-image-card">
        <img
          src={`${import.meta.env.BASE_URL}assets/obd/signal-loop-threshold-line.jpg`}
          alt="Small dark tree crossing a luminous signal line for OBD Signal Loop"
          width="1280"
          height="640"
          loading="eager"
          decoding="async"
        />
      </figure>

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

export function MonthlyResearchSynthesisPanel({ onSelectResearchItem }: { onSelectResearchItem?: (itemId: string) => void } = {}) {
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

      <figure className="content-card monthly-synthesis-image-card">
        <img
          src={`${import.meta.env.BASE_URL}assets/monthly/monthly-synthesis-monolith.jpg`}
          alt="White monolith landscape for monthly synthesis"
          width="1280"
          height="549"
          loading="eager"
          decoding="async"
        />
      </figure>

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
            <button
              className="shortlist-row"
              key={item.id}
              type="button"
              aria-label={`Research 탭에서 ${item.title} 상세 보기`}
              onClick={() => onSelectResearchItem?.(item.id)}
            >
              <span>{item.score.toFixed(1)}</span>
              <div>
                <strong>{item.title}</strong>
                <p>{laneLabel(item.lane)} · {item.dateKst} · {item.summary}</p>
              </div>
            </button>
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
