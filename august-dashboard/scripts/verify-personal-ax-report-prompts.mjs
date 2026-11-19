import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { personalAxReports } from '../src/personalAxReportData.ts'
import { getReportPrompts, renderReportPromptHtmlSection } from '../src/personalAxReportPrompts.ts'

const panelPath = fileURLToPath(new URL('../src/PersonalAxReportPanel.tsx', import.meta.url))
const dataPath = fileURLToPath(new URL('../src/personalAxReportData.ts', import.meta.url))
const [panelSource, dataSource] = await Promise.all([readFile(panelPath, 'utf8'), readFile(dataPath, 'utf8')])

assert.ok(personalAxReports.length > 0, 'expected at least one current report')
for (const report of personalAxReports) {
  assert.equal(getReportPrompts(report).length, 0, `current report ${report.id} must not expose prompts`)
}
assert.ok(!/\bprompts\s*:/.test(dataSource), 'current report data must not retain prompt records')
assert.match(dataSource, /Optional additive content for newly added reports; current reports omit it\. \*\/\s+prompts\?: string\[\]/, 'report type must document optional future prompt content')
assert.match(panelSource, /const prompts = getReportPrompts\(report\)/, 'UI must safely normalize optional prompts')
assert.match(panelSource, /\{prompts\.length > 0 \? \(/, 'UI must conditionally render the prompt section')
assert.match(panelSource, /renderReportPromptHtmlSection\(report, escapeHtml\)/, 'HTML download must use conditional prompt rendering')

const escapeHtml = (value) => value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character])
const absentSection = renderReportPromptHtmlSection({}, escapeHtml)
assert.equal(absentSection, '', 'empty prompts must omit the downloaded HTML section')

const futurePrompt = 'Future <Midjourney> prompt'
const presentSection = renderReportPromptHtmlSection({ prompts: [futurePrompt] }, escapeHtml)
assert.match(presentSection, /미드저니 프롬프트/, 'a future report prompt must create an HTML heading')
assert.match(presentSection, /Future &lt;Midjourney&gt; prompt/, 'a future report prompt must render escaped HTML content')

console.log(`Personal AX report prompt contract valid: ${personalAxReports.length} current reports omit prompts; future prompt sections render conditionally.`)
