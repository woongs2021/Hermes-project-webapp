import { useEffect, useState } from 'react'

type AxCase = {
  id: string
  region: 'Korea' | 'Global'
  organization: string
  titleKo: string
  sourceTitle: string
  sourceUrl: string
  sourceName: string
  sourceType: 'official' | 'reputable_media' | 'research' | 'verified_org_sns'
  publishedAt: string
  workflowKo: string
  whatChangedKo: string
  evidenceKo: string
  implicationKo: string
  claimBoundaryKo: string
  publicSafe: true
}

type AxWeeklyRelease = {
  week: string
  generatedAt: string
  cases: AxCase[]
}

type AxWeeklyReport = {
  version: 2
  publicSafe: true
  status: 'awaiting_first_qualified_week' | 'published'
  sourcePolicy: string
  releases: AxWeeklyRelease[]
}

const fallbackReport: AxWeeklyReport = {
  version: 2,
  publicSafe: true,
  status: 'awaiting_first_qualified_week',
  sourcePolicy: '공개 접근 가능한 신뢰 출처의 짧은 자체 요약만 포함하며 개인·비공개·원시 조사 데이터는 포함하지 않는다.',
  releases: [],
}

const publicDataUrl = `${import.meta.env.BASE_URL}data/ax-weekly-report.json`

function regionLabel(region: AxCase['region']) {
  return region === 'Korea' ? '국내 AX 사례' : '해외 AX 사례'
}

function formatPublishedDate(value: string) {
  return new Date(value).toLocaleDateString('ko-KR')
}

export function AxCaseWeeklyReportPanel() {
  const [report, setReport] = useState<AxWeeklyReport>(fallbackReport)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let active = true
    fetch(publicDataUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Unable to load AX cases: ${response.status}`)
        return response.json() as Promise<AxWeeklyReport>
      })
      .then((data) => { if (active) setReport(data) })
      .catch(() => { if (active) setLoadError(true) })
    return () => { active = false }
  }, [])

  const latestRelease = report.releases[report.releases.length - 1]
  const totalCases = report.releases.reduce((total, release) => total + release.cases.length, 0)

  return (
    <section className="ax-case-report-shell" aria-label="AX 사례 누적 리포트">
      <header className="ax-case-report-intro">
        <p className="card-kicker">Public AX case archive</p>
        <h3>국내외 AX 사례를, 도입 사실과 해석의 경계를 나눠 쌓아 읽는다</h3>
        <p>월·수·금에 확인한 공개 사례 중, 중복되지 않고 출처·업무 변화·한계를 확인할 수 있는 국내 1건과 해외 1건 이상만 주간 리포트로 남긴다. 새 적격 회차는 기존 기록을 바꾸지 않고 이 페이지의 하단에 이어 붙인다.</p>
        <div className="ax-case-report-meta" aria-label="AX 사례 리포트 상태">
          <span>{latestRelease ? `최근 Week ${latestRelease.week}` : '첫 공개 리포트 대기'}</span>
          <span>{latestRelease ? `최근 발행 ${formatPublishedDate(latestRelease.generatedAt)}` : '금요일 적격 사례 확인 후 발행'}</span>
          <span>{totalCases}개 누적 공개 사례</span>
        </div>
      </header>

      {loadError ? <p className="ax-case-report-notice">AX 사례 아카이브를 불러오지 못했다. 직전 검증 공개본을 유지한다.</p> : null}
      {report.status === 'awaiting_first_qualified_week' || report.releases.length === 0 ? (
        <section className="ax-case-report-empty">
          <p className="card-kicker">Qualifying set required</p>
          <h4>첫 리포트는 국내 1건·해외 1건이 모두 확인될 때만 공개한다.</h4>
          <p>기준을 충족하지 못한 회차에는 빈 사례를 채우지 않고, 다음 조사 회차까지 기다린다. 공개 전에는 중복 여부, 원문 링크, 공개 범위와 주장 한계를 다시 확인한다.</p>
        </section>
      ) : (
        <div className="ax-case-report-archive" aria-label="발행 순서 AX 사례 아카이브">
          {report.releases.map((release, releaseIndex) => {
            const koreaCases = release.cases.filter((item) => item.region === 'Korea')
            const globalCases = release.cases.filter((item) => item.region === 'Global')
            const groups: Array<[AxCase['region'], AxCase[]]> = [['Korea', koreaCases], ['Global', globalCases]]

            return (
              <section className="ax-case-report-release" key={release.week} aria-label={`Week ${release.week} AX 사례`}>
                <header className="ax-case-report-release-heading">
                  <div>
                    <p className="card-kicker">Release {String(releaseIndex + 1).padStart(2, '0')}</p>
                    <h4>Week {release.week}</h4>
                  </div>
                  <div className="ax-case-report-release-meta">
                    <span>{formatPublishedDate(release.generatedAt)} 발행</span>
                    <span>{release.cases.length}개 사례</span>
                  </div>
                </header>
                <div className="ax-case-report-groups">
                  {groups.map(([region, cases]) => (
                    <section className="ax-case-report-region" key={region} aria-label={regionLabel(region)}>
                      <div className="ax-case-report-region-heading">
                        <p className="card-kicker">{regionLabel(region)}</p>
                        <span>{cases.length}건</span>
                      </div>
                      {cases.map((item) => (
                        <article className="ax-case-card" key={item.id}>
                          <div className="ax-case-card-topline">
                            <span>{item.organization}</span><span>{item.workflowKo}</span>
                          </div>
                          <h4><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.titleKo}</a></h4>
                          <p className="ax-case-card-source"><a href={item.sourceUrl} target="_blank" rel="noreferrer">{item.sourceTitle} ↗</a><span>{item.sourceName} · {item.publishedAt}</span></p>
                          <dl>
                            <div><dt>무엇이 바뀌었나</dt><dd>{item.whatChangedKo}</dd></div>
                            <div><dt>공개 근거</dt><dd>{item.evidenceKo}</dd></div>
                            <div><dt>해석</dt><dd>{item.implicationKo}</dd></div>
                            <div><dt>확인 범위</dt><dd>{item.claimBoundaryKo}</dd></div>
                          </dl>
                        </article>
                      ))}
                    </section>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
      <p className="ax-case-report-policy">{report.sourcePolicy}</p>
    </section>
  )
}
