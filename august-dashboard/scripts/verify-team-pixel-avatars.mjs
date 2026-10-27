import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { teamPixelAvatarMap } from '../src/teamPixelAvatarMap.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const expectedIds = ['karina', 'yuna', 'goyounjung', 'son', 'faker', 'muyeol']
const expectedSources = new Set(expectedIds.map((id) => `/assets/team/${id}_profile.jpg`))
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function pngMetadata(file) {
  const data = readFileSync(file)
  assert(data.subarray(0, 8).equals(pngSignature), `${file}: invalid PNG signature`)

  let offset = 8
  let width
  let height
  let paletteColours
  while (offset < data.length) {
    const length = data.readUInt32BE(offset)
    const type = data.subarray(offset + 4, offset + 8).toString('ascii')
    const chunk = data.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0)
      height = chunk.readUInt32BE(4)
    }
    if (type === 'PLTE') paletteColours = chunk.length / 3
    offset += length + 12
    if (type === 'IEND') break
  }

  return { width, height, paletteColours }
}

function decodedColourCount(file) {
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', file,
    '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1',
  ], { cwd: repoRoot, encoding: null })
  assert(result.status === 0, `${file}: ffmpeg decode failed: ${result.stderr?.toString()}`)
  assert(result.stdout.length === 80 * 80 * 3, `${file}: decoded pixel payload is not 80x80 RGB`)

  const colours = new Set()
  for (let index = 0; index < result.stdout.length; index += 3) {
    colours.add(`${result.stdout[index]},${result.stdout[index + 1]},${result.stdout[index + 2]}`)
  }
  return colours.size
}

function assertDecodable(file) {
  const result = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height',
    '-of', 'json', file,
  ], { cwd: repoRoot, encoding: 'utf8' })
  assert(result.status === 0, `${file}: ffprobe failed: ${result.stderr}`)
  const stream = JSON.parse(result.stdout).streams?.[0]
  assert(stream?.codec_name === 'png', `${file}: not decodable as PNG`)
  assert(stream.width === 80 && stream.height === 80, `${file}: expected 80x80 output`)
}

const entries = Object.entries(teamPixelAvatarMap)
assert(entries.length === expectedIds.length, 'mapping must contain exactly six avatars')
assert(entries.map(([id]) => id).sort().join(',') === [...expectedIds].sort().join(','), 'mapping IDs do not match the six public team profiles')
assert(new Set(entries.map(([, asset]) => asset.source)).size === expectedIds.length, 'each avatar must have a distinct source image')
assert(new Set(entries.map(([, asset]) => asset.sprite)).size === expectedIds.length, 'each avatar must have a distinct sprite output')

for (const [id, asset] of entries) {
  assert(expectedSources.has(asset.source), `${id}: source is not an approved public profile image`)
  assert(asset.sprite === `/assets/team/pixel/${id}.png`, `${id}: output path is not deterministic`)

  const source = resolve(repoRoot, `public${asset.source}`)
  const output = resolve(repoRoot, `public${asset.sprite}`)
  assert(existsSync(source), `${id}: source does not exist: ${asset.source}`)
  assert(existsSync(output), `${id}: output does not exist: ${asset.sprite}`)

  const metadata = pngMetadata(output)
  assert(metadata.width === 80 && metadata.height === 80, `${id}: PNG header is not 80x80`)
  const paletteColourCount = decodedColourCount(output)
  assert(paletteColourCount <= 12, `${id}: palette must contain no more than 12 colours`)
  assertDecodable(output)
  console.log(`${id}: ${asset.source} -> ${asset.sprite} (80x80, ${paletteColourCount} colours, decodable)`)
}
