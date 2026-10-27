import { spawnSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'
import { teamPixelAvatarMap } from '../src/teamPixelAvatarMap.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const spriteWidth = 96
const spriteHeight = 144
const cellSize = 3
const gridWidth = spriteWidth / cellSize
const gridHeight = spriteHeight / cellSize

const characterSpecs = {
  karina: { prop: 'notebook', outfit: 'mid' },
  yuna: { prop: 'research-sheet', outfit: 'light' },
  goyounjung: { prop: 'colour-swatch', outfit: 'accent' },
  son: { prop: 'planner', outfit: 'mid' },
  faker: { prop: 'laptop-tool', outfit: 'dark' },
  muyeol: { prop: 'shield-check', outfit: 'accent' },
}

function run(command, args, binary = false) {
  const result = spawnSync(command, args, { cwd: repoRoot, encoding: binary ? null : 'utf8' })
  if (result.status !== 0) throw new Error(`${command} failed for ${args.at(-1)}\n${result.stderr?.toString() || result.stdout?.toString()}`)
  return result.stdout
}

function luminance([red, green, blue]) {
  return red * 0.2126 + green * 0.7152 + blue * 0.0722
}

function sourcePalette(source) {
  const pixels = run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-i', source,
    '-vf', 'scale=20:20:flags=area,format=rgb24', '-frames:v', '1',
    '-f', 'rawvideo', 'pipe:1',
  ], true)
  const counts = new Map()
  for (let index = 0; index < pixels.length; index += 3) {
    const colour = [pixels[index], pixels[index + 1], pixels[index + 2]]
    const key = colour.join(',')
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const colours = [...counts.entries()]
    .map(([key, count]) => ({ colour: key.split(',').map(Number), count }))
    .sort((a, b) => luminance(a.colour) - luminance(b.colour))

  const at = (fraction) => colours[Math.min(colours.length - 1, Math.floor((colours.length - 1) * fraction))]?.colour
  const darkest = at(0)
  const hair = at(0.16)
  const mid = at(0.46)
  const light = at(0.72)
  const highlight = at(0.93)
  if (![darkest, hair, mid, light, highlight].every(Boolean)) throw new Error(`${source}: could not derive a public-profile palette`)

  return { outline: darkest, hair, skin: light, mid, light, accent: highlight, dark: hair, shoe: darkest }
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
  for (let y = 0; y < spriteHeight; y += 1) rows.push(Buffer.concat([Buffer.from([0]), pixels.subarray(y * spriteWidth * 4, (y + 1) * spriteWidth * 4)]))
  const header = Buffer.alloc(13)
  header.writeUInt32BE(spriteWidth, 0)
  header.writeUInt32BE(spriteHeight, 4)
  header[8] = 8
  header[9] = 6
  const png = Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', deflateSync(Buffer.concat(rows))), chunk('IEND', Buffer.alloc(0))])
  writeFileSync(output, png)
}

function drawCharacter(palette, spec) {
  const pixels = Buffer.alloc(spriteWidth * spriteHeight * 4)
  const paint = (x, y, width, height, colour) => {
    for (let gy = Math.max(0, y); gy < Math.min(gridHeight, y + height); gy += 1) {
      for (let gx = Math.max(0, x); gx < Math.min(gridWidth, x + width); gx += 1) {
        for (let py = gy * cellSize; py < (gy + 1) * cellSize; py += 1) {
          for (let px = gx * cellSize; px < (gx + 1) * cellSize; px += 1) {
            const index = (py * spriteWidth + px) * 4
            pixels[index] = colour[0]
            pixels[index + 1] = colour[1]
            pixels[index + 2] = colour[2]
            pixels[index + 3] = 255
          }
        }
      }
    }
  }
  const outline = palette.outline
  const outfit = palette[spec.outfit]

  // Head, hair fringe, face highlights, independent arms, torso, legs and shoes.
  paint(10, 3, 12, 2, outline); paint(9, 5, 14, 12, outline)
  paint(10, 4, 12, 4, palette.hair); paint(11, 7, 10, 9, palette.skin)
  paint(11, 7, 3, 2, palette.hair); paint(19, 7, 3, 2, palette.hair)
  paint(13, 10, 1, 1, outline); paint(19, 10, 1, 1, outline); paint(15, 14, 3, 1, palette.accent)
  paint(10, 17, 12, 16, outline); paint(11, 18, 10, 14, outfit); paint(13, 18, 6, 3, palette.light)
  paint(7, 20, 3, 10, outline); paint(8, 21, 2, 8, outfit)
  paint(22, 20, 3, 10, outline); paint(22, 21, 2, 8, outfit)
  paint(11, 33, 5, 11, outline); paint(17, 33, 5, 11, outline)
  paint(12, 33, 3, 10, palette.dark); paint(18, 33, 3, 10, palette.dark)
  paint(10, 43, 7, 3, outline); paint(16, 43, 7, 3, outline)
  paint(11, 43, 5, 2, palette.shoe); paint(17, 43, 5, 2, palette.shoe)

  // Role-specific props retain a calm office silhouette without becoming a likeness.
  if (spec.prop === 'notebook') { paint(24, 20, 5, 10, outline); paint(25, 21, 3, 8, palette.light); paint(25, 21, 1, 8, palette.dark); paint(26, 23, 2, 1, palette.accent); paint(26, 26, 2, 1, palette.accent) }
  if (spec.prop === 'research-sheet') { paint(24, 18, 5, 12, outline); paint(25, 19, 3, 10, palette.light); paint(26, 21, 2, 1, palette.mid); paint(26, 24, 2, 1, palette.mid); paint(26, 27, 1, 1, palette.accent) }
  if (spec.prop === 'colour-swatch') { paint(24, 20, 2, 9, outline); paint(26, 19, 2, 10, outline); paint(28, 21, 2, 8, outline); paint(24, 22, 1, 5, palette.accent); paint(26, 21, 1, 6, palette.mid); paint(28, 23, 1, 4, palette.light) }
  if (spec.prop === 'planner') { paint(24, 19, 5, 11, outline); paint(25, 20, 3, 9, palette.light); paint(25, 20, 3, 1, palette.accent); paint(25, 22, 1, 1, palette.dark); paint(27, 22, 1, 1, palette.dark); paint(26, 25, 2, 1, palette.mid) }
  if (spec.prop === 'laptop-tool') { paint(23, 22, 7, 5, outline); paint(24, 23, 5, 3, palette.light); paint(22, 27, 9, 2, outline); paint(24, 27, 5, 1, palette.mid); paint(6, 27, 2, 4, palette.accent); paint(5, 30, 4, 1, outline) }
  if (spec.prop === 'shield-check') { paint(25, 19, 3, 1, outline); paint(24, 20, 5, 6, outline); paint(25, 26, 3, 2, outline); paint(25, 20, 3, 6, palette.accent); paint(26, 23, 1, 2, palette.light); paint(27, 22, 1, 1, palette.light) }

  return pixels
}

for (const [id, asset] of Object.entries(teamPixelAvatarMap)) {
  const source = resolve(repoRoot, `public${asset.source}`)
  const output = resolve(repoRoot, `public${asset.sprite}`)
  const spec = characterSpecs[id]
  if (!spec) throw new Error(`${id}: missing full-body role specification`)
  mkdirSync(dirname(output), { recursive: true })
  writePng(output, drawCharacter(sourcePalette(source), spec))
  console.log(`${id}: ${asset.source} -> ${asset.sprite} (${spriteWidth}x${spriteHeight}, transparent full-body, ${spec.prop})`)
}
