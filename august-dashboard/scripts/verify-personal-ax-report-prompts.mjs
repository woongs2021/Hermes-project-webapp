import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { personalAxReports } from '../src/personalAxReportData.ts'
import { getReportPrompts } from '../src/personalAxReportPrompts.ts'

const panelPath = fileURLToPath(new URL('../src/PersonalAxReportPanel.tsx', import.meta.url))
const dataPath = fileURLToPath(new URL('../src/personalAxReportData.ts', import.meta.url))
const [panelSource, dataSource] = await Promise.all([readFile(panelPath, 'utf8'), readFile(dataPath, 'utf8')])

assert.ok(personalAxReports.length > 0, 'expected at least one current report')
for (const report of personalAxReports) {
  assert.equal(getReportPrompts(report).length, 0, `current report ${report.id} must not expose prompts`)
}
assert.ok(!/\bprompts\s*:/.test(dataSource), 'current report data must not retain prompt records')
assert.match(dataSource, /Optional additive content for newly added reports; current reports omit it\. \*\/\s+prompts\?: string\[\]/, 'report type must document optional future prompt content')
assert.match(panelSource, /const reportClone = cloneReportForExport\(reportElement\)/, 'HTML download must serialize the rendered report clone so future optional sections are included automatically')
assert.match(panelSource, /\{prompts\.length > 0 \? \(/, 'UI must conditionally render optional prompt content into the captured report')
assert.match(panelSource, /clone\.querySelectorAll<HTMLDetailsElement>\('details\.personal-ax-report-more'\)/, 'HTML export clone must include every deep-reading disclosure in its open state')
assert.doesNotMatch(panelSource, /renderReportPromptHtmlSection/, 'HTML export must not rebuild a partial report from selected data fields')

console.log(`Personal AX report export contract valid: ${personalAxReports.length} reports retain optional sections through rendered-article cloning.`)
