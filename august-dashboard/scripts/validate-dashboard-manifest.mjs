import { existsSync } from 'node:fs'
import { buildManifest, inputPath, outputPath, readSourceDocuments, validateManifest, validateManifestFile } from './manifest-validator.mjs'

const sourceDocuments = readSourceDocuments(inputPath)
const generatedManifest = validateManifest(buildManifest(sourceDocuments))

let publicManifestStatus = 'not-present'
if (existsSync(outputPath)) {
  const publicManifest = validateManifestFile(outputPath)
  publicManifestStatus = `valid documents=${publicManifest.documents.length}`
}

console.log(`validated source=${inputPath} documents=${generatedManifest.documents.length}`)
console.log(`validated schema=schemas/dashboard-manifest.schema.json`)
console.log(`validated publicManifest=${outputPath} status=${publicManifestStatus}`)
