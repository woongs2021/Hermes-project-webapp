import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const reportPath = fileURLToPath(new URL('../public/data/ax-weekly-report.json', import.meta.url))
const rootKeys = new Set(['version', 'publicSafe', 'status', 'week', 'generatedAt', 'sourcePolicy', 'cases'])
const caseKeys = new Set(['id', 'region', 'organization', 'titleKo', 'sourceTitle', 'sourceUrl', 'sourceName', 'sourceType', 'publishedAt', 'workflowKo', 'whatChangedKo', 'evidenceKo', 'implicationKo', 'claimBoundaryKo', 'publicSafe'])
const banned = [/(?:api[_-]?key|secret|token|authorization|bearer)/i, /\/opt\/data\//i, /(?:chat[_-]?id|telegram[_-]?id|slack[_-]?id)/i, /(?:prompt|cron|jobs\.json)/i]

function fail(message) {
  console.error(`AX weekly report validation failed: ${message}`)
  process.exit(1)
}

function onlyAllowed(object, allowed, location) {
  for (const key of Object.keys(object)) if (!allowed.has(key)) fail(`${location} has non-public key: ${key}`)
}

function requireText(value, field, location) {
  if (typeof value !== 'string' || value.trim().length < 2) fail(`${location}.${field} must be a non-empty string`)
  if (banned.some((pattern) => pattern.test(value))) fail(`${location}.${field} contains blocked private/internal text`)
}

const report = JSON.parse(await readFile(reportPath, 'utf8'))
if (!report || typeof report !== 'object' || Array.isArray(report)) fail('root must be an object')
onlyAllowed(report, rootKeys, 'root')
if (report.version !== 1 || report.publicSafe !== true) fail('root version/publicSafe mismatch')
if (!['awaiting_first_qualified_week', 'published'].includes(report.status)) fail('invalid status')
requireText(report.sourcePolicy, 'sourcePolicy', 'root')
if (!Array.isArray(report.cases)) fail('cases must be an array')

if (report.status === 'awaiting_first_qualified_week') {
  if (report.week !== null || report.generatedAt !== null || report.cases.length !== 0) fail('awaiting state must contain no release data')
  console.log('AX weekly report valid: awaiting first qualified week')
  process.exit(0)
}

if (!/^\d{4}-W\d{2}$/.test(report.week ?? '')) fail('published report needs ISO week')
if (!/^\d{4}-\d{2}-\d{2}T/.test(report.generatedAt ?? '')) fail('published report needs ISO timestamp')
if (report.cases.length < 2) fail('published report needs at least two cases')
const ids = new Set()
const urls = new Set()
const regions = new Set()
for (const [index, item] of report.cases.entries()) {
  const location = `cases[${index}]`
  if (!item || typeof item !== 'object' || Array.isArray(item)) fail(`${location} must be an object`)
  onlyAllowed(item, caseKeys, location)
  if (item.publicSafe !== true) fail(`${location}.publicSafe must be true`)
  if (!['Korea', 'Global'].includes(item.region)) fail(`${location}.region must be Korea or Global`)
  regions.add(item.region)
  for (const field of ['id', 'organization', 'titleKo', 'sourceTitle', 'sourceUrl', 'sourceName', 'sourceType', 'publishedAt', 'workflowKo', 'whatChangedKo', 'evidenceKo', 'implicationKo', 'claimBoundaryKo']) requireText(item[field], field, location)
  if (!/^https:\/\//.test(item.sourceUrl)) fail(`${location}.sourceUrl must use HTTPS`)
  if (ids.has(item.id) || urls.has(item.sourceUrl)) fail(`${location} duplicates a published case`)
  ids.add(item.id); urls.add(item.sourceUrl)
}
if (!regions.has('Korea') || !regions.has('Global')) fail('published report needs at least one Korea and one Global case')
console.log(`AX weekly report valid: ${report.week}, ${report.cases.length} public cases`)
