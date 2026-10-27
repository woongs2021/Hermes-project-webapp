import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { teamPixelAvatarMap } from '../src/teamPixelAvatarMap.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const frameWidth = 32
const frameHeight = 48
const framesPerDirection = 3
const directions = ['south', 'west', 'east', 'north']
const sheetWidth = frameWidth * framesPerDirection
const sheetHeight = frameHeight * directions.length

// Only broad, non-biometric profile cues: each silhouette is intentionally illustrative, not a face recreation.
const characterSpecs = {
  karina: { prop: 'notebook', outfit: 'mid', hair: 'centre-long', collar: 'v' },
  yuna: { prop: 'research-sheet', outfit: 'light', hair: 'soft-long', collar: 'line' },
  goyounjung: { prop: 'colour-swatch', outfit: 'accent', hair: 'side-long', collar: 'tweed' },
  son: { prop: 'planner', outfit: 'mid', hair: 'short-up', collar: 'open' },
  faker: { prop: 'laptop-tool', outfit: 'dark', hair: 'fringe', collar: 'high', glasses: true },
  muyeol: { prop: 'shield-check', outfit: 'accent', hair: 'slick-short', collar: 'round' },
}

function run(command, args, binary = false) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: binary ? null : 'utf8' })
  if (result.status !== 0) throw new Error(`${command} failed for ${args.at(-1)}\n${result.stderr?.toString() || result.stdout?.toString()}`)
  return result.stdout
}

function luminance([red, green, blue]) { return red * 0.2126 + green * 0.7152 + blue * 0.0722 }

function sourcePalette(source) {
  const pixels = run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', source, '-vf', 'scale=20:20:flags=area,format=rgb24', '-frames:v', '1', '-f', 'rawvideo', 'pipe:1'], true)
  const counts = new Map()
  for (let index = 0; index < pixels.length; index += 3) {
    const colour = [pixels[index], pixels[index + 1], pixels[index + 2]]
    const key = colour.join(',')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const colours = [...counts.entries()].map(([key, count]) => ({ colour: key.split(',').map(Number), count })).sort((a, b) => luminance(a.colour) - luminance(b.colour))
  const at = (fraction) => colours[Math.min(colours.length - 1, Math.floor((colours.length - 1) * fraction))]?.colour
  const [outline, hair, mid, light, accent] = [at(0), at(0.16), at(0.46), at(0.72), at(0.93)]
  if (![outline, hair, mid, light, accent].every(Boolean)) throw new Error(`${source}: could not derive a public-profile palette`)
  return { outline, hair, skin: light, mid, light, accent, dark: hair, shoe: outline }
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const name = Buffer.from(type)
  const result = Buffer.alloc(12 + data.length)
  result.writeUInt32BE(data.length, 0)
  name.copy(result, 4)
  data.copy(result, 8)
  result.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length)
  return result
}

function writePng(output, pixels) {
  const rows = []
  for (let y = 0; y < sheetHeight; y += 1) rows.push(Buffer.concat([Buffer.from([0]), pixels.subarray(y * sheetWidth * 4, (y + 1) * sheetWidth * 4)]))
  const header = Buffer.alloc(13)
  header.writeUInt32BE(sheetWidth, 0); header.writeUInt32BE(sheetHeight, 4); header[8] = 8; header[9] = 6
  writeFileSync(output, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))]))
}

function drawSheet(palette, spec) {
  const pixels = Buffer.alloc(sheetWidth * sheetHeight * 4)
  const paint = (frame, direction, x, y, width, height, colour) => {
    const offsetX = frame * frameWidth
    const offsetY = direction * frameHeight
    for (let py = Math.max(0, y); py < Math.min(frameHeight, y + height); py += 1) for (let px = Math.max(0, x); px < Math.min(frameWidth, x + width); px += 1) {
      const index = ((offsetY + py) * sheetWidth + offsetX + px) * 4
      pixels[index] = colour[0]; pixels[index + 1] = colour[1]; pixels[index + 2] = colour[2]; pixels[index + 3] = 255
    }
  }
  const draw = (frame, direction) => {
    const facing = directions[direction]
    const side = facing === 'west' ? -1 : facing === 'east' ? 1 : 0
    const stride = frame === 1 ? 1 : frame === 2 ? -1 : 0
    const outline = palette.outline
    const outfit = palette[spec.outfit]
    // 32×48 logical pixels: hat/hair, face, jacket, separate arms, stride legs and shoes.
    paint(frame, direction, 10, 4, 12, 2, outline); paint(frame, direction, 9, 6, 14, 10, outline)
    paint(frame, direction, 10, 5, 12, 4, palette.hair); paint(frame, direction, 11, 9, 10, 6, palette.skin)
    if (facing === 'north') paint(frame, direction, 11, 9, 10, 6, palette.hair)
    else if (side) { paint(frame, direction, side < 0 ? 11 : 19, 10, 2, 2, outline); paint(frame, direction, 14, 14, 4, 1, palette.accent) }
    else { paint(frame, direction, 13, 11, 1, 1, outline); paint(frame, direction, 19, 11, 1, 1, outline); paint(frame, direction, 15, 14, 3, 1, palette.accent) }
    paint(frame, direction, 10, 16, 12, 14, outline); paint(frame, direction, 11, 17, 10, 12, outfit); paint(frame, direction, 13, 17, 6, 2, palette.light)
    paint(frame, direction, 7, 19, 3, 9, outline); paint(frame, direction, 8, 20, 2, 7, outfit)
    paint(frame, direction, 22, 19, 3, 9, outline); paint(frame, direction, 22, 20, 2, 7, outfit)
    paint(frame, direction, 11 + stride, 30, 5, 12, outline); paint(frame, direction, 17 - stride, 30, 5, 12, outline)
    paint(frame, direction, 12 + stride, 30, 3, 11, palette.dark); paint(frame, direction, 18 - stride, 30, 3, 11, palette.dark)
    paint(frame, direction, 10 + stride, 41, 7, 3, outline); paint(frame, direction, 16 - stride, 41, 7, 3, outline)
    paint(frame, direction, 11 + stride, 41, 5, 2, palette.shoe); paint(frame, direction, 17 - stride, 41, 5, 2, palette.shoe)
    // Distinct broad hair / clothing silhouettes: recognizable at map scale without reconstructing faces.
    if (spec.hair === 'centre-long') { paint(frame, direction, 9, 7, 3, 15, palette.hair); paint(frame, direction, 20, 7, 3, 15, palette.hair); paint(frame, direction, 15, 5, 2, 4, palette.skin) }
    if (spec.hair === 'soft-long') { paint(frame, direction, 8, 8, 3, 13, palette.hair); paint(frame, direction, 21, 8, 3, 13, palette.hair); paint(frame, direction, 10, 6, 12, 2, palette.hair) }
    if (spec.hair === 'side-long') { paint(frame, direction, 8, 7, 5, 17, palette.hair); paint(frame, direction, 10, 5, 12, 3, palette.hair); paint(frame, direction, 19, 7, 3, 9, palette.hair) }
    if (spec.hair === 'short-up') { paint(frame, direction, 11, 3, 4, 4, palette.hair); paint(frame, direction, 15, 2, 5, 5, palette.hair); paint(frame, direction, 20, 4, 2, 4, palette.hair) }
    if (spec.hair === 'fringe') { paint(frame, direction, 10, 5, 12, 4, palette.hair); paint(frame, direction, 10, 8, 7, 3, palette.hair); paint(frame, direction, 19, 8, 3, 2, palette.hair) }
    if (spec.hair === 'slick-short') { paint(frame, direction, 10, 4, 12, 4, palette.hair); paint(frame, direction, 19, 3, 3, 5, palette.hair); paint(frame, direction, 9, 7, 2, 5, palette.hair) }
    if (spec.glasses && facing !== 'north') { paint(frame, direction, 12, 10, 3, 2, outline); paint(frame, direction, 18, 10, 3, 2, outline); paint(frame, direction, 15, 10, 3, 1, outline) }
    if (spec.collar === 'v') paint(frame, direction, 15, 17, 3, 4, palette.accent)
    if (spec.collar === 'line') paint(frame, direction, 15, 17, 1, 9, palette.accent)
    if (spec.collar === 'tweed') { paint(frame, direction, 12, 20, 1, 1, palette.light); paint(frame, direction, 19, 24, 1, 1, palette.light); paint(frame, direction, 15, 27, 1, 1, palette.light) }
    if (spec.collar === 'open') { paint(frame, direction, 12, 18, 3, 2, palette.light); paint(frame, direction, 18, 18, 3, 2, palette.light) }
    if (spec.collar === 'high') paint(frame, direction, 13, 17, 6, 4, palette.dark)
    if (spec.collar === 'round') paint(frame, direction, 14, 17, 4, 2, palette.light)
    // A public-role prop identifies the six work islands without recreating any face.
    const propX = side < 0 ? 3 : 24
    if (spec.prop === 'notebook') { paint(frame, direction, propX, 20, 5, 10, outline); paint(frame, direction, propX + 1, 21, 3, 8, palette.light); paint(frame, direction, propX + 1, 22, 1, 6, palette.dark) }
    if (spec.prop === 'research-sheet') { paint(frame, direction, propX, 18, 5, 12, outline); paint(frame, direction, propX + 1, 19, 3, 10, palette.light); paint(frame, direction, propX + 2, 22, 2, 1, palette.mid); paint(frame, direction, propX + 2, 26, 2, 1, palette.mid) }
    if (spec.prop === 'colour-swatch') { paint(frame, direction, propX, 20, 2, 9, outline); paint(frame, direction, propX + 2, 19, 2, 10, outline); paint(frame, direction, propX + 4, 21, 2, 8, outline); paint(frame, direction, propX, 22, 1, 5, palette.accent); paint(frame, direction, propX + 2, 21, 1, 6, palette.mid) }
    if (spec.prop === 'planner') { paint(frame, direction, propX, 19, 5, 11, outline); paint(frame, direction, propX + 1, 20, 3, 9, palette.light); paint(frame, direction, propX + 1, 20, 3, 1, palette.accent) }
    if (spec.prop === 'laptop-tool') { paint(frame, direction, propX - 1, 22, 7, 5, outline); paint(frame, direction, propX, 23, 5, 3, palette.light); paint(frame, direction, propX - 2, 27, 9, 2, outline); paint(frame, direction, 5, 27, 2, 4, palette.accent) }
    if (spec.prop === 'shield-check') { paint(frame, direction, propX, 19, 3, 1, outline); paint(frame, direction, propX - 1, 20, 5, 6, outline); paint(frame, direction, propX, 20, 3, 6, palette.accent); paint(frame, direction, propX + 1, 23, 1, 2, palette.light) }
  }
  directions.forEach((_, direction) => Array.from({ length: framesPerDirection }, (_, frame) => draw(frame, direction)))
  return pixels
}

for (const [id, asset] of Object.entries(teamPixelAvatarMap)) {
  const source = resolve(repoRoot, `public${asset.source}`)
  const output = resolve(repoRoot, `public${asset.sprite}`)
  const spec = characterSpecs[id]
  if (!spec) throw new Error(`${id}: missing full-body role specification`)
  mkdirSync(dirname(output), { recursive: true })
  writePng(output, drawSheet(sourcePalette(source), spec))
  console.log(`${id}: ${asset.source} -> ${asset.sprite} (${sheetWidth}x${sheetHeight}; 32x48 × 4 directions × 3 walk frames; transparent; ${spec.prop})`)
}
