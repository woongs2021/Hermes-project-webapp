import { useRef, useState, type KeyboardEvent } from 'react'
import { personalAxReports, type PersonalAxReport, type PersonalAxReportId } from './personalAxReportData'
import { getReportPrompts, renderReportPromptHtmlSection } from './personalAxReportPrompts'

type DownloadStatus = 'idle' | 'html-downloaded' | 'pdf-generating' | 'pdf-downloaded' | 'error'

const highlightPhrases = [
  // AI 리서치
  '실행 전 계획 공개, 실행 중 권한 확인, 실행 후 회복 가능성',
  '사용자가 결정권을 잃지 않았다고 느끼는 반복 경험',
  '계획·권한·실행·오류·복구의 흔적',
  '위험의 크기와 사용자의 맥락',
  '실행 중 수정과 철회',
  '데이터 수집과 2차 이용·공유, 보존, 자율 실행',
  '설명과 구현의 간극',
  '사용자가 실제로 확인할 수 있는 계획, 변경 사항, 오류, 복구 상태',
  '범위·기간·되돌림 가능성',
  '필요한 순간에만 선명하게 보이는 선택권',
  '계획을 먼저 드러내고 단계적으로 실행하는 구조',
  // 디자인 리서치
  '판단·평가·독창성을 함께 다루는 디자인 역량',
  '좋은 질문·평가·수정이 반복될 조건',
  '출력 생성보다 판단 기준과 검증 루프',
  '문제 정의, 근거 확인, 반례 탐색, 수정 이유 설명',
  '시각적 완성도가 높을수록 출처와 구현 조건',
  '개인의 감각을 조직의 학습으로 연결',
  '톤, 접근성, 문화적 맥락, 권리 이슈',
  '생성 속도를 평가의 속도로 착각하지 않는 일',
  '평가 기준·반례·최종 책임의 위치',
  '재사용 가능한 팀의 판단력',
  'AI 지원 도구는 창의성을 자동으로 높이거나 낮추는 단일 원인이 아니다',
  // AX 트렌드
  '통제 가능한 운영 품질',
  '권한 설계, 상호작용 순서, 조직의 평가 체계',
  '실행 중 관찰·수정·철회',
  '접근성·구현·복구의 추적 가능성',
  '판단·윤리·출력 평가를 포함하는 학습 체계',
  '위임 범위, 사용자 확인 문구, 실패 시 복구 책임자',
  '사용자와 팀이 더 나은 결정을 할 수 있게 된 지점',
  '브랜드의 말투와 고객 약속을 해치지 않으면서',
  '통제·품질·학습이 함께 작동하는지',
  '약속한 범위를 지키고, 예외를 숨기지 않으며',
  // 패키지 디자인
  '주의, 해석, 신뢰, 행동의 연쇄',
  '구매 전·사용 중·사용 후의 행동',
  '제한된 시간 안에 주의를 얻고 의미를 전달',
  '브랜드가 약속하는 품질과 적합성',
  '건강성 지각, 브랜드 태도, 구매의도',
  '개봉·보관·잔량 판단·폐기',
  '특정 정보 단서나 물성 변화',
  '첫 시선 진입, 정보 탐색, 브랜드 식별, 비교, 최종 선택',
  '그래픽·구조·정보·서비스를 같은 경험의 층',
  '물리적 인터페이스',
  // 디자인교육 트렌드
  'AI와 함께 판단하는 과정을 학습시키는 일',
  '생성·검토·공개·수정의 학습 흐름',
  '결과를 거리 두고 읽는 능력',
  '생성 속도와 평가 속도를 같은 것으로 착각하지 않기',
  '선택과 책임을 말할 수 있게 하는 공용 언어',
  '판단의 근력을 길러 주는 데',
  // Threads 분석
  'AI를 하나의 모델이 아니라 과업의 변화로 읽는다.',
  '직업 전체보다 문서·초안·반복 분석 같은 과업이 먼저 바뀐다.',
  '생성 속도와 판단의 품질은 같은 것이 아니다.',
  '자동화의 가치는 사람이 무엇을 검수할지 정할 때 선명해진다.',
  '도구 경험의 장점과 마찰을 함께 말하는 태도가 신뢰를 만든다.',
  'AI 담론은 보안·승인·비용·조직 문화의 현실을 통과해야 한다.',
  '콘텐츠의 차별점은 속보가 아니라 변화의 순서를 해석하는 언어다.',
  '맥락과 서사는 생성물이 많아질수록 더 중요한 선택 기준이 된다.',
  '자료가 말하는 범위와 실무 해석을 분리할수록 브랜드의 근거가 또렷해진다.',
  '시장 해석·사용 경험·문화 비평을 연결하면 짧은 글도 아카이브가 된다.',
  'Threads와 Hermes의 읽기 전용 연동이 완료되어 이 분석을 작성할 수 있었다.',
]

function highlightText(value: string) {
  const expression = new RegExp(`(${highlightPhrases.map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
  return value.split(expression).map((part, index) => highlightPhrases.includes(part)
    ? <mark className="personal-ax-report-highlight" key={`${part}-${index}`}>{part}</mark>
    : part)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character)
}

function reportHtml(report: PersonalAxReport) {
  const heroUrl = `${window.location.origin}${import.meta.env.BASE_URL}${report.heroImage}`
  const sections = report.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
      ${section.afterBulletsParagraphs?.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('') ?? ''}
    </section>`).join('')
  const sources = report.sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.title)}</a> <small>${source.access}</small></li>`).join('')
  const promptSection = renderReportPromptHtmlSection(report, escapeHtml)

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(report.title)}</title><style>body{max-width:760px;margin:56px auto;padding:0 24px;color:#17233a;background:#fcfbf8;font:16px/1.8 system-ui,sans-serif}small{color:#60708a}h1{font-size:34px;line-height:1.28}h2{margin-top:44px;font-size:21px}section>p{text-indent:1em}a{color:#315f97}li{margin:8px 0}.eyebrow{text-transform:uppercase;letter-spacing:.09em;font-size:12px}</style></head><body><p class="eyebrow">${escapeHtml(report.eyebrow)}</p><img src="${escapeHtml(heroUrl)}" alt="${escapeHtml(report.heroAlt)}" style="width:100%;border-radius:16px;display:block;margin:0 0 28px"><h1>${escapeHtml(report.title)}</h1><p>${escapeHtml(report.dek)}</p>${sections}<section><h2>인용 레퍼런스</h2><ul>${sources}</ul></section>${promptSection}</body></html>`
}

function DesignerAiMarketTimeline({ timeline }: { timeline: NonNullable<PersonalAxReport['marketTimeline']> }) {
  const [selectedIndex, setSelectedIndex] = useState(timeline.years.length - 1)
  const selectedYear = timeline.years[selectedIndex]
  const width = 700
  const height = 250
  const left = 48
  const bottom = 214
  const step = (width - left - 24) / (timeline.years.length - 1)
  const signalY = (signal: number) => bottom - (signal - 1) * 38
  const linePath = (signals: number[]) => signals.map((signal, index) => `${index === 0 ? 'M' : 'L'} ${left + index * step} ${signalY(signal)}`).join(' ')
  const areaPath = (signals: number[]) => `${linePath(signals)} L ${left + (signals.length - 1) * step} ${bottom} L ${left} ${bottom} Z`

  const selectByKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const keyDelta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!keyDelta) return
    event.preventDefault()
    const nextIndex = (index + keyDelta + timeline.years.length) % timeline.years.length
    setSelectedIndex(nextIndex)
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`button[data-year="${timeline.years[nextIndex].year}"]`)?.focus()
  }

  return (
    <section className="designer-ai-timeline" aria-labelledby="designer-ai-timeline-title">
      <div className="designer-ai-timeline-heading">
        <div>
          <p className="card-kicker">2020–2026 · market lenses</p>
          <h4 id="designer-ai-timeline-title">디자이너 AI 위험: 시장별 변화 신호</h4>
        </div>
        <p className="designer-ai-timeline-label">{timeline.label} · 1 낮음 — 5 높음</p>
      </div>
      <p className="designer-ai-timeline-caveat"><strong>읽는 법.</strong> {timeline.caveat}</p>
      <div className="designer-ai-timeline-axes" aria-label="타임라인 축 설명">
        <p><strong>{timeline.xAxis.split(' · ')[0]}</strong>{timeline.xAxis.replace(/^X축 · /, ' · ')}</p>
        <p><strong>{timeline.yAxis.split(' · ')[0]}</strong>{timeline.yAxis.replace(/^Y축 · /, ' · ')}</p>
      </div>

      <div className="designer-ai-timeline-legend" aria-label="시장 렌즈 범례">
        {timeline.lenses.map((lens) => <div className={`designer-ai-timeline-legend-item ${lens.id}`} key={lens.id}><span aria-hidden="true" /> <strong>{lens.label}</strong><p>{lens.summary}</p></div>)}
      </div>

      <div className="designer-ai-timeline-chart" role="img" aria-label={`${timeline.xAxis} ${timeline.yAxis} 프리랜서·플랫폼, 일반 스타트업, 대기업의 AI 때문에 디자인 일이 바뀌는 정도 그래프`}>
        <svg viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
          {[1, 2, 3, 4, 5].map((signal) => <g key={signal}><line x1={left} x2={width - 24} y1={signalY(signal)} y2={signalY(signal)} /><text x="0" y={signalY(signal) + 4}>{signal}</text></g>)}
          {timeline.lenses.map((lens) => <path className={`designer-ai-timeline-area ${lens.id}`} key={`${lens.id}-area`} d={areaPath(lens.points.map((point) => point.signal))} />)}
          {timeline.lenses.map((lens) => <path className={`designer-ai-timeline-line ${lens.id}`} key={`${lens.id}-line`} d={linePath(lens.points.map((point) => point.signal))} />)}
          {timeline.lenses.map((lens) => lens.points.map((point, index) => <circle className={lens.id} cx={left + index * step} cy={signalY(point.signal)} key={`${lens.id}-${index}`} r={index === selectedIndex ? 5.5 : 3.5} />))}
          <text className="designer-ai-timeline-y-axis-label" x="12" y="128" transform="rotate(-90 12 128)">Y축 · 디자인 일이 바뀌는 정도 (1 낮음 — 5 높음)</text>
          <text className="designer-ai-timeline-x-axis-label" x="520" y="244">X축 · 달력 연도 / 관찰 시점</text>
        </svg>
      </div>

      <div className="designer-ai-timeline-years" role="group" aria-label="연도 선택">
        {timeline.years.map((year, index) => <button data-year={year.year} type="button" key={year.year} className={index === selectedIndex ? 'active' : ''} aria-pressed={index === selectedIndex} onClick={() => setSelectedIndex(index)} onKeyDown={(event) => selectByKeyboard(event, index)}>{year.year}</button>)}
      </div>

      <div className="designer-ai-timeline-detail" aria-live="polite">
        <p className="card-kicker">selected year · {selectedYear.year}</p>
        <h5>{selectedYear.year}년 상세 읽기</h5>
        <p>{selectedYear.detail}</p>
        <div className="designer-ai-timeline-lens-notes">
          {timeline.lenses.map((lens) => {
            const point = lens.points[selectedIndex]
            return <div className={lens.id} key={lens.id}><strong>{lens.label} · 신호 {point.signal}/5</strong><p>{point.taskSignal}</p></div>
          })}
        </div>
        <div className="designer-ai-timeline-sources"><strong>출처·해석 경계</strong><ul>{selectedYear.sourceNotes.map((note) => <li key={note}>{note}</li>)}</ul></div>
      </div>

      <section className="designer-ai-market-trends" aria-labelledby="designer-ai-market-trends-title">
        <div className="designer-ai-market-trends-heading">
          <p className="card-kicker">Market trend detail · 2020–2026</p>
          <h5 id="designer-ai-market-trends-title">시장별 변화, 조금 더 자세히 읽기</h5>
          <p>아래 내용은 위 타임라인과 같은 공개 보고서·도입 변화의 범위에서 정리한 해석이다. 실제 고용·수입·감원 결과를 재는 통계가 아니며, 2026년은 아직 끝나지 않은 현재 관찰 구간이다.</p>
        </div>
        <div className="designer-ai-market-trend-lanes">
          {timeline.lenses.map((lens) => (
            <article className={`designer-ai-market-trend-lane ${lens.id}`} key={`${lens.id}-trend-detail`}>
              <header><p className="card-kicker">{lens.label}</p><h6>{lens.summary}</h6></header>
              <div className="designer-ai-market-trend-phases">
                {lens.trendDetails.map((phase) => (
                  <section key={phase.period}>
                    <p className="designer-ai-market-trend-period">{phase.period}</p>
                    <h6>{phase.title}</h6>
                    <dl>
                      <div><dt>수요·일하는 방식</dt><dd>{phase.demandAndWorkModel}</dd></div>
                      <div><dt>더 빨라지는 일 / 사람의 판단</dt><dd>{phase.automationAndHumanJudgment}</dd></div>
                      <div><dt>다음에 볼 점</dt><dd>{phase.watchNext}</dd></div>
                    </dl>
                  </section>
                ))}
              </div>
              {lens.platformContext && (
                <section className="designer-ai-platform-context" aria-labelledby="designer-ai-platform-context-title">
                  <header>
                    <p className="card-kicker">Platform evidence · public indicators</p>
                    <h6 id="designer-ai-platform-context-title">{lens.platformContext.heading}</h6>
                    <p>{lens.platformContext.introduction}</p>
                  </header>
                  <div className="designer-ai-platform-context-list">
                    {lens.platformContext.platforms.map((platform) => (
                      <article key={platform.name}>
                        <header><h6>{platform.name}</h6><p>{platform.indicatorScope}</p></header>
                        <ul>
                          {platform.indicators.map((indicator) => <li key={`${platform.name}-${indicator.date}`}><strong>{indicator.date} · {indicator.value}</strong><span>{indicator.description}</span></li>)}
                        </ul>
                        <dl>
                          <div><dt>이 수치가 말할 수 있는 것</dt><dd>{platform.canSay}</dd></div>
                          <div><dt>이 수치로 말할 수 없는 것</dt><dd>{platform.cannotSay}</dd></div>
                        </dl>
                      </article>
                    ))}
                  </div>
                  <p className="designer-ai-platform-context-inference"><strong>사실과 분리한 해석.</strong> {lens.platformContext.inference.replace(/^해석: /, '')}</p>
                  <p className="designer-ai-platform-context-warning"><strong>{lens.platformContext.scopeWarning.split(': ')[0]}.</strong> {lens.platformContext.scopeWarning.replace(/^[^:]+: /, '')}</p>
                </section>
              )}
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}

export function PersonalAxReportPanel({ reportId, reportIds }: { reportId?: PersonalAxReportId; reportIds?: PersonalAxReportId[] }) {
  const visibleReports = reportIds
    ? reportIds.map((id) => personalAxReports.find((item) => item.id === id)).filter((item): item is PersonalAxReport => Boolean(item))
    : reportId
      ? personalAxReports.filter((item) => item.id === reportId)
      : personalAxReports.filter((item) => item.id !== 'dissertation' && item.id !== 'dissertation-idea-2' && item.id !== 'dissertation-idea-3')
  const [activeId, setActiveId] = useState(reportIds?.[0] ?? reportId ?? visibleReports[0].id)
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle')
  const pdfGenerationInProgress = useRef(false)
  const report = visibleReports.find((item) => item.id === activeId) ?? visibleReports[0]
  const isThreadsContentReport = report.id === 'threads-content'
  const isDissertationReport = report.id === 'dissertation' || report.id === 'dissertation-idea-2' || report.id === 'dissertation-idea-3'
  const isLearnerDissertation = report.id === 'dissertation-idea-2'
  const isPortfolioDissertation = report.id === 'dissertation-idea-3'
  const prompts = getReportPrompts(report)
  const orderedSections = isDissertationReport
    ? [...report.sections].sort((a, b) => (a.heading === '예상 논문 제목과 초록' ? -1 : b.heading === '예상 논문 제목과 초록' ? 1 : 0))
    : report.sections

  const downloadHtml = () => {
    try {
      const blob = new Blob([reportHtml(report)], { type: 'text/html;charset=utf-8' })
      const href = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = href
      anchor.download = `personal-ax-${report.id}-2026-10.html`
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(href), 0)
      setDownloadStatus('html-downloaded')
    } catch {
      setDownloadStatus('error')
    }
  }

  const downloadPdf = async () => {
    if (pdfGenerationInProgress.current || downloadStatus === 'pdf-generating') return

    pdfGenerationInProgress.current = true
    setDownloadStatus('pdf-generating')
    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const reportElement = document.querySelector<HTMLElement>('#personal-ax-report-print')
      if (!reportElement) throw new Error('Report element not found')

      const exportDate = new Date().toISOString().slice(0, 10)
      const pdfOptions = {
        margin: [12, 12, 14, 12] as [number, number, number, number],
        filename: `personal-ax-${report.id}-${exportDate}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        enableLinks: true,
        html2canvas: { useCORS: true, allowTaint: false, scale: 2, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: {
          mode: ['css', 'legacy'],
          avoid: [
            '.personal-ax-report-section',
            '.designer-ai-timeline',
            '.personal-ax-report-sources',
            '.personal-ax-report-prompts',
            '.dissertation-method-map',
            '.personal-ax-report-hero',
          ],
        },
      }

      await html2pdf().set(pdfOptions).from(reportElement).save()
      setDownloadStatus('pdf-downloaded')
    } catch {
      setDownloadStatus('error')
    } finally {
      pdfGenerationInProgress.current = false
    }
  }

  return (
    <div className="personal-ax-report-shell" aria-label={isDissertationReport ? 'Dissertation research concept' : 'Personal AX October 2026 reports'}>
      <div className="personal-ax-report-controls">
        {visibleReports.length > 1 ? (
          <nav className="personal-ax-report-tabs" aria-label="Personal AX report categories">
            {visibleReports.map((item) => (
              <button key={item.id} type="button" className={item.id === report.id ? 'active' : ''} aria-pressed={item.id === report.id} onClick={() => { setActiveId(item.id); setDownloadStatus('idle') }}>
                {item.label}
              </button>
            ))}
          </nav>
        ) : <span />}
        <div className="personal-ax-report-actions">
          <button type="button" onClick={downloadHtml}>HTML 다운로드</button>
          <button type="button" onClick={downloadPdf} disabled={downloadStatus === 'pdf-generating'}>{downloadStatus === 'pdf-generating' ? 'PDF 만드는 중…' : 'PDF 다운로드'}</button>
        </div>
      </div>
      <p className="personal-ax-download-status" aria-live="polite">{downloadStatus === 'pdf-generating'
        ? 'PDF 파일을 만드는 중입니다. 잠시만 기다려 주세요.'
        : downloadStatus === 'pdf-downloaded'
          ? 'PDF 파일을 준비했습니다.'
          : downloadStatus === 'html-downloaded'
            ? 'HTML 파일을 준비했습니다.'
            : downloadStatus === 'error'
              ? 'PDF 파일을 만들지 못했습니다. 다시 시도해 주세요.'
              : '브라우저에서만 파일을 생성하며, 서버로 내용을 전송하지 않습니다.'}</p>

      <article className="personal-ax-report-article" id="personal-ax-report-print">
        <header>
          <figure className="personal-ax-report-hero">
            <img src={`${import.meta.env.BASE_URL}${report.heroImage}`} alt={report.heroAlt} />
          </figure>
          <p className="card-kicker">{report.eyebrow}</p>
          <h3>{report.title}</h3>
          <p className="personal-ax-report-dek">{report.dek}</p>
          <p className="personal-ax-report-byline">{isDissertationReport
            ? isLearnerDissertation
              ? '이 글은 학습자용 개인화 교육 에이전트를 실제로 설계하고 검증하기 위한 연구 메모입니다. 아직 결론이 아니라, 어떤 학습 경험과 통제권을 확인해야 하는지부터 차근히 정리했습니다.'
              : isPortfolioDissertation
                ? '이 글은 학생과 주니어 디자이너가 AI 보조 작업을 포트폴리오에서 투명하게 설명하고, 리뷰어가 그 과정을 검토할 수 있게 하는 연구 메모입니다. 탐지 결과가 아니라 작업의 판단 흔적을 확인하는 방법을 살핍니다.'
              : '이 글은 교육자용 AI 조교를 실제로 설계하고 검증하기 위한 연구 메모입니다. 아직 결론이 아니라, 무엇을 확인해야 하는지부터 차근히 정리했습니다.'
            : isThreadsContentReport
              ? '최근 Threads 30편을 읽으며, 반복되는 생각과 다음에 더 선명하게 만들 포인트를 블로그 노트처럼 정리했어.'
              : '논문을 그대로 옮기기보다, 지금의 일과 제품에 어떤 질문을 던지는지 쉽게 풀어봤어. 근거와 해석의 경계는 본문 안에서 함께 표시해 뒀어.'}
          </p>
          <p className="personal-ax-report-note">{isDissertationReport
            ? isLearnerDissertation
              ? '이 연구는 참여자의 선택 동의를 전제로 최소한의 학습 맥락만 활용하며, 성적·민감정보·자동 의사결정은 파일럿 범위에서 제외합니다.'
              : isPortfolioDissertation
                ? 'AI 탐지기를 진실 판정기로 사용하지 않습니다. 공개 가능한 작업 기록, 권리·출처, 품질 점검과 최종 인간 책임을 함께 검토하며, 채용 성과나 진위 판별의 정확도를 단정하지 않습니다.'
              : '학생 개인정보와 자동 성적확정은 초기 파일럿 범위에서 제외하며, 교육자의 최종 승인권·수정 이력·예외 처리를 연구의 관찰 대상으로 둡니다.'
            : isThreadsContentReport
              ? '참여도 지표, 댓글, 도달은 분석에 포함하지 않았으며, 본문은 게시물 텍스트에서 확인되는 주제와 표현의 반복 패턴을 해석합니다.'
              : '연구의 결과를 모든 제품·조직에 대한 효과로 일반화하지 않으며, 본문에서 연구 범위와 해석의 경계를 함께 표시합니다.'}
          </p>
        </header>

        {report.marketTimeline ? <DesignerAiMarketTimeline timeline={report.marketTimeline} /> : null}

        {orderedSections.map((section) => {
          const intro = section.paragraphs.slice(0, 2)
          const details = section.paragraphs.slice(2)
          const isProposedPaperAbstract = isDissertationReport && section.heading === '예상 논문 제목과 초록'
          return (
            <section className="personal-ax-report-section" key={section.heading}>
              <h4>{section.heading}</h4>
              {intro.map((paragraph, index) => <p key={paragraph} className={isProposedPaperAbstract && index === 0 ? 'personal-ax-paper-title' : undefined}>{highlightText(paragraph)}</p>)}
              {details.length > 0 ? <details className="personal-ax-report-more" open><summary>더 깊이 읽기</summary>{details.map((paragraph) => <p key={paragraph}>{highlightText(paragraph)}</p>)}</details> : null}
              {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{highlightText(bullet)}</li>)}</ul> : null}
              {section.afterBulletsParagraphs?.map((paragraph) => <p key={paragraph}>{highlightText(paragraph)}</p>)}
              {isDissertationReport && section.heading === '연구 설계: 인터뷰 → 프로토타입 → 4주 단일사례 사용' ? (
                <div className="dissertation-method-map" aria-label="권장 연구 방법론 도표">
                  <p className="card-kicker">Recommended analysis plan</p>
                  <h5>권장 연구 방법론 도표</h5>
                  <p>핵심은 <strong>질적 기술연구 + 사례 내 주제분석</strong>이야. 인터뷰와 사용 로그를 같은 분석틀로 연결하되, 효과 검증으로 과장하지 않고 설계 요구와 승인 흐름을 드러내는 데 집중해.</p>
                  <div className="dissertation-method-table-wrap">
                    <table>
                      <thead><tr><th>연구 단계</th><th>자료·분석 방법</th><th>산출물</th></tr></thead>
                      <tbody>
                        <tr><td>요구 탐색</td><td>교육전문가 10명 반구조화 인터뷰 → Braun &amp; Clarke식 반사적 주제분석</td><td>위임 과업·인간 승인·위험·데이터 경계 코드</td></tr>
                        <tr><td>설계 번역</td><td>인터뷰 주제를 과업–승인–근거–예외 매트릭스로 교차 정리</td><td>김조교 기능 명세와 human-in-the-loop 서비스 블루프린트</td></tr>
                        <tr><td>초기 사용</td><td>4주 단일사례 로그 → 사례 내 패턴 매칭과 시간순(process tracing) 분석</td><td>수용·수정·반려·복구가 발생한 대표 사용 사례</td></tr>
                        <tr><td>해석 보완</td><td>참여자 검토 2~3명, 제2 코더 대조, 부정 사례 확인</td><td>설계 원리의 수정 근거와 해석 한계</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="dissertation-method-note">권장 이유: 표본과 사용 기간이 제한된 이 연구에는 통계적 효과 검정보다, 어떤 조건에서 교육자의 판단이 유지·변경·회복되는지를 추적하는 분석이 더 타당해. 정량 지표는 시간·재작업 횟수의 <em>탐색적 기술통계</em>로만 보조해.</p>
                </div>
              ) : null}
            </section>
          )
        })}

        <section className="personal-ax-report-sources">
          <p className="card-kicker">Cited references</p>
          <h4>인용 레퍼런스와 확인 범위</h4>
          <ul>{report.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.title}</a><span>{source.access}</span></li>)}</ul>
        </section>

        {prompts.length > 0 ? (
          <section className="personal-ax-report-prompts">
            <h4>미드저니 프롬프트</h4>
            <ol>{prompts.map((prompt) => <li key={prompt}><code>{prompt}</code></li>)}</ol>
          </section>
        ) : null}
      </article>
    </div>
  )
}
