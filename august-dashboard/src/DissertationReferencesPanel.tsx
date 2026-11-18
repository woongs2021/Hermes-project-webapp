import { useEffect, useMemo, useState } from 'react'
import './dissertation-references.css'

type IdeaFit = 'educator' | 'learner' | 'portfolio'
type ReferenceFilter = 'all' | IdeaFit
type ReferenceSort = 'relevance' | 'source'

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
  counts: { allRelevant: number; educatorAssistant: number; learnerAgent: number; aiPortfolio: number; top10: number }
  top10: DissertationReference[]
  allRelevantReferences: DissertationReference[]
}

const emptyManifest: ReferenceManifest = {
  sectionTitleKo: '가장 논문 아이디어와 연관된 논문 10개',
  selectionBoundaryKo: '',
  counts: { allRelevant: 0, educatorAssistant: 0, learnerAgent: 0, aiPortfolio: 0, top10: 0 },
  top10: [],
  allRelevantReferences: [],
}

const ideaLabel = (fit: IdeaFit) => fit === 'educator' ? 'Idea 01 · 교육자 AI 조교' : fit === 'learner' ? 'Idea 02 · 학습자 에이전트' : 'Idea 03 · AI 포트폴리오'
const statusLabel = (status: string) => status.startsWith('GO') ? '검증 메모 있음' : status.startsWith('WATCH') ? '추가 확인 필요' : '후보 검토 중'
const sourceHrefs = (value: string) => [...new Set(value.match(/https?:\/\/[^\s;]+/g) ?? [])]
const filteredAndSorted = (references: DissertationReference[], filter: ReferenceFilter, sort: ReferenceSort) => {
  const filtered = references.filter((item) => filter === 'all' || item.ideaFit === filter)
  if (sort === 'source') return filtered
  return filtered
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort((a, b) => (a.item.top10Rank ?? Number.MAX_SAFE_INTEGER) - (b.item.top10Rank ?? Number.MAX_SAFE_INTEGER) || a.sourceIndex - b.sourceIndex)
    .map(({ item }) => item)
}

function ReferenceTitle({ item }: { item: DissertationReference }) {
  return <><span className="research-title-en">{item.titleEn}</span><span className="research-title-ko">{item.titleKo}</span></>
}

export function DissertationReferencesPanel() {
  const [manifest, setManifest] = useState<ReferenceManifest>(emptyManifest)
  const [selectedId, setSelectedId] = useState('')
  const [topFilter, setTopFilter] = useState<ReferenceFilter>('all')
  const [filter, setFilter] = useState<ReferenceFilter>('all')
  const [sort, setSort] = useState<ReferenceSort>('relevance')

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/dissertation-references.json`, { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('reference manifest unavailable')))
      .then((data: ReferenceManifest) => {
        setManifest(data)
        setSelectedId(data.top10[0]?.referenceId ?? '')
      })
      .catch(() => setManifest(emptyManifest))
  }, [])

  const visibleReferences = useMemo(() => filteredAndSorted(manifest.allRelevantReferences, filter, sort), [manifest, filter, sort])
  const topReferences = useMemo(() => filteredAndSorted(manifest.top10, topFilter, 'relevance'), [manifest, topFilter])
  const topCount = (fit: IdeaFit) => manifest.top10.filter((item) => item.ideaFit === fit).length
  const selected = manifest.allRelevantReferences.find((item) => item.referenceId === selectedId) ?? manifest.top10[0]
  const selectedSourceHrefs = selected ? sourceHrefs(selected.urlOrDoi) : []
  const selectFilter = (nextFilter: ReferenceFilter) => {
    const nextVisible = filteredAndSorted(manifest.allRelevantReferences, nextFilter, sort)
    setFilter(nextFilter)
    setSelectedId(nextVisible[0]?.referenceId ?? '')
  }
  const selectSort = (nextSort: ReferenceSort) => {
    const nextVisible = filteredAndSorted(manifest.allRelevantReferences, filter, nextSort)
    setSort(nextSort)
    setSelectedId(nextVisible[0]?.referenceId ?? '')
  }
  const selectTopFilter = (nextFilter: ReferenceFilter) => {
    const nextTop = filteredAndSorted(manifest.top10, nextFilter, 'relevance')
    setTopFilter(nextFilter)
    setSelectedId(nextTop[0]?.referenceId ?? '')
  }

  return (
    <div className="research-board-grid dissertation-references-panel" aria-label="Dissertation references">
      <article className="content-card research-board-brief">
        <p className="card-kicker">Dissertation evidence map</p>
        <h3>논문 아이디어 레퍼런스</h3>
        <p>위에서는 아이디어에 직접 연결된 핵심 논문만 살피고, 아래에서는 전체 관련 논문을 아이디어별로 탐색할 수 있습니다.</p>
        <div className="status-row dissertation-idea-shortcuts" aria-label="직접 연관 핵심 논문 아이디어 선택">
          <button type="button" className={topFilter === 'all' ? 'status-chip active' : 'status-chip'} aria-pressed={topFilter === 'all'} onClick={() => selectTopFilter('all')}>직접 연관 {manifest.counts.top10}</button>
          <button type="button" className={topFilter === 'educator' ? 'status-chip muted active' : 'status-chip muted'} aria-pressed={topFilter === 'educator'} onClick={() => selectTopFilter('educator')}>Idea 01 {topCount('educator')}</button>
          <button type="button" className={topFilter === 'learner' ? 'status-chip muted active' : 'status-chip muted'} aria-pressed={topFilter === 'learner'} onClick={() => selectTopFilter('learner')}>Idea 02 {topCount('learner')}</button>
          <button type="button" className={topFilter === 'portfolio' ? 'status-chip muted active' : 'status-chip muted'} aria-pressed={topFilter === 'portfolio'} onClick={() => selectTopFilter('portfolio')}>Idea 03 {topCount('portfolio')}</button>
        </div>
      </article>

      <section className="content-card validated-paper-stack-card dissertation-top10-card" aria-label="Top 10 dissertation references">
        <div className="validated-paper-stack-header">
          <div>
            <p className="card-kicker">Direct dissertation relevance · {topReferences.length}</p>
            <h3>{topFilter === 'all' ? manifest.sectionTitleKo : `${ideaLabel(topFilter)}에 직접 연관된 핵심 논문 ${topReferences.length}개`}</h3>
            <p>아이디어 탭마다 직접 연관된 Top 논문만 보여줍니다. 이 순위는 연구 효과의 강도나 검증 완료 여부를 뜻하지 않습니다.</p>
          </div>
        </div>
        <div className="dissertation-top10-grid">
          {topReferences.map((item) => (
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
            <div className="research-source-row"><p><strong>Source / DOI</strong>{selected.urlOrDoi}</p><div className="dissertation-source-actions">{selectedSourceHrefs.map((href, index) => <a className="dissertation-source-button" key={href} href={href} target="_blank" rel="noreferrer">{selectedSourceHrefs.length === 1 ? '논문 원문 바로가기' : `논문 원문 ${index + 1} 바로가기`} <span aria-hidden="true">↗</span></a>)}</div></div>
          </div>
        </article>
      ) : null}

      <section className="content-card dissertation-reference-list-card" aria-label="All dissertation references">
        <div className="validated-paper-stack-header"><div><p className="card-kicker">All related references</p><h3>논문 아이디어 관련 논문 전체 {manifest.counts.allRelevant}개</h3><p>{manifest.selectionBoundaryKo}</p></div></div>
        <div className="dissertation-reference-controls">
          <div className="research-filter-chips dissertation-reference-filter-chips" aria-label="Reference idea filter">
            {([['all', '전체'], ['educator', 'Idea 01 · 교육자'], ['learner', 'Idea 02 · 학습자'], ['portfolio', 'Idea 03 · 포트폴리오']] as const).map(([id, label]) => <button key={id} type="button" className={filter === id ? 'filter-chip active' : 'filter-chip'} aria-pressed={filter === id} onClick={() => selectFilter(id)}>{label}</button>)}
          </div>
          <div className="research-filter-chips dissertation-reference-sort-chips" aria-label="Reference sort order">
            <button type="button" className={sort === 'relevance' ? 'filter-chip active' : 'filter-chip'} aria-pressed={sort === 'relevance'} onClick={() => selectSort('relevance')}>관련성 높은 순</button>
            <button type="button" className={sort === 'source' ? 'filter-chip active' : 'filter-chip'} aria-pressed={sort === 'source'} onClick={() => selectSort('source')}>수집 순</button>
          </div>
        </div>
        <p className="dissertation-reference-result-summary"><strong>{filter === 'all' ? '전체' : ideaLabel(filter)}</strong> 관련 논문 <strong>{visibleReferences.length}개</strong> · {sort === 'relevance' ? '직접 연관되어 Top 10에 든 논문을 먼저 보여줍니다.' : '처음 수집한 순서로 보여줍니다.'}</p>
        <ol className="dissertation-reference-list">
          {visibleReferences.map((item) => <li key={item.referenceId}><button type="button" onClick={() => setSelectedId(item.referenceId)} aria-pressed={selectedId === item.referenceId}><span>{ideaLabel(item.ideaFit)}{item.top10Rank ? ` · 전체 Top ${item.top10Rank}` : ''}</span><strong><ReferenceTitle item={item} /></strong><small>{item.fitRationaleKo}</small></button></li>)}
        </ol>
      </section>
    </div>
  )
}
