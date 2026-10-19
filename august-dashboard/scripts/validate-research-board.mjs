import { publicManifestStatus, generateResearchBoardManifest, researchInputPath, researchSchemaPath, researchOutputPath, validateResearchBoardManifestFile } from './research-board-adapter.mjs'

const generated = generateResearchBoardManifest({ checkOnly: true })
const published = validateResearchBoardManifestFile()

const itemSignature = (manifest) => manifest.items.map(({ id, title, titleKo }) => ({ id, title, titleKo }))
if (JSON.stringify(itemSignature(generated)) !== JSON.stringify(itemSignature(published))) {
  throw new Error('public research-board.json is stale or differs from the canonical source title contract; run npm run generate:research-board')
}

console.log(`validated source=${researchInputPath} items=${generated.items.length}`)
console.log(`validated schema=${researchSchemaPath}`)
console.log(`validated publicManifest=${researchOutputPath} status=${publicManifestStatus()}`)
