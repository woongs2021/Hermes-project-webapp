import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const publicDataDir = resolve(import.meta.dirname, '../public/data')
const manifestNames = ['chris-archive.json', 'dna-archive.json', 'midjourney-dna-archive.json']
const prohibitedKeys = new Set([
  'sourceRun',
  'sourceCandidateRun',
  'localArchivePath',
  'localSelectedPath',
  'matchedGeneratedFile',
  'replacementOf',
  'remoteUrl',
  'entryPath',
  'assetPath',
])

function assertPublicSafe(value, location = '$') {
  if (typeof value === 'string') {
    if (value.includes('/opt/data/') || value.includes('file://')) {
      throw new Error(`local path found at ${location}`)
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertPublicSafe(entry, `${location}[${index}]`))
    return
  }

  if (value && typeof value === 'object') {
    for (const [key, entry] of Object.entries(value)) {
      if (prohibitedKeys.has(key)) {
        throw new Error(`internal field ${key} found at ${location}`)
      }
      assertPublicSafe(entry, `${location}.${key}`)
    }
  }
}

for (const name of manifestNames) {
  const manifestPath = resolve(publicDataDir, name)
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (!Array.isArray(manifest.items)) throw new Error(`${name} must contain items[]`)
  assertPublicSafe(manifest)
  console.log(`validated public-safe manifest=${name} items=${manifest.items.length}`)
}
