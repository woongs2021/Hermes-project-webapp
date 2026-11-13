import { useEffect, useMemo, useState } from 'react'
import { fallbackCareerJobsManifest, loadCareerJobs, type CareerCategory, type CareerJobsManifest, type CareerWatchlistItem } from './careerJobs'
import './career.css'

const filters: Array<{ id: 'all' | CareerCategory; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'faculty', label: '교수 임용' },
  { id: 'corporate_design', label: '기업 디자인' },
  { id: 'ai_ax_education', label: 'AI·AX 교육' },
]

const categoryLabels: Record<CareerCategory, string> = {
  faculty: '교수 임용',
  corporate_design: '기업 디자인',
  ai_ax_education: 'AI·AX 교육',
}

function formatCheckedAt(value: string) {
  if (!value) return '확인 시각 미확인'
  return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Seoul' }).format(new Date(value))
}

function Watchlist({ title, items, description }: { title: string; items: CareerWatchlistItem[]; description?: string }) {
  const isPriorityUniversityList = title === '우선 대학'
  return (
    <section className="career-watchlist-group" aria-label={title}>
      <div className="career-watchlist-heading"><h4>{title}</h4><span>{items.length}개</span></div>
      {(isPriorityUniversityList || description) && <p className="career-priority-note">{description ?? '디자인 관련 전임 임용을 위한 탐색 우선도예요. 학교 서열이 아니라 전공군·인접성·공고 추적성·교육 미션을 함께 봅니다.'}</p>}
      <ol className={isPriorityUniversityList ? 'career-priority-list' : undefined}>
        {items.map((item) => (
          <li key={item.name}>
            <div><strong>{isPriorityUniversityList && item.priority ? <><span className="career-priority-rank">{item.priority}</span>{item.name}</> : item.name}</strong><p>{item.monitoringRationale ?? item.verificationNote}</p></div>
            <div className="career-watchlist-meta"><span className={item.result === 'open matching role' ? 'career-result open' : 'career-result'}>{item.result}</span><a href={item.sourceUrl} target="_blank" rel="noreferrer">공식 채용</a>{item.programUrl && <a href={item.programUrl} target="_blank" rel="noreferrer">관련 전공</a>}</div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function CareerPanel() {
  const [manifest, setManifest] = useState<CareerJobsManifest>(fallbackCareerJobsManifest)
  const [filter, setFilter] = useState<'all' | CareerCategory>('all')

  useEffect(() => { void loadCareerJobs().then(setManifest) }, [])

  const jobs = useMemo(() => manifest.jobs.filter((job) => filter === 'all' || job.category === filter), [filter, manifest.jobs])

  return (
    <div className="career-shell" aria-label="Career opportunities">
      <section className="content-card career-brief">
        <div><p className="card-kicker">Career 1st draft</p><h3>공식 상세로 확인된 기회만 차분히 봅니다</h3><p>후보 카드는 역할별 공식 공고 상세에서 확인된 항목만 표시합니다. 그 외 출처는 공식 watchlist에서 확인 상태로 분리합니다.</p><p className="career-source-policy">{manifest.sourcePolicy}</p></div>
        <div className="career-brief-meta"><span>검증 시각</span><strong>{formatCheckedAt(manifest.generatedAt)}</strong></div>
      </section>

      <section className="content-card career-workflow" aria-label="Career monitoring workflow">
        <header><p className="card-kicker">Weekly release workflow</p><h3>빠르게 넓게 찾고, 역할 상세에서만 좁혀 확정합니다</h3><p>이번 1차 드래프트는 월요일 공식 발행 전의 검증 기준을 먼저 보여줍니다. 불확실한 검색 결과를 후보처럼 보이게 하지 않는 것이 원칙입니다.</p></header>
        <ol>
          <li><span>01</span><div><strong>공식 출처를 Korea-first로 점검</strong><p>국립·공공 교육기관, 국내 기업, 글로벌 기업의 공식 Careers를 나눠 확인합니다.</p></div></li>
          <li><span>02</span><div><strong>공고 상세와 공개 근거를 재확인</strong><p>제목·근무지·역할 근거가 같은 공식 역할 상세에서 확인될 때만 후보로 올립니다.</p></div></li>
          <li><span>03</span><div><strong>공개 가능한 주간 요약만 발행</strong><p>새 공고·변경·확인 필요 상태를 분리하며, 미공개 조건은 추정하지 않습니다.</p></div></li>
        </ol>
      </section>

      <section className="content-card career-filter-card" aria-label="Career category filter">
        <div><p className="card-kicker">Verified candidates</p><h3>확인된 후보 {jobs.length}개</h3></div>
        <div className="research-filter-chips">
          {filters.map((item) => <button key={item.id} type="button" className={filter === item.id ? 'filter-chip active' : 'filter-chip'} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
        </div>
      </section>

      <section className="career-job-list" aria-live="polite">
        {jobs.length ? jobs.map((job) => (
          <article className="content-card career-job-card" key={job.id}>
            <div className="career-job-heading"><div><p className="card-kicker">{categoryLabels[job.category]}</p><h3>{job.title}</h3><p>{job.companyOrInstitution} · {job.location}</p></div><span className="career-status">{job.status}</span></div>
            <p className="career-evidence"><strong>공식 근거</strong>{job.sourceEvidence}</p>
            <dl className="career-facts"><div><dt>연봉</dt><dd>{job.publishedSalaryText}</dd></div><div><dt>마감</dt><dd>{job.deadline}</dd></div><div><dt>지원 자격</dt><dd>{job.eligibility}</dd></div><div><dt>근무 방식</dt><dd>{job.workMode}</dd></div></dl>
            <div className="career-job-footer"><span>확인: {formatCheckedAt(job.checkedAt)} · 적합도: {job.fit}</span><a className="career-official-link" href={job.canonicalUrl} target="_blank" rel="noreferrer">공식 공고 보기 <span aria-hidden="true">↗</span></a></div>
          </article>
        )) : <div className="content-card career-empty"><h3>이 범주의 확인된 후보가 없습니다</h3><p>현재 필터에서 역할별 공식 상세로 확인된 공고가 없습니다. 공식 watchlist는 아래에서 계속 확인할 수 있습니다.</p></div>}
      </section>

      <section className="content-card career-watchlists" aria-label="Official watchlists">
        <header><p className="card-kicker">Official watchlist</p><h3>공식 watchlist</h3><p>공식 페이지를 확인했지만 역할별 상세가 확인되지 않거나 응답이 제한된 출처입니다. UNVERIFIED는 공고 마감이나 부재를 뜻하지 않습니다.</p></header>
        <div className="career-watchlist-grid">
          <Watchlist title="우선 대학" items={manifest.watchlists.priorityUniversities} />
          <Watchlist title="국내 플랫폼·대기업" items={manifest.watchlists.koreanLargeCompanies} description="네이버·카카오·라인·쿠팡·우아한형제들·당근·토스의 공식 채용을 UX·제품·브랜드·AI/AX 리더십 관점에서 확인합니다." />
          <Watchlist title="통신 3사" items={manifest.watchlists.telecomCompanies} description="AI·데이터·B2C/B2B 서비스 전환과 대규모 고객경험을 다루는 시니어 디자인 역할을 우선 확인합니다." />
          <Watchlist title="시니어 10년+ 타깃" items={manifest.watchlists.seniorGrowthCompanies} description="스케일업·디지털 기업의 UX·제품·브랜드·디자인 리드 역할을 봅니다. 공식 상세에 Senior/Lead/Principal/Head 또는 10년+ 경력이 명시된 경우에만 후보로 올립니다." />
          <Watchlist title="글로벌 기업" items={manifest.watchlists.globalCompanies} />
        </div>
      </section>

      <p className="career-evidence-limit">근거 범위: {manifest.evidenceLimit}</p>
    </div>
  )
}
