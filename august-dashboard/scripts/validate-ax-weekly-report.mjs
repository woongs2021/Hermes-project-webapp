import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const reportPath = fileURLToPath(new URL('../public/data/ax-weekly-report.json', import.meta.url))
const rootKeys = new Set(['version', 'publicSafe', 'status', 'sourcePolicy', 'releases'])
const releaseKeys = new Set(['week', 'generatedAt', 'cases'])
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

function isIsoWeek(value) {
  return /^\d{4}-W\d{2}$/.test(value)
}

function validTimestamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))
}

const report = JSON.parse(await readFile(reportPath, 'utf8'))
if (!report || typeof report !== 'object' || Array.isArray(report)) fail('root must be an object')
onlyAllowed(report, rootKeys, 'root')
if (report.version !== 2 || report.publicSafe !== true) fail('root version/publicSafe mismatch')
if (!['awaiting_first_qualified_week', 'published'].includes(report.status)) fail('invalid status')
requireText(report.sourcePolicy, 'sourcePolicy', 'root')
if (!Array.isArray(report.releases)) fail('releases must be an array')

if (report.status === 'awaiting_first_qualified_week') {
  if (report.releases.length !== 0) fail('awaiting state must contain no release data')
  console.log('AX weekly report valid: awaiting first qualified week')
  process.exit(0)
}

if (report.releases.length === 0) fail('published report needs at least one release')
const ids = new Set()
const urls = new Set()
const weeks = new Set()
let previousWeek = ''
let previousGeneratedAt = 0
let caseCount = 0

for (const [releaseIndex, release] of report.releases.entries()) {
  const location = `releases[${releaseIndex}]`
  if (!release || typeof release !== 'object' || Array.isArray(release)) fail(`${location} must be an object`)
  onlyAllowed(release, releaseKeys, location)
  if (!isIsoWeek(release.week)) fail(`${location}.week must be an ISO week`)
  if (weeks.has(release.week)) fail(`${location}.week duplicates a prior release`)
  if (previousWeek && release.week <= previousWeek) fail(`${location}.week must be later than the preceding release`)
  weeks.add(release.week)
  previousWeek = release.week
  if (!validTimestamp(release.generatedAt)) fail(`${location}.generatedAt must be an ISO timestamp`)
  const generatedAt = Date.parse(release.generatedAt)
  if (previousGeneratedAt && generatedAt <= previousGeneratedAt) fail(`${location}.generatedAt must be later than the preceding release`)
  previousGeneratedAt = generatedAt
  if (!Array.isArray(release.cases) || release.cases.length < 2) fail(`${location}.cases needs at least two cases`)

  const regions = new Set()
  for (const [caseIndex, item] of release.cases.entries()) {
    const caseLocation = `${location}.cases[${caseIndex}]`
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail(`${caseLocation} must be an object`)
    onlyAllowed(item, caseKeys, caseLocation)
    if (item.publicSafe !== true) fail(`${caseLocation}.publicSafe must be true`)
    if (!['Korea', 'Global'].includes(item.region)) fail(`${caseLocation}.region must be Korea or Global`)
    regions.add(item.region)
    for (const field of ['id', 'organization', 'titleKo', 'sourceTitle', 'sourceUrl', 'sourceName', 'sourceType', 'publishedAt', 'workflowKo', 'whatChangedKo', 'evidenceKo', 'implicationKo', 'claimBoundaryKo']) requireText(item[field], field, caseLocation)
    if (!/^https:\/\//.test(item.sourceUrl)) fail(`${caseLocation}.sourceUrl must use HTTPS`)
    if (ids.has(item.id) || urls.has(item.sourceUrl)) fail(`${caseLocation} duplicates a published case from this archive`)
    ids.add(item.id)
    urls.add(item.sourceUrl)
    caseCount += 1
  }
  if (!regions.has('Korea') || !regions.has('Global')) fail(`${location} needs at least one Korea and one Global case`)
}

console.log(`AX weekly report valid: ${report.releases.length} releases, ${caseCount} accumulated public cases`)
