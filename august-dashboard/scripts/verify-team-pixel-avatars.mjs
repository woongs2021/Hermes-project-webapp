import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { teamPixelAvatarMap } from '../src/teamPixelAvatarMap.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const expectedIds = ['karina', 'yuna', 'goyounjung', 'son', 'faker', 'muyeol']
const frameWidth = 32
const frameHeight = 48
const framesPerDirection = 3
const directionCount = 4
const sheetWidth = frameWidth * framesPerDirection
const sheetHeight = frameHeight * directionCount
const maxColours = 10
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function assert(condition, message) { if (!condition) throw new Error(message) }
function pngMetadata(file) {
  const data = readFileSync(file); assert(data.subarray(0, 8).equals(pngSignature), `${file}: invalid PNG signature`)
  let offset = 8; let width; let height; let colourType
  while (offset < data.length) { const length = data.readUInt32BE(offset); const type = data.subarray(offset + 4, offset + 8).toString('ascii'); const chunk = data.subarray(offset + 8, offset + 8 + length); if (type === 'IHDR') { width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4); colourType = chunk[9] }; offset += length + 12; if (type === 'IEND') break }
  return { width, height, colourType }
}
function decodeRgba(file) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', file, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgba', 'pipe:1'], { cwd: repoRoot, encoding: null })
  assert(result.status === 0, `${file}: ffmpeg decode failed: ${result.stderr?.toString()}`)
  assert(result.stdout.length === sheetWidth * sheetHeight * 4, `${file}: decoded payload is not ${sheetWidth}x${sheetHeight} RGBA`)
  return result.stdout
}
function opaqueCount(rgba, frame, direction) {
  let count = 0
  for (let y = direction * frameHeight; y < (direction + 1) * frameHeight; y += 1) for (let x = frame * frameWidth; x < (frame + 1) * frameWidth; x += 1) if (rgba[(y * sheetWidth + x) * 4 + 3] > 0) count += 1
  return count
}
function cellSignature(rgba, frame, direction) {
  const bytes = []
  for (let y = direction * frameHeight; y < (direction + 1) * frameHeight; y += 1) for (let x = frame * frameWidth; x < (frame + 1) * frameWidth; x += 1) { const at = (y * sheetWidth + x) * 4; bytes.push(rgba[at], rgba[at + 1], rgba[at + 2], rgba[at + 3]) }
  return Buffer.from(bytes).toString('base64')
}
function verifySheet(id, rgba) {
  const colours = new Set(); let transparent = 0
  for (let index = 0; index < rgba.length; index += 4) { if (rgba[index + 3] === 0) transparent += 1; else colours.add(`${rgba[index]},${rgba[index + 1]},${rgba[index + 2]}`) }
  assert(transparent > 0, `${id}: sheet must retain transparency`); assert(colours.size <= maxColours, `${id}: palette must contain no more than ${maxColours} opaque colours (found ${colours.size})`)
  const signatures = new Set()
  for (let direction = 0; direction < directionCount; direction += 1) for (let frame = 0; frame < framesPerDirection; frame += 1) { const count = opaqueCount(rgba, frame, direction); assert(count >= 300, `${id}: frame ${direction}/${frame} is not a detailed full body`); signatures.add(cellSignature(rgba, frame, direction)) }
  assert(signatures.size === directionCount * framesPerDirection, `${id}: every direction/frame must be a distinct deterministic cell`)
  assert(cellSignature(rgba, 0, 0) !== cellSignature(rgba, 1, 0), `${id}: walk frame must change`)
  assert(cellSignature(rgba, 0, 0) !== cellSignature(rgba, 0, 1), `${id}: direction frame must change`)
  return { colours: colours.size, transparent, frames: signatures.size }
}

const entries = Object.entries(teamPixelAvatarMap)
assert(entries.length === expectedIds.length, 'mapping must contain exactly six avatars')
assert(entries.map(([id]) => id).sort().join(',') === [...expectedIds].sort().join(','), 'mapping IDs do not match six public team profiles')
assert(new Set(entries.map(([, asset]) => asset.source)).size === expectedIds.length, 'each avatar must have a distinct source image')
assert(new Set(entries.map(([, asset]) => asset.sprite)).size === expectedIds.length, 'each avatar must have a distinct sprite output')
for (const [id, asset] of entries) {
  assert(asset.source === `/assets/team/${id}_profile.jpg`, `${id}: source is not the approved public profile image`)
  assert(asset.sprite === `/assets/team/pixel/${id}.png`, `${id}: output path is not deterministic`)
  const source = resolve(repoRoot, `public${asset.source}`); const output = resolve(repoRoot, `public${asset.sprite}`)
  assert(existsSync(source), `${id}: source does not exist`); assert(existsSync(output), `${id}: output does not exist`)
  const metadata = pngMetadata(output); assert(metadata.width === sheetWidth && metadata.height === sheetHeight, `${id}: PNG header is not ${sheetWidth}x${sheetHeight}`); assert(metadata.colourType === 6, `${id}: PNG must be RGBA`)
  const result = verifySheet(id, decodeRgba(output))
  console.log(`${id}: ${asset.source} -> ${asset.sprite} (${sheetWidth}x${sheetHeight}; 32x48 × 4 × 3; ${result.frames} distinct frames; ${result.colours} colours; transparent)`)
}
