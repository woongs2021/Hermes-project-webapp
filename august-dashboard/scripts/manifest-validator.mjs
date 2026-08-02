import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const inputPath = resolve('../august-dashboard-safe-sources/dashboard-documents.json')
export const outputPath = resolve('public/data/dashboard-manifest.json')
export const schemaPath = resolve('schemas/dashboard-manifest.schema.json')

export const sourcePolicy = 'public-safe generated manifest only; no raw DM, credentials, OAuth/API keys, private IDs, or private source text'

const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
const documentSchema = schema.$defs.publicSafeDocument

const allowedSections = new Set(documentSchema.properties.section.enum)
const allowedFormats = new Set(documentSchema.properties.format.enum)
const requiredDocumentFields = documentSchema.required
const allowedDocumentKeys = new Set(Object.keys(documentSchema.properties))
const requiredManifestFields = schema.required
const allowedManifestKeys = new Set(Object.keys(schema.properties))

const suspiciousSecretPatterns = [
  /sk-[A-Za-z0-9_-]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /password\s*[:=]\s*['"]?[^'"\s]{8,}/i,
  /secret\s*[:=]\s*['"]?[^'"\s]{8,}/i,
  /token\s*[:=]\s*['"]?[^'"\s]{12,}/i,
]

export function fail(message) {
  throw new Error(`manifest validation failed: ${message}`)
}

export function readJsonFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

export function readSourceDocuments(path = inputPath) {
  const parsed = readJsonFile(path)

  if (!Array.isArray(parsed)) {
    fail('safe source root must be an array')
  }

  return parsed
}

export function validateDocument(document, index, seenPaths = new Set()) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    fail(`document[${index}] must be an object`)
  }

  for (const key of Object.keys(document)) {
    if (!allowedDocumentKeys.has(key)) {
      fail(`document[${index}] has unsupported key "${key}"`)
    }
  }

  for (const field of requiredDocumentFields) {
    if (!Object.hasOwn(document, field)) {
      fail(`document[${index}].${field} is required`)
    }
  }

  for (const field of ['path', 'title', 'section', 'format', 'summary', 'bodyPreview']) {
    if (typeof document[field] !== 'string' || document[field].trim().length === 0) {
      fail(`document[${index}].${field} must be a non-empty string`)
    }
  }

  if (document.publicSafe !== true) {
    fail(`document[${index}].publicSafe must be true`)
  }

  if (!document.path.startsWith('/data/')) {
    fail(`document[${index}].path must start with /data/`)
  }

  if (!allowedSections.has(document.section)) {
    fail(`document[${index}].section is not allowed: ${document.section}`)
  }

  if (!allowedFormats.has(document.format)) {
    fail(`document[${index}].format is not allowed: ${document.format}`)
  }

  if (document.format === 'markdown' && !document.path.endsWith('.md')) {
    fail(`document[${index}] markdown path must end with .md`)
  }

  if (document.format === 'json' && !document.path.endsWith('.json')) {
    fail(`document[${index}] json path must end with .json`)
  }

  if (seenPaths.has(document.path)) {
    fail(`duplicate document path: ${document.path}`)
  }
  seenPaths.add(document.path)

  const combinedText = `${document.path}\n${document.title}\n${document.summary}\n${document.bodyPreview}`
  for (const pattern of suspiciousSecretPatterns) {
    if (pattern.test(combinedText)) {
      fail(`document[${index}] appears to contain a secret-like value`)
    }
  }

  return {
    path: document.path,
    title: document.title,
    section: document.section,
    format: document.format,
    publicSafe: true,
    summary: document.summary,
    bodyPreview: document.bodyPreview,
  }
}

export function validateDocuments(documents) {
  if (!Array.isArray(documents)) {
    fail('documents must be an array')
  }

  const seenPaths = new Set()
  const validatedDocuments = documents.map((document, index) => validateDocument(document, index, seenPaths))

  if (validatedDocuments.length === 0) {
    fail('at least one public-safe document is required')
  }

  return validatedDocuments
}

export function buildManifest(sourceDocuments, generatedAt = new Date().toISOString()) {
  return {
    version: schema.properties.version.const,
    generatedAt,
    sourcePolicy,
    documents: validateDocuments(sourceDocuments),
  }
}

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    fail('manifest root must be an object')
  }

  for (const key of Object.keys(manifest)) {
    if (!allowedManifestKeys.has(key)) {
      fail(`manifest has unsupported key "${key}"`)
    }
  }

  for (const field of requiredManifestFields) {
    if (!Object.hasOwn(manifest, field)) {
      fail(`manifest.${field} is required`)
    }
  }

  if (manifest.version !== schema.properties.version.const) {
    fail(`manifest.version must be ${schema.properties.version.const}`)
  }

  if (manifest.sourcePolicy !== sourcePolicy) {
    fail('manifest.sourcePolicy does not match public-safe policy')
  }

  if (typeof manifest.generatedAt !== 'string' || Number.isNaN(Date.parse(manifest.generatedAt))) {
    fail('manifest.generatedAt must be an ISO date-time string')
  }

  return {
    ...manifest,
    documents: validateDocuments(manifest.documents),
  }
}

export function validateSourceFile(path = inputPath) {
  return validateDocuments(readSourceDocuments(path))
}

export function validateManifestFile(path = outputPath) {
  return validateManifest(readJsonFile(path))
}
