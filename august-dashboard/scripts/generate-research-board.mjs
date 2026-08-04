import { generateResearchBoardManifest, researchOutputPath } from './research-board-adapter.mjs'

const checkOnly = process.argv.includes('--check')
const manifest = generateResearchBoardManifest({ checkOnly })

console.log(`${checkOnly ? 'validated' : 'generated'} ${researchOutputPath} items=${manifest.items.length}`)
