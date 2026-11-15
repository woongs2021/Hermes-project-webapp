import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const manifestPath = resolve('public/data/paper-idea-shortlist.json')
const schemaPath = resolve('schemas/paper-idea-shortlist.schema.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'))
const forbidden = [/\/opt\//, /prompt/i, /secret/i, /token/i, /private key/i, /chat_id/i, /message_id/i]
const fail = (message) => { throw new Error(`paper idea shortlist validation failed: ${message}`) }

if (manifest.version !== 1 || manifest.status !== 'published_after_validation') fail('root version/status contract mismatch')
if (Number.isNaN(Date.parse(manifest.updatedAt))) fail('updatedAt must be an ISO date-time')
if (manifest.selection?.minimumVisible !== 3 || manifest.selection?.maximumVisible !== 4 || manifest.selection?.directRelevanceThreshold !== 80) fail('selection must retain the 3–4 / 80-point contract')
if (!Array.isArray(manifest.items) || manifest.items.length < 3) fail('at least three curated items are required')

const ids = new Set()
const dois = new Set()
const eligible = manifest.items.filter((item) => item.publicSafe && item.validationStatus === 'GO' && item.directRelevance >= manifest.selection.directRelevanceThreshold)
if (eligible.length < manifest.selection.minimumVisible) fail('fewer than three validated directly relevant items would be public')
if (eligible.length > manifest.selection.maximumVisible) fail('manifest must be curated to at most four visible items')

for (const item of manifest.items) {
  for (const key of schema.$defs.item.required) if (item[key] === undefined || item[key] === '') fail(`${item.id || 'item'} missing ${key}`)
  if (!/^10\.\d{4,9}\/.+/.test(item.doi)) fail(`${item.id} has invalid DOI`)
  if (item.url !== `https://doi.org/${item.doi}`) fail(`${item.id} DOI URL must be canonical`)
  if (ids.has(item.id) || dois.has(item.doi)) fail(`duplicate id or DOI: ${item.id}`)
  ids.add(item.id); dois.add(item.doi)
  if (!['yuna', 'goyounjung'].includes(item.lane) || !['educator-judgment', 'learner-agency'].includes(item.idea)) fail(`${item.id} lane/idea is not public-contract safe`)
  if (!['GO', 'HOLD'].includes(item.validationStatus) || item.publicSafe !== true || !Number.isInteger(item.directRelevance) || item.directRelevance < 0 || item.directRelevance > 100) fail(`${item.id} validation/public-safe/relevance contract invalid`)
  if (forbidden.some((pattern) => pattern.test(JSON.stringify(item)))) fail(`${item.id} contains disallowed private or operational text`)
}

console.log(`validated schema=${schemaPath}`)
console.log(`validated publicManifest=${manifestPath} eligible=${eligible.length} visible=${Math.min(manifest.selection.maximumVisible, eligible.length)}`)
