import { useEffect, useMemo, useState } from 'react'
import './dissertation-references.css'

type IdeaFit = 'educator' | 'learner'

type DissertationReference = {
  referenceId: string
  ideaFit: IdeaFit
  top10Rank?: number
  titleEn: string
  titleKo: string
  urlOrDoi: string
  sourceAccess?: string
  sourceAccessNote?: string
  verificationStatus: string
  evidenceBoundary?: string
  fitRationaleKo: string
}

type ReferenceManifest = {
  sectionTitleKo: string
  selectionBoundaryKo: string
  counts: { allRelevant: number; educatorAssistant: number; learnerAgent: number; top10: number }
  top10: DissertationReference[]
  allRelevantReferences: DissertationReference[]
}

const emptyManifest: ReferenceManifest = {
  sectionTitleKo: '가장 논문 아이디어와 연관된 논문 10개',
  selectionBoundaryKo: '',
  counts: { allRelevant: 0, educatorAssistant: 0, learnerAgent: 0, top10: 0 },
  top10: [],
  allRelevantReferences: [],
}

const ideaLabel = (fit: IdeaFit) => fit === 'educator' ? 'Idea 01 · 교육자 AI 조교' : 'Idea 02 · 학습자 에이전트'
const statusLabel = (status: string) => status.startsWith('GO') ? '검증 메모 있음' : status.startsWith('WATCH') ? '추가 확인 필요' : '후보 검토 중'
const primaryHref = (value: string) => value.split(/\s*(?:;|\/)\s*/).find((part) => /^https?:\/\//.test(part)) ?? ''

function ReferenceTitle({ item }: { item: DissertationReference }) {
  return <><span className="research-title-en">{item.titleEn}</span><span className="research-title-ko">{item.titleKo}</span></>
}

export function DissertationReferencesPanel() {
  const [manifest, setManifest] = useState<ReferenceManifest>(emptyManifest)
  const [selectedId, setSelectedId] = useState('')
  const [filter, setFilter] = useState<'all' | IdeaFit>('all')

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/dissertation-references.json`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('reference manifest unavailable')))
      .then((data: ReferenceManifest) => {
        setManifest(data)
        setSelectedId(data.top10[0]?.referenceId ?? '')
      })
      .catch(() => setManifest(emptyManifest))
  }, [])

  const visibleReferences = useMemo(() => manifest.allRelevantReferences.filter((item) => filter === 'all' || item.ideaFit === filter), [manifest, filter])
  const selected = manifest.allRelevantReferences.find((item) => item.referenceId === selectedId) ?? manifest.top10[0]

  return (
    <div className="research-board-grid dissertation-references-panel" aria-label="Dissertation references">
      <article className="content-card research-board-brief">
        <p className="card-kicker">Dissertation evidence map</p>
        <h3>논문 아이디어 레퍼런스</h3>
        <p>교육자용 AI 조교와 학습자 개인화 에이전트의 설계 질문에 맞춰, 기존 AI·UX·디자인교육 리서치 풀에서 관련 논문만 다시 엮었습니다.</p>
        <div className="status-row">
          <span className="status-chip">references {manifest.counts.allRelevant}</span>
          <span className="status-chip muted">Idea 01 {manifest.counts.educatorAssistant}</span>
          <span className="status-chip muted">Idea 02 {manifest.counts.learnerAgent}</span>
        </div>
      </article>

      <section className="content-card validated-paper-stack-card dissertation-top10-card" aria-label="Top 10 dissertation references">
        <div className="validated-paper-stack-header">
          <div>
            <p className="card-kicker">Dissertation relevance · Top {manifest.counts.top10}</p>
            <h3>{manifest.sectionTitleKo}</h3>
            <p>기존 후보의 제목·초록·메타데이터와 검증 메모에서 확인되는 설계 연관성으로 우선순위를 정했습니다. 이 순위는 연구 효과의 강도나 검증 완료 여부를 뜻하지 않습니다.</p>
          </div>
        </div>
        <div className="dissertation-top10-grid">
          {manifest.top10.map((item) => (
            <button key={item.referenceId} type="button" className="validated-paper-card" onClick={() => setSelectedId(item.referenceId)} aria-pressed={selectedId === item.referenceId}>
              <span className="validated-paper-rank">{String(item.top10Rank).padStart(2, '0')}</span>
              <span className="validated-paper-copy"><strong><ReferenceTitle item={item} /></strong><small>{ideaLabel(item.ideaFit)}</small><span>{item.fitRationaleKo}</span></span>
              <span className="validated-paper-badge">Top 10</span>
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <article className="content-card research-detail-card dissertation-reference-detail" aria-label="Selected dissertation reference detail">
          <div className="research-detail-header"><div><p className="card-kicker">{ideaLabel(selected.ideaFit)}</p><h3><ReferenceTitle item={selected} /></h3></div><span className="status-chip">{statusLabel(selected.verificationStatus)}</span></div>
          <div className="research-detail-copy">
            <p><strong>논문 아이디어와의 연결</strong>{selected.fitRationaleKo}</p>
            {selected.evidenceBoundary ? <p><strong>근거 범위</strong>{selected.evidenceBoundary}</p> : null}
            <div className="metadata-grid"><span>검토 상태: {selected.verificationStatus}</span><span>접근 범위: {selected.sourceAccess ?? selected.sourceAccessNote ?? '원천 미기록'}</span></div>
            <div className="research-source-row"><p><strong>Source / DOI</strong>{selected.urlOrDoi}</p>{primaryHref(selected.urlOrDoi) ? <a className="research-source-link" href={primaryHref(selected.urlOrDoi)} target="_blank" rel="noreferrer">공개 소스 열기</a> : null}</div>
          </div>
        </article>
      ) : null}

      <section className="content-card dissertation-reference-list-card" aria-label="All dissertation references">
        <div className="validated-paper-stack-header"><div><p className="card-kicker">All related references</p><h3>논문 아이디어 관련 논문 전체 {manifest.counts.allRelevant}개</h3><p>{manifest.selectionBoundaryKo}</p></div></div>
        <div className="research-filter-chips" aria-label="Reference idea filter">
          {([['all', '전체'], ['educator', 'Idea 01 · 교육자'], ['learner', 'Idea 02 · 학습자']] as const).map(([id, label]) => <button key={id} type="button" className={filter === id ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter(id)}>{label}</button>)}
        </div>
        <ol className="dissertation-reference-list">
          {visibleReferences.map((item) => <li key={item.referenceId}><button type="button" onClick={() => setSelectedId(item.referenceId)} aria-pressed={selectedId === item.referenceId}><span>{ideaLabel(item.ideaFit)}</span><strong><ReferenceTitle item={item} /></strong><small>{item.fitRationaleKo}</small></button></li>)}
        </ol>
      </section>
    </div>
  )
}
