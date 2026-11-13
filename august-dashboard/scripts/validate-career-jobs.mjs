import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const manifestPath = resolve(process.argv[2] ?? 'public/data/career-jobs.json')
const allowedRootKeys = new Set(['version', 'generatedAt', 'sourcePolicy', 'jobs', 'watchlists', 'evidenceLimit'])
const allowedJobKeys = new Set(['id', 'companyOrInstitution', 'category', 'title', 'location', 'status', 'fit', 'checkedAt', 'verificationState', 'canonicalUrl', 'sourceEvidence', 'publishedSalaryText', 'deadline', 'eligibility', 'workMode'])
const allowedWatchlistKeys = new Set(['name', 'result', 'sourceUrl', 'checkedAt', 'verificationState', 'verificationNote'])
const categories = new Set(['faculty', 'corporate_design', 'ai_ax_education'])
const statuses = new Set(['NEW', 'UPDATED', 'ACTIVE', 'CLOSED', 'UNVERIFIED'])
const verificationStates = new Set(['verified_detail', 'official_index_only', 'fetch_blocked', 'ambiguous'])
const fitValues = new Set(['high', 'medium', 'low'])
const watchResults = new Set(['open matching role', 'no matching official posting found', 'UNVERIFIED'])
const secretPatterns = [/sk-[A-Za-z0-9_-]{20,}/i, /xox[baprs]-[A-Za-z0-9-]{20,}/i, /gh[pousr]_[A-Za-z0-9_]{20,}/i, /AIza[0-9A-Za-z_-]{20,}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /bearer\s+[A-Za-z0-9._-]{20,}/i, /(?:password|secret|token)\s*[:=]\s*['"]?[^'"\s]{8,}/i]
const localPathPattern = /(?:^|[\s"'])\/?(?:opt|home|tmp|var|private)\/(?:[^\s"']+)/i

function fail(message) {
  throw new Error(`career jobs validation failed: ${message}`)
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object`)
}

function assertAllowedKeys(value, allowed, label) {
  for (const key of Object.keys(value)) if (!allowed.has(key)) fail(`${label} has unsupported key "${key}"`)
}

function assertRequiredStrings(value, fields, label) {
  for (const field of fields) {
    if (typeof value[field] !== 'string' || value[field].trim() === '') fail(`${label}.${field} must be a non-empty string`)
  }
}

function assertHttps(value, label) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') fail(`${label} must use HTTPS`)
  } catch {
    fail(`${label} must be a valid HTTPS URL`)
  }
}

function assertIso(value, label) {
  if (Number.isNaN(Date.parse(value)) || !/^\d{4}-\d{2}-\d{2}T/.test(value)) fail(`${label} must be an ISO timestamp`)
}

function assertPublicSafe(value, label) {
  const text = JSON.stringify(value)
  if (localPathPattern.test(text)) fail(`${label} contains a local path`)
  if (secretPatterns.some((pattern) => pattern.test(text))) fail(`${label} contains a secret-like value`)
}

function validateJob(job, index, ids) {
  const label = `jobs[${index}]`
  assertObject(job, label)
  assertAllowedKeys(job, allowedJobKeys, label)
  assertRequiredStrings(job, [...allowedJobKeys], label)
  assertPublicSafe(job, label)
  if (ids.has(job.id)) fail(`${label}.id is duplicated`)
  ids.add(job.id)
  if (!categories.has(job.category)) fail(`${label}.category is invalid`)
  if (!statuses.has(job.status)) fail(`${label}.status is invalid`)
  if (!fitValues.has(job.fit)) fail(`${label}.fit is invalid`)
  if (job.verificationState !== 'verified_detail') fail(`${label} must be verified_detail`)
  if (job.status !== 'ACTIVE') fail(`${label} must be ACTIVE`)
  assertIso(job.checkedAt, `${label}.checkedAt`)
  assertHttps(job.canonicalUrl, `${label}.canonicalUrl`)
  if (job.sourceEvidence.trim().length < 12) fail(`${label}.sourceEvidence is missing or too short`)
  for (const field of ['publishedSalaryText', 'deadline']) if (job[field] !== '공고 미공개') fail(`${label}.${field} must be 공고 미공개 when not officially published`)
  for (const field of ['eligibility', 'workMode']) if (job[field] !== '확인 필요') fail(`${label}.${field} must be 확인 필요 when not role-level verified`)
}

function validateWatchlistItem(item, index, group) {
  const label = `watchlists.${group}[${index}]`
  assertObject(item, label)
  assertAllowedKeys(item, allowedWatchlistKeys, label)
  assertRequiredStrings(item, [...allowedWatchlistKeys], label)
  assertPublicSafe(item, label)
  if (!watchResults.has(item.result)) fail(`${label}.result is invalid`)
  if (!verificationStates.has(item.verificationState)) fail(`${label}.verificationState is invalid`)
  assertIso(item.checkedAt, `${label}.checkedAt`)
  assertHttps(item.sourceUrl, `${label}.sourceUrl`)
  if (item.result === 'open matching role' && item.verificationState !== 'verified_detail') fail(`${label} open matching role must be verified_detail`)
  if (item.result === 'UNVERIFIED' && item.verificationState === 'verified_detail') fail(`${label} UNVERIFIED cannot be verified_detail`)
}

function validateManifest(manifest) {
  assertObject(manifest, 'manifest')
  assertAllowedKeys(manifest, allowedRootKeys, 'manifest')
  assertRequiredStrings(manifest, ['generatedAt', 'sourcePolicy', 'evidenceLimit'], 'manifest')
  assertPublicSafe(manifest, 'manifest')
  if (manifest.version !== 1) fail('manifest.version must be 1')
  assertIso(manifest.generatedAt, 'manifest.generatedAt')
  if (!Array.isArray(manifest.jobs) || manifest.jobs.length === 0) fail('manifest.jobs must be a non-empty array')
  const ids = new Set()
  manifest.jobs.forEach((job, index) => validateJob(job, index, ids))
  assertObject(manifest.watchlists, 'manifest.watchlists')
  assertAllowedKeys(manifest.watchlists, new Set(['priorityUniversities', 'globalCompanies']), 'manifest.watchlists')
  for (const group of ['priorityUniversities', 'globalCompanies']) {
    if (!Array.isArray(manifest.watchlists[group])) fail(`manifest.watchlists.${group} must be an array`)
    manifest.watchlists[group].forEach((item, index) => validateWatchlistItem(item, index, group))
  }
  if (manifest.watchlists.priorityUniversities.length !== 9) fail('manifest.watchlists.priorityUniversities must contain 9 items')
  if (manifest.watchlists.globalCompanies.length !== 13) fail('manifest.watchlists.globalCompanies must contain 13 items')
  if (manifest.jobs.some((job) => job.verificationState !== 'verified_detail')) fail('unverified role cannot appear as a job')
  return manifest
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
validateManifest(manifest)
console.log(`validated career jobs=${manifest.jobs.length} universities=${manifest.watchlists.priorityUniversities.length} globalCompanies=${manifest.watchlists.globalCompanies.length}`)
