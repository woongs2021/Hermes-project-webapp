import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { personalAxReports } from '../src/personalAxReportData.ts'

function assert(condition, message) {
  if (!condition) throw new Error(`Designer AI timeline verification failed: ${message}`)
}

const sourcePath = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url))
const dataSource = readFileSync(sourcePath('../src/personalAxReportData.ts'), 'utf8')
const panelSource = readFileSync(sourcePath('../src/PersonalAxReportPanel.tsx'), 'utf8')
const cssSource = readFileSync(sourcePath('../src/App.css'), 'utf8')
const report = personalAxReports.find((item) => item.id === 'designer-ai-exposure')
assert(report, 'designer-ai-exposure report must exist')
assert(report.marketTimeline, 'report must provide a marketTimeline')

const { marketTimeline } = report
assert(marketTimeline.label === 'AI 때문에 디자인 일이 바뀌는 정도', 'timeline label must use plain Korean')
assert(marketTimeline.caveat.includes('반복 제작·생산·조율') && marketTimeline.caveat.includes('공식 시장 규모·고용 규모·감원율 통계가 아니며') && marketTimeline.caveat.includes('모든 디자인 일이 사라진다는 뜻도 아니다'), 'timeline caveat must plainly define the 1–5 guide and its limits')
assert(!dataSource.includes('해석적 노출·시장변화 신호'), 'the former difficult label must not remain in the user-facing data source')
assert(!panelSource.includes('해석적 노출·시장변화 신호'), 'the former difficult label must not remain in the chart renderer')
assert(marketTimeline.xAxis.includes('달력 연도') && marketTimeline.xAxis.includes('2020–2026'), 'X axis must identify calendar year / observation timeframe from 2020 through 2026')
assert(marketTimeline.xAxis.includes('2026년은 아직 끝나지 않은'), 'X axis must mark 2026 as the incomplete current observation period')
assert(marketTimeline.yAxis.includes('AI 때문에 디자인 일이 바뀌는 정도') && marketTimeline.yAxis.includes('시장 규모·고용 규모·감원율이 아니다'), 'Y axis must use the plain-language guide and exclude market/employment/layoff metrics')
assert(marketTimeline.years.length === 7, 'timeline must include seven years')
assert(marketTimeline.years.map((year) => year.year).join(',') === '2020,2021,2022,2023,2024,2025,2026', 'timeline years must run from 2020 through 2026 without gaps')
assert(marketTimeline.lenses.length === 3, 'timeline must provide exactly three market lenses')
assert(marketTimeline.lenses.map((lens) => lens.id).join(',') === 'freelance-platform,startup,enterprise', 'timeline lenses must be freelance/platform, startup, and enterprise')

for (const lens of marketTimeline.lenses) {
  assert(lens.points.length === marketTimeline.years.length, `${lens.id} must provide one point per year`)
  for (const point of lens.points) {
    assert(Number.isInteger(point.signal) && point.signal >= 1 && point.signal <= 5, `${lens.id} signal must stay in the interpretive 1–5 range`)
  }
  assert(lens.trendDetails.length === 3, `${lens.id} must provide exactly three detailed market-trend phases`)
  assert(lens.trendDetails.map((phase) => phase.period).join(',') === '2020–22,2023–24,2025–26', `${lens.id} detail phases must cover 2020–22, 2023–24, and 2025–26`)
  for (const phase of lens.trendDetails) {
    assert(phase.title.length > 0 && phase.demandAndWorkModel.length > 0 && phase.automationAndHumanJudgment.length > 0 && phase.watchNext.length > 0, `${lens.id} ${phase.period} must cover work model, automation/human judgment, and what to watch`)
  }
}

for (const year of marketTimeline.years) {
  assert(year.detail.length > 0, `${year.year} needs selected-year detail copy`)
  assert(year.sourceNotes.length > 0, `${year.year} needs source or caveat copy`)
}

assert(panelSource.includes('designer-ai-timeline-axes') && panelSource.includes('aria-label="타임라인 축 설명"'), 'both axis explanations must be present in accessible DOM')
assert(panelSource.includes('designer-ai-market-trends') && panelSource.includes('trendDetails.map') && panelSource.includes('수요·일하는 방식') && panelSource.includes('더 빨라지는 일 / 사람의 판단') && panelSource.includes('다음에 볼 점'), 'renderer must expose detailed three-part market narratives after the timeline')
assert(cssSource.includes('.designer-ai-market-trend-phases { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr));') && cssSource.includes('.designer-ai-market-trend-phases { grid-template-columns: 1fr; gap: 10px; }'), 'market detail section must provide calm desktop and mobile layouts')
assert(panelSource.includes('designer-ai-timeline-x-axis-label') && panelSource.includes('designer-ai-timeline-y-axis-label'), 'both axis explanations must be visibly labelled in the SVG chart')
assert(panelSource.includes('designer-ai-timeline-area') && panelSource.includes('areaPath('), 'chart must render filled SVG area paths')
assert(panelSource.includes('designer-ai-timeline-line') && panelSource.includes('linePath('), 'chart must render separate SVG stroke paths')
assert(cssSource.includes('.designer-ai-timeline-chart .designer-ai-timeline-area { stroke: none; fill-opacity: 0.6; }'), 'area fills must use actual 0.6 opacity')
assert(cssSource.includes('stroke-opacity: 1') && cssSource.includes('fill-opacity: 1'), 'strokes and dots must remain fully opaque')
assert(/<details className="personal-ax-report-more" open><summary>더 깊이 읽기<\/summary>/.test(panelSource), 'all rendered 더 깊이 읽기 details must be open by default and retain a summary control')
assert(personalAxReports.some((item) => item.sections.some((section) => section.paragraphs.length > 2)), 'reports must contain expandable deep-reading content to exercise the default-open contract')

console.log('Designer AI timeline verified: 2020–2026 axes, plain-language 1–5 guide and caveat, three detailed market lanes, 60% filled areas, opaque strokes/dots, and default-open deep-reading controls.')
