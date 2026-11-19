import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { personalAxReports } from '../src/personalAxReportData.ts'

function assert(condition, message) {
  if (!condition) throw new Error(`Designer AI timeline verification failed: ${message}`)
}

const sourcePath = (relativePath) => fileURLToPath(new URL(relativePath, import.meta.url))
const panelSource = readFileSync(sourcePath('../src/PersonalAxReportPanel.tsx'), 'utf8')
const cssSource = readFileSync(sourcePath('../src/App.css'), 'utf8')
const report = personalAxReports.find((item) => item.id === 'designer-ai-exposure')
assert(report, 'designer-ai-exposure report must exist')
assert(report.marketTimeline, 'report must provide a marketTimeline')

const { marketTimeline } = report
assert(marketTimeline.label === '해석적 노출·시장변화 신호', 'timeline label must distinguish interpretation from official market data')
assert(marketTimeline.caveat.includes('공식 시장규모') && marketTimeline.caveat.includes('고용규모') && marketTimeline.caveat.includes('감원율'), 'timeline caveat must exclude market size, employment size, and layoff rate')
assert(marketTimeline.xAxis.includes('달력 연도') && marketTimeline.xAxis.includes('2020–2026'), 'X axis must identify calendar year / observation timeframe from 2020 through 2026')
assert(marketTimeline.xAxis.includes('2026년은 아직 끝나지 않은'), 'X axis must mark 2026 as the incomplete current observation period')
assert(marketTimeline.yAxis.includes('해석적') && marketTimeline.yAxis.includes('시장 규모·고용 규모·감원율이 아니다'), 'Y axis must remain interpretive and not a market/employment/layoff metric')
assert(marketTimeline.years.length === 7, 'timeline must include seven years')
assert(marketTimeline.years.map((year) => year.year).join(',') === '2020,2021,2022,2023,2024,2025,2026', 'timeline years must run from 2020 through 2026 without gaps')
assert(marketTimeline.lenses.length === 3, 'timeline must provide exactly three market lenses')
assert(marketTimeline.lenses.map((lens) => lens.id).join(',') === 'freelance-platform,startup,enterprise', 'timeline lenses must be freelance/platform, startup, and enterprise')

for (const lens of marketTimeline.lenses) {
  assert(lens.points.length === marketTimeline.years.length, `${lens.id} must provide one point per year`)
  for (const point of lens.points) {
    assert(Number.isInteger(point.signal) && point.signal >= 1 && point.signal <= 5, `${lens.id} signal must stay in the interpretive 1–5 range`)
  }
}

for (const year of marketTimeline.years) {
  assert(year.detail.length > 0, `${year.year} needs selected-year detail copy`)
  assert(year.sourceNotes.length > 0, `${year.year} needs source or caveat copy`)
}

assert(panelSource.includes('designer-ai-timeline-axes') && panelSource.includes('aria-label="타임라인 축 설명"'), 'both axis explanations must be present in accessible DOM')
assert(panelSource.includes('designer-ai-timeline-x-axis-label') && panelSource.includes('designer-ai-timeline-y-axis-label'), 'both axis explanations must be visibly labelled in the SVG chart')
assert(panelSource.includes('designer-ai-timeline-area') && panelSource.includes('areaPath('), 'chart must render filled SVG area paths')
assert(panelSource.includes('designer-ai-timeline-line') && panelSource.includes('linePath('), 'chart must render separate SVG stroke paths')
assert(cssSource.includes('.designer-ai-timeline-chart .designer-ai-timeline-area { stroke: none; fill-opacity: 0.6; }'), 'area fills must use actual 0.6 opacity')
assert(cssSource.includes('stroke-opacity: 1') && cssSource.includes('fill-opacity: 1'), 'strokes and dots must remain fully opaque')
assert(/<details className="personal-ax-report-more" open><summary>더 깊이 읽기<\/summary>/.test(panelSource), 'all rendered 더 깊이 읽기 details must be open by default and retain a summary control')
assert(personalAxReports.some((item) => item.sections.some((section) => section.paragraphs.length > 2)), 'reports must contain expandable deep-reading content to exercise the default-open contract')

console.log('Designer AI timeline verified: 2020–2026 axes, interpretive boundary, 60% filled areas, opaque strokes/dots, and default-open deep-reading controls.')
