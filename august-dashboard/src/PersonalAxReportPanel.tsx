import { useState } from 'react'
import { personalAxReports, type PersonalAxReport } from './personalAxReportData'

type DownloadStatus = 'idle' | 'downloaded' | 'error'

const highlightPhrases = [
  '실행 전 계획 공개, 실행 중 권한 확인, 실행 후 회복 가능성',
  '사용자가 결정권을 잃지 않았다고 느끼는 반복 경험',
  '판단·평가·독창성을 함께 다루는 디자인 역량',
  '좋은 질문·평가·수정이 반복될 조건',
  '통제 가능한 운영 품질',
  '권한 설계, 상호작용 순서, 조직의 평가 체계',
  '주의, 해석, 신뢰, 행동의 연쇄',
  '구매 전·사용 중·사용 후의 행동',
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
  const sections = report.sections.map((section) => `
    <section>
      <h2>${escapeHtml(section.heading)}</h2>
      ${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('')}
      ${section.bullets ? `<ul>${section.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}</ul>` : ''}
    </section>`).join('')
  const sources = report.sources.map((source) => `<li><a href="${escapeHtml(source.href)}">${escapeHtml(source.title)}</a> <small>${source.access}</small></li>`).join('')
  const prompts = report.prompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join('')

  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(report.title)}</title><style>body{max-width:760px;margin:56px auto;padding:0 24px;color:#17233a;background:#fcfbf8;font:16px/1.8 system-ui,sans-serif}small{color:#60708a}h1{font-size:34px;line-height:1.28}h2{margin-top:44px;font-size:21px}a{color:#315f97}li{margin:8px 0}.eyebrow{text-transform:uppercase;letter-spacing:.09em;font-size:12px}</style></head><body><p class="eyebrow">${escapeHtml(report.eyebrow)}</p><h1>${escapeHtml(report.title)}</h1><p>${escapeHtml(report.dek)}</p>${sections}<section><h2>References</h2><ul>${sources}</ul></section><section><h2>Midjourney prompt placeholders</h2><ul>${prompts}</ul></section></body></html>`
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
          <p className="card-kicker">Visual direction only</p>
          <h4>Midjourney 프롬프트 자리표시자</h4>
          <p>이미지는 생성하지 않았습니다. 아래 문장은 이후 시각 실험을 위한 공개 가능한 자리표시자입니다.</p>
          <ol>{report.prompts.map((prompt) => <li key={prompt}><code>{prompt}</code></li>)}</ol>
        </section>
      </article>
    </div>
  )
}
