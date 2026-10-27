import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { teamPixelAvatarMap } from '../src/teamPixelAvatarMap.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const expectedIds = ['karina', 'yuna', 'goyounjung', 'son', 'faker', 'muyeol']
const expectedSources = new Set(expectedIds.map((id) => `/assets/team/${id}_profile.jpg`))
const spriteWidth = 96
const spriteHeight = 144
const maxColours = 10
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const roleProps = {
  karina: 'notebook', yuna: 'research-sheet', goyounjung: 'colour-swatch',
  son: 'planner', faker: 'laptop-tool', muyeol: 'shield-check',
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function pngMetadata(file) {
  const data = readFileSync(file)
  assert(data.subarray(0, 8).equals(pngSignature), `${file}: invalid PNG signature`)
  let offset = 8
  let width; let height; let colourType
  while (offset < data.length) {
    const length = data.readUInt32BE(offset)
    const type = data.subarray(offset + 4, offset + 8).toString('ascii')
    const chunk = data.subarray(offset + 8, offset + 8 + length)
    if (type === 'IHDR') { width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); colourType = chunk[9] }
    offset += length + 12
    if (type === 'IEND') break
  }
  return { width, height, colourType }
}

function decodeRgba(file) {
  const result = spawnSync('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', file, '-frames:v', '1',
    '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1',
  ], { cwd: repoRoot, encoding: null })
  assert(result.status === 0, `${file}: ffmpeg decode failed: ${result.stderr?.toString()}`)
  assert(result.stdout.length === spriteWidth * spriteHeight * 4, `${file}: decoded payload is not ${spriteWidth}x${spriteHeight} RGBA`)
  return result.stdout
}

function alphaAt(rgba, x, y) {
  return rgba[(y * spriteWidth + x) * 4 + 3]
}

function verifyFullBody(id, rgba) {
  const opaque = []
  const colours = new Set()
  let transparent = 0
  for (let y = 0; y < spriteHeight; y += 1) {
    for (let x = 0; x < spriteWidth; x += 1) {
      const index = (y * spriteWidth + x) * 4
      if (rgba[index + 3] === 0) transparent += 1
      else { opaque.push([x, y]); colours.add(`${rgba[index]},${rgba[index + 1]},${rgba[index + 2]}`) }
    }
  }
  assert(transparent > 0, `${id}: must retain a transparent background`)
  assert(colours.size <= maxColours, `${id}: palette must contain no more than ${maxColours} opaque colours (found ${colours.size})`)
  const left = Math.min(...opaque.map(([x]) => x)); const right = Math.max(...opaque.map(([x]) => x))
  const top = Math.min(...opaque.map(([, y]) => y)); const bottom = Math.max(...opaque.map(([, y]) => y))
  assert(top <= 12 && bottom >= 132 && right - left >= 48, `${id}: silhouette must span head through shoes with a role prop`)
  assert(alphaAt(rgba, 39, 27) > 0, `${id}: head/face block is missing`)
  assert(alphaAt(rgba, 39, 66) > 0, `${id}: torso block is missing`)
  assert(alphaAt(rgba, 25, 69) > 0 && alphaAt(rgba, 70, 69) > 0, `${id}: separate arms are missing`)
  assert(alphaAt(rgba, 39, 111) > 0 && alphaAt(rgba, 57, 111) > 0, `${id}: separate legs are missing`)
  assert(alphaAt(rgba, 39, 132) > 0 && alphaAt(rgba, 57, 132) > 0, `${id}: shoes are missing`)
  assert(alphaAt(rgba, 78, 69) > 0, `${id}: ${roleProps[id]} prop is missing`)
  return { colours: colours.size, transparent }
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
  assert(existsSync(source), `${id}: source does not exist`)
  assert(existsSync(output), `${id}: output does not exist`)
  const metadata = pngMetadata(output)
  assert(metadata.width === spriteWidth && metadata.height === spriteHeight, `${id}: PNG header is not ${spriteWidth}x${spriteHeight}`)
  assert(metadata.colourType === 6, `${id}: PNG must be RGBA to preserve transparency`)
  const result = verifyFullBody(id, decodeRgba(output))
  console.log(`${id}: ${asset.source} -> ${asset.sprite} (${spriteWidth}x${spriteHeight}, ${result.colours} colours, transparent, ${roleProps[id]})`)
}
