import { personalAxReports } from '../src/personalAxReportData.ts'

function assert(condition, message) {
  if (!condition) throw new Error(`Designer AI timeline verification failed: ${message}`)
}

const report = personalAxReports.find((item) => item.id === 'designer-ai-exposure')
assert(report, 'designer-ai-exposure report must exist')
assert(report.marketTimeline, 'report must provide a marketTimeline')

const { marketTimeline } = report
assert(marketTimeline.label === '해석적 노출·시장변화 신호', 'timeline label must distinguish interpretation from official market data')
assert(marketTimeline.caveat.includes('공식 시장규모'), 'timeline caveat must state that this is not official market-size data')
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

console.log('Designer AI timeline verified: 2020–2026, 3 interpretive lenses, visible caveat contract.')
