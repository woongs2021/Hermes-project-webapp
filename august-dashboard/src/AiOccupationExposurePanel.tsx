import { useEffect, useMemo, useState } from 'react'
import { loadOccupationExposure, type OccupationExposureData } from './aiOccupationExposure'
import './ai-occupation-exposure.css'

export function AiOccupationExposurePanel() {
  const [data, setData] = useState<OccupationExposureData | null>(null)
  const [family, setFamily] = useState('전체')
  const [designersOnly, setDesignersOnly] = useState(false)

  useEffect(() => { loadOccupationExposure().then(setData).catch(() => setData(null)) }, [])
  const families = useMemo(() => ['전체', ...new Set(data?.occupations.map((item) => item.family) ?? [])], [data])
  const visible = useMemo(() => (data?.occupations ?? []).filter((item) => (family === '전체' || item.family === family) && (!designersOnly || item.family === '디자인')), [data, family, designersOnly])

  return <article className="content-card occupation-exposure-card" aria-labelledby="occupation-exposure-title">
    <header className="occupation-exposure-header">
      <div><p className="card-kicker">Weekly · curated baseline</p><h3 id="occupation-exposure-title">AI 대체 직업 현황판 · Top 100</h3><p>직업이 사라진다고 단정하지 않습니다. 생성형 AI가 *과업 단위*로 돕거나 자동화할 수 있는 노출을 살피는 현황판이며, 해고·고용 전망이 아닙니다.</p></div>
      <p className="occupation-count" aria-live="polite">{data ? `${visible.length} / 100` : '불러오는 중'}</p>
    </header>
    <p className="occupation-method">{data?.methodology ?? '공개 데이터를 불러오고 있습니다.'}</p>
    <div className="occupation-controls" aria-label="직업군 필터">
      <label htmlFor="occupation-family">직업군</label><select id="occupation-family" value={family} onChange={(event) => setFamily(event.target.value)}>{families.map((item) => <option key={item}>{item}</option>)}</select>
      <label className="occupation-designer-toggle"><input type="checkbox" checked={designersOnly} onChange={(event) => setDesignersOnly(event.target.checked)} /> 디자이너 전문분야만 보기</label>
    </div>
    <section className="occupation-designers" aria-labelledby="designer-specialties"><div><p className="card-kicker">Designer specialties</p><h4 id="designer-specialties">디자이너 전용 보기 · 12개 전문분야</h4></div><p>{data?.occupations.filter((item) => item.designerSpecialty).map((item) => item.designerSpecialty).join(' · ')}</p></section>
    <div className="occupation-table-wrap" tabIndex={0} aria-label="AI 자동화 노출 직업 목록">
      <div className="occupation-table-head"><span>순위 · 직업</span><span>직업군</span><span>점수 · 상태</span><span>읽는 법</span></div>
      {visible.map((item) => <div className="occupation-row" key={item.rank}><div><b>{item.rank.toString().padStart(2, '0')}</b><strong>{item.jobKo}</strong><small>{item.jobEn}{item.designerSpecialty ? ` · ${item.designerSpecialty}` : ''}</small></div><span>{item.family}</span><div><b>{item.score}</b><em className={item.status === '자동화 압력 높음' ? 'pressure' : 'augment'}>{item.status}</em></div><p>{item.rationale}</p></div>)}
    </div>
    <footer className="occupation-sources"><strong>참고한 공개 기준</strong><span>업데이트 기준일 {data?.updatedAt ?? '—'}</span><ul>{data?.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul></footer>
  </article>
}
