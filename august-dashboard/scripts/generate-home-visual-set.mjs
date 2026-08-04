import { generateHomeVisualManifest, visualOutputPath } from './home-visual-set-adapter.mjs'

const checkOnly = process.argv.includes('--check')
const manifest = generateHomeVisualManifest({ checkOnly })

console.log(`${checkOnly ? 'validated' : 'generated'} ${visualOutputPath} items=${manifest.items.length}`)
