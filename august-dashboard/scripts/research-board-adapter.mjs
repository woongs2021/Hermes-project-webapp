import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { mkdirSync } from 'node:fs'

export const researchInputPath = '/opt/data/agent-team-work-log/paper-candidates/all-research-items.jsonl'
export const weeklySelectedPath = '/opt/data/agent-team-work-log/paper-candidates/weekly-selected-papers.md'
export const researchOutputPath = resolve('public/data/research-board.json')
export const researchSchemaPath = resolve('schemas/research-board.schema.json')
export const researchSourcePolicy = 'public-safe research board manifest only; exposes chronological paper metadata, safe summaries, source links, lane labels, and validation/caution text; excludes raw logs, credentials, private IDs, local source paths, and hidden prompts'

const allowedLanes = new Set(['yuna', 'goyounjung'])
const allowedRootKeys = new Set(['version', 'generatedAt', 'sourcePolicy', 'status', 'items'])
const allowedItemKeys = new Set([
  'id',
  'dateKst',
  'isoWeek',
  'lane',
  'owner',
  'title',
  'thumbnailLabel',
  'sourceVenue',
  'sourceAccess',
  'sourceUrlOrId',
  'publicationDate',
  'summary',
  'chrisRelevance',
  'koreanSourceStatus',
  'score',
  'duplicateSignal',
  'status',
  'validationStatus',
  'publicSafe',
])

const suspiciousSecretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /password\s*[:=]\s*['"]?[^'"\s]{8,}/i,
  /secret\s*[:=]\s*['"]?[^'"\s]{8,}/i,
  /token\s*[:=]\s*['"]?[^'"\s]{12,}/i,
  /\/opt\/data\//,
  /chat_id/i,
  /message_id/i,
]

export function fail(message) {
  throw new Error(`research board validation failed: ${message}`)
}

function nonEmpty(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`)
  }
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/sk-/g, 's-k-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

function thumbnailLabel(item) {
  const lanePrefix = item.lane === 'yuna' ? 'YU' : 'GJ'
  const week = normalizeIsoWeek(item.iso_week)?.replace(/^\d{4}-W/, 'W') ?? 'W??'
  return `${lanePrefix}-${week}`
}

function normalizeIsoWeek(value = '') {
  return value.replace(/^(\d{4})-(\d{2})$/, '$1-W$2')
}

function isoWeekFromDate(dateString = '') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return undefined

  const date = new Date(`${dateString}T00:00:00Z`)
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function normalizeComparableTitle(text = '') {
  return text
    .toLowerCase()
    .replace(/[“”"'`’]/g, '')
    .replace(/[^a-z0-9가-힣]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim()
}

function normalizedSourceTitle(item) {
  const directTitle = firstNonEmpty(item.title)
  if (directTitle) return directTitle

  const koreanTitle = firstNonEmpty(item.korean_title, item.title_ko)
  const originalTitle = firstNonEmpty(item.original_title)

  if (koreanTitle && originalTitle && koreanTitle !== originalTitle) return `${koreanTitle} / ${originalTitle}`
  return koreanTitle ?? originalTitle
}

function publicationDateFromSource(item) {
  const directDate = firstNonEmpty(item.publication_date)
  if (directDate) return directDate

  const sourceVenueDate = firstNonEmpty(item.source_venue_date)
  const dateMatch = sourceVenueDate?.match(/\b\d{4}-\d{2}-\d{2}\b/)
  if (dateMatch) return dateMatch[0]

  return firstNonEmpty(item.date_kst, item.date)
}

function koreanSourceStatusFromSource(item) {
  const directStatus = firstNonEmpty(item.korean_source_status)
  if (directStatus) return directStatus

  const category = firstNonEmpty(item.category)
  if (/korea|korean|한국/i.test(category ?? '')) return `yes; ${category} source signal`
  return `no; ${category ?? 'global/non-Korean'} source signal`
}

function readWeeklySelectedIndex(path = weeklySelectedPath) {
  if (!existsSync(path)) return new Map()

  const text = readFileSync(path, 'utf8')
  const lines = text.split('\n')
  const selected = new Map()

  for (const [index, line] of lines.entries()) {
    const titleMatch = line.match(/^####\s+\d+\)\s+(.+)$/) ?? line.match(/^####\s+(.+)$/) ?? line.match(/^(?:🧠|✨|🇰🇷|🎨|🧭|🔬)+\s+\*\*(.+)\*\*$/u)
    if (!titleMatch) continue

    const title = titleMatch[1].trim()
    const window = lines.slice(index + 1, index + 9).join(' ')
    const statusMatch = window.match(/Muyeol status(?:\/caution)?:\s*([A-Z]+)/i)
    selected.set(normalizeComparableTitle(title), statusMatch?.[1]?.toUpperCase() ?? 'WATCH')
  }

  return selected
}

export function readResearchSource(path = researchInputPath) {
  const text = readFileSync(path, 'utf8')
  const records = []

  for (const [lineIndex, line] of text.split('\n').entries()) {
    if (!line.trim()) continue
    try {
      records.push(JSON.parse(line))
    } catch (error) {
      fail(`invalid JSONL at line ${lineIndex + 1}: ${error.message}`)
    }
  }

  if (records.length === 0) fail('source JSONL must contain at least one item')
  return records
}

function normalizeResearchItem(item, index, selectedIndex = new Map()) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) fail(`source item[${index}] must be an object`)

  const lane = item.lane ?? item.owner ?? item.agent
  if (!allowedLanes.has(lane)) fail(`source item[${index}].lane is not allowed: ${lane}`)

  const normalized = {
    dateKst: firstNonEmpty(item.date_kst, item.date),
    isoWeek: firstNonEmpty(item.iso_week) ?? isoWeekFromDate(firstNonEmpty(item.date_kst, item.date)),
    title: normalizedSourceTitle(item),
    urlOrId: firstNonEmpty(item.url_or_id, item.url_or_stable_id),
    sourceVenue: firstNonEmpty(item.source_venue, item.source_venue_date),
    publicationDate: publicationDateFromSource(item),
    summary: firstNonEmpty(item.core_claim, item.one_line_core_claim),
    chrisRelevance: firstNonEmpty(item.chris_relevance, item.one_line_chris_relevance),
    koreanSourceStatus: koreanSourceStatusFromSource(item),
    sourceAccess: firstNonEmpty(item.source_access, item.source_access_confidence),
    duplicateSignal: firstNonEmpty(item.duplicate_repeat_signal, item.duplicate_key, item.muyeol_validation_note) ?? 'new; no duplicate signal specified in normalized source',
  }

  for (const [field, value] of Object.entries(normalized)) {
    nonEmpty(value, `source item[${index}].${field}`)
  }

  const score = Number(item.initial_score_5 ?? 0)
  if (!Number.isFinite(score) || score < 0 || score > 5) fail(`source item[${index}].initial_score_5 must be 0-5`)

  const selectedStatus = selectedIndex.get(normalizeComparableTitle(normalized.title))

  return {
    id: `${normalized.dateKst}-${lane}-${slugify(normalized.title) || index}`,
    dateKst: normalized.dateKst,
    isoWeek: normalizeIsoWeek(normalized.isoWeek),
    lane,
    owner: lane,
    title: normalized.title,
    thumbnailLabel: thumbnailLabel({ ...item, lane }),
    sourceVenue: normalized.sourceVenue,
    sourceAccess: normalized.sourceAccess,
    sourceUrlOrId: normalized.urlOrId,
    publicationDate: normalized.publicationDate,
    summary: normalized.summary,
    chrisRelevance: normalized.chrisRelevance,
    koreanSourceStatus: normalized.koreanSourceStatus,
    score,
    duplicateSignal: normalized.duplicateSignal,
    status: selectedStatus ? 'friday_final_pick' : 'daily_candidate',
    validationStatus: selectedStatus ?? 'unreviewed',
    publicSafe: true,
  }
}

export function buildResearchBoardManifest(records, generatedAt = new Date().toISOString()) {
  const selectedIndex = readWeeklySelectedIndex()
  const items = records
    .filter((record) => allowedLanes.has(record.lane ?? record.owner))
    .map((record, index) => normalizeResearchItem(record, index, selectedIndex))
    .sort((left, right) => left.dateKst.localeCompare(right.dateKst) || left.lane.localeCompare(right.lane) || left.title.localeCompare(right.title))

  return validateResearchBoardManifest({
    version: 1,
    generatedAt,
    sourcePolicy: researchSourcePolicy,
    status: 'public_research_board_allowed',
    items,
  })
}

export function validateResearchBoardManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) fail('manifest root must be an object')

  for (const key of Object.keys(manifest)) {
    if (!allowedRootKeys.has(key)) fail(`manifest has unsupported key "${key}"`)
  }

  if (manifest.version !== 1) fail('manifest.version must be 1')
  if (typeof manifest.generatedAt !== 'string' || Number.isNaN(Date.parse(manifest.generatedAt))) fail('manifest.generatedAt must be ISO date-time')
  if (manifest.sourcePolicy !== researchSourcePolicy) fail('manifest.sourcePolicy does not match policy')
  if (manifest.status !== 'public_research_board_allowed') fail('manifest.status must be public_research_board_allowed')
  if (!Array.isArray(manifest.items) || manifest.items.length === 0) fail('manifest.items must be a non-empty array')

  const seenIds = new Set()
  for (const [index, item] of manifest.items.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail(`items[${index}] must be an object`)
    for (const key of Object.keys(item)) {
      if (!allowedItemKeys.has(key)) fail(`items[${index}] has unsupported key "${key}"`)
    }
    for (const field of ['id', 'dateKst', 'isoWeek', 'lane', 'owner', 'title', 'thumbnailLabel', 'sourceVenue', 'sourceAccess', 'sourceUrlOrId', 'publicationDate', 'summary', 'chrisRelevance', 'koreanSourceStatus', 'duplicateSignal']) {
      nonEmpty(item[field], `items[${index}].${field}`)
    }
    if (seenIds.has(item.id)) fail(`duplicate item id: ${item.id}`)
    seenIds.add(item.id)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.dateKst)) fail(`items[${index}].dateKst must be YYYY-MM-DD`)
    if (!/^\d{4}-W\d{2}$/.test(item.isoWeek)) fail(`items[${index}].isoWeek must be YYYY-Www`)
    if (!allowedLanes.has(item.lane) || item.owner !== item.lane) fail(`items[${index}].lane/owner mismatch`)
    if (typeof item.score !== 'number' || item.score < 0 || item.score > 5) fail(`items[${index}].score must be 0-5`)
    if (!['daily_candidate', 'friday_final_pick'].includes(item.status)) fail(`items[${index}].status is not allowed`)
    if (!['unreviewed', 'GO', 'WATCH', 'HOLD'].includes(item.validationStatus)) fail(`items[${index}].validationStatus is not allowed`)
    if (item.publicSafe !== true) fail(`items[${index}].publicSafe must be true`)

    const combined = JSON.stringify(item)
    for (const pattern of suspiciousSecretPatterns) {
      if (pattern.test(combined)) fail(`items[${index}] appears to expose private/source/secret-like text`)
    }
  }

  return manifest
}

export function validateResearchBoardManifestFile(path = researchOutputPath) {
  return validateResearchBoardManifest(JSON.parse(readFileSync(path, 'utf8')))
}

export function generateResearchBoardManifest({ checkOnly = false } = {}) {
  const manifest = buildResearchBoardManifest(readResearchSource())

  if (!checkOnly) {
    mkdirSync(dirname(researchOutputPath), { recursive: true })
    writeFileSync(researchOutputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  }

  return manifest
}

export function publicManifestStatus() {
  if (!existsSync(researchOutputPath)) return 'not-present'
  const manifest = validateResearchBoardManifestFile(researchOutputPath)
  return `valid items=${manifest.items.length}`
}
