import { existsSync } from 'node:fs'
import { generateHomeVisualManifest, validateHomeVisualManifest, validateHomeVisualManifestFile, visualOutputPath, visualSchemaPath, visualArchiveInputDir } from './home-visual-set-adapter.mjs'

const generatedManifest = generateHomeVisualManifest({ checkOnly: true })
validateHomeVisualManifest(generatedManifest)

let publicManifestStatus = 'not-present'
if (existsSync(visualOutputPath)) {
  const publicManifest = validateHomeVisualManifestFile(visualOutputPath)
  publicManifestStatus = `valid items=${publicManifest.items.length}`
}

console.log(`validated archiveSource=${visualArchiveInputDir} items=${generatedManifest.items.length}`)
console.log(`validated schema=${visualSchemaPath}`)
console.log(`validated publicManifest=${visualOutputPath} status=${publicManifestStatus}`)
