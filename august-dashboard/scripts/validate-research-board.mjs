import { publicManifestStatus, generateResearchBoardManifest, researchInputPath, researchSchemaPath, researchOutputPath } from './research-board-adapter.mjs'

const manifest = generateResearchBoardManifest({ checkOnly: true })

console.log(`validated source=${researchInputPath} items=${manifest.items.length}`)
console.log(`validated schema=${researchSchemaPath}`)
console.log(`validated publicManifest=${researchOutputPath} status=${publicManifestStatus()}`)
