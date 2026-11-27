import { useEffect, useMemo, useState } from 'react'

type RadarScope = 'Korea' | 'Global'
type RadarFilter = 'all' | RadarScope

type DesignCompanyRadarItem = {
  id: string
  priorityRank: number
  name: string
  scope: RadarScope
  country: string
  companyTypeKo: string
  designFocusKo: string
  whyNowKo: string
  rankRationaleKo: string
  officialUrl: string
  evidenceUrl: string
  tags: string[]
}

type DesignCompanyRadarData = {
  sourcePolicy: string
  items: DesignCompanyRadarItem[]
}

const radarFilters: { id: RadarFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: 'Korea', label: '한국' },
  { id: 'Global', label: '글로벌' },
]

function isRadarItem(value: unknown): value is DesignCompanyRadarItem {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<DesignCompanyRadarItem>
  return typeof item.id === 'string'
    && typeof item.priorityRank === 'number'
    && typeof item.name === 'string'
    && (item.scope === 'Korea' || item.scope === 'Global')
    && typeof item.country === 'string'
    && typeof item.companyTypeKo === 'string'
    && typeof item.designFocusKo === 'string'
    && typeof item.whyNowKo === 'string'
    && typeof item.rankRationaleKo === 'string'
    && typeof item.officialUrl === 'string'
    && typeof item.evidenceUrl === 'string'
    && Array.isArray(item.tags)
    && item.tags.every((tag) => typeof tag === 'string')
}

function isRadarData(value: unknown): value is DesignCompanyRadarData {
  if (!value || typeof value !== 'object') return false
  const data = value as Partial<DesignCompanyRadarData>
  return typeof data.sourcePolicy === 'string' && Array.isArray(data.items) && data.items.every(isRadarItem)
}

export function DesignCompanyRadarPanel() {
  const [data, setData] = useState<DesignCompanyRadarData | null>(null)
  const [filter, setFilter] = useState<RadarFilter>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const dataUrl = `${import.meta.env.BASE_URL}data/design-company-radar.json`

    async function loadRadar() {
      try {
        setError('')
        const response = await fetch(dataUrl, { signal: controller.signal })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const parsed: unknown = await response.json()
        if (!isRadarData(parsed)) throw new Error('invalid radar data')
        setData({ ...parsed, items: [...parsed.items].sort((a, b) => a.priorityRank - b.priorityRank) })
      } catch (loadError) {
        if (loadError instanceof DOMException && loadError.name === 'AbortError') return
        setError('디자인 회사 레이더 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.')
      }
    }

    void loadRadar()
    return () => controller.abort()
  }, [])

  const visibleItems = useMemo(() => (
    data?.items.filter((item) => filter === 'all' || item.scope === filter) ?? []
  ), [data, filter])

  return (
    <section className="design-company-radar" aria-labelledby="design-company-radar-heading">
      <header className="design-company-radar-intro">
        <p className="card-kicker">Design learning watchlist</p>
        <h3 id="design-company-radar-heading">Design Company Radar</h3>
        <p>Design DNA, 브랜드 시스템, 제품·서비스 경험, 디자인 리더십을 학습하기 위한 20개 회사의 초기 관찰 목록입니다.</p>
        <p className="design-company-radar-boundary"><strong>사실 경계:</strong> 이 순위는 기업의 매출·성장·시장가치·사업 성과 순위가 아니라, 디자인 학습 우선순위를 위한 초기 큐레이션입니다.</p>
      </header>

      {data ? (
        <>
          <div className="design-company-radar-toolbar">
            <div className="design-company-radar-filter" role="group" aria-label="회사 범위 필터">
              {radarFilters.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={filter === option.id ? 'active' : ''}
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p aria-live="polite">{visibleItems.length}개 회사</p>
          </div>

          {visibleItems.length > 0 ? (
            <ol className="design-company-radar-list" aria-label="디자인 회사 학습 우선순위 목록">
              {visibleItems.map((item) => (
                <li className="design-company-radar-card" key={item.id}>
                  <div className="design-company-radar-rank" aria-label={`학습 우선순위 ${item.priorityRank}위`}>
                    <span>Priority</span>
                    <strong>{String(item.priorityRank).padStart(2, '0')}</strong>
                  </div>
                  <div className="design-company-radar-main">
                    <div className="design-company-radar-title-row">
                      <h4>{item.name}</h4>
                      <span className={`design-company-radar-scope ${item.scope === 'Korea' ? 'is-korea' : ''}`}>{item.scope === 'Korea' ? '한국' : '글로벌'}</span>
                    </div>
                    <p className="design-company-radar-meta">{item.companyTypeKo} <span aria-hidden="true">·</span> {item.country}</p>
                    <p className="design-company-radar-focus">{item.designFocusKo}</p>
                    <dl className="design-company-radar-reasons">
                      <div>
                        <dt>왜 지금</dt>
                        <dd>{item.whyNowKo}</dd>
                      </div>
                      <div>
                        <dt>순위 근거</dt>
                        <dd>{item.rankRationaleKo}</dd>
                      </div>
                    </dl>
                    <ul className="design-company-radar-tags" aria-label={`${item.name} 태그`}>
                      {item.tags.map((tag) => <li key={tag}>{tag}</li>)}
                    </ul>
                  </div>
                  <div className="design-company-radar-links" aria-label={`${item.name} 외부 링크`}>
                    <a href={item.officialUrl} target="_blank" rel="noreferrer">공식 사이트 <span aria-hidden="true">↗</span></a>
                    <a href={item.evidenceUrl} target="_blank" rel="noreferrer">디자인 근거 <span aria-hidden="true">↗</span></a>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="design-company-radar-state">선택한 범위에 해당하는 회사가 없습니다.</p>
          )}
          <p className="design-company-radar-policy">{data.sourcePolicy}</p>
        </>
      ) : error ? (
        <p className="design-company-radar-state" role="alert">{error}</p>
      ) : (
        <p className="design-company-radar-state" role="status">디자인 회사 레이더를 불러오는 중입니다.</p>
      )}
    </section>
  )
}
