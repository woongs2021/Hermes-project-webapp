import { useState } from 'react'
import { personalAxReports, type PersonalAxReport } from './personalAxReportData'

type DownloadStatus = 'idle' | 'downloaded' | 'error'

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
    </section>`).join('')
  const sources = report.sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.title)}</a> <small>${source.access}</small></li>`).join('')
  const prompts = report.prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('')

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(report.title)}</title><style>body{max-width:760px;margin:56px auto;padding:0 24px;color:#17233a;background:#fcfbf8;font:16px/1.8 system-ui,sans-serif}small{color:#60708a}h1{font-size:34px;line-height:1.28}h2{margin-top:44px;font-size:21px}section>p{text-indent:1em}a{color:#315f97}li{margin:8px 0}.eyebrow{text-transform:uppercase;letter-spacing:.09em;font-size:12px}</style></head><body><p class="eyebrow">${escapeHtml(report.eyebrow)}</p><img src="${escapeHtml(heroUrl)}" alt="${escapeHtml(report.heroAlt)}" style="width:100%;border-radius:16px;display:block;margin:0 0 28px"><h1>${escapeHtml(report.title)}</h1><p>${escapeHtml(report.dek)}</p>${sections}<section><h2>인용 레퍼런스</h2><ul>${sources}</ul></section><section><h2>미드저니 프롬프트</h2><ul>${prompts}</ul></section></body></html>`
}

export function PersonalAxReportPanel() {
  const [activeId, setActiveId] = useState(personalAxReports[0].id)
  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('idle')
  const report = personalAxReports.find((item) => item.id === activeId) ?? personalAxReports[0]

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
      setDownloadStatus('downloaded')
    } catch {
      setDownloadStatus('error')
    }
  }

  return (
    <div className="personal-ax-report-shell" aria-label="Personal AX October 2026 reports">
      <div className="personal-ax-report-controls">
        <nav className="personal-ax-report-tabs" aria-label="Personal AX report categories">
          {personalAxReports.map((item) => (
            <button key={item.id} type="button" className={item.id === report.id ? 'active' : ''} aria-pressed={item.id === report.id} onClick={() => { setActiveId(item.id); setDownloadStatus('idle') }}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="personal-ax-report-actions">
          <button type="button" onClick={downloadHtml}>HTML 다운로드</button>
          <button type="button" onClick={() => window.print()}>인쇄 / PDF 저장</button>
        </div>
      </div>
      <p className="personal-ax-download-status" aria-live="polite">{downloadStatus === 'downloaded' ? 'HTML 파일을 준비했습니다.' : downloadStatus === 'error' ? '브라우저에서 HTML 파일을 만들지 못했습니다. 인쇄 / PDF 저장을 사용해 주세요.' : '브라우저에서만 파일을 생성하며, 서버로 내용을 전송하지 않습니다.'}</p>

      <article className="personal-ax-report-article" id="personal-ax-report-print">
        <header>
          <figure className="personal-ax-report-hero">
            <img src={`${import.meta.env.BASE_URL}${report.heroImage}`} alt={report.heroAlt} />
          </figure>
          <p className="card-kicker">{report.eyebrow}</p>
          <h3>{report.title}</h3>
          <p className="personal-ax-report-dek">{report.dek}</p>
          <p className="personal-ax-report-byline">아래 글은 각 레퍼런스의 공개 초록·메타데이터 또는 원문에서 확인한 연구 대상, 방법, 핵심 주장과 적용 한계를 구분해 정리했습니다.</p>
          <p className="personal-ax-report-note">연구의 결과를 모든 제품·조직에 대한 효과로 일반화하지 않으며, 본문에서 연구 범위와 해석의 경계를 함께 표시합니다.</p>
        </header>

        {report.sections.map((section) => (
          <section className="personal-ax-report-section" key={section.heading}>
            <h4>{section.heading}</h4>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{highlightText(paragraph)}</p>)}
            {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{highlightText(bullet)}</li>)}</ul> : null}
          </section>
        ))}

        <section className="personal-ax-report-sources">
          <p className="card-kicker">Cited references</p>
          <h4>인용 레퍼런스와 확인 범위</h4>
          <ul>{report.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noreferrer">{source.title}</a><span>{source.access}</span></li>)}</ul>
        </section>

        <section className="personal-ax-report-prompts">
          <h4>미드저니 프롬프트</h4>
          <ol>{report.prompts.map((prompt) => <li key={prompt}><code>{prompt}</code></li>)}</ol>
        </section>
      </article>
    </div>
  )
}
