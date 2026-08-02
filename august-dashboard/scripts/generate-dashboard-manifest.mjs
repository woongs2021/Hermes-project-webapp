import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { buildManifest, inputPath, outputPath, readSourceDocuments, validateManifest } from './manifest-validator.mjs'

const checkOnly = process.argv.includes('--check')

const sourceDocuments = readSourceDocuments(inputPath)
const manifest = validateManifest(buildManifest(sourceDocuments))

if (!checkOnly) {
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

console.log(`${checkOnly ? 'validated' : 'generated'} ${outputPath} documents=${manifest.documents.length}`)
