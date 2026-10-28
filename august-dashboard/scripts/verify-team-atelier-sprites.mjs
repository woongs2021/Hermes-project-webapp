import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const root = new URL('../public/assets/team/atelier-sprites/', import.meta.url)
const agents = ['karina', 'yuna', 'goyounjung', 'son', 'faker', 'muyeol']
const directions = ['front', 'front-three-quarter', 'profile', 'back-three-quarter', 'back']
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

for (const agent of agents) {
  for (const direction of directions) {
    const file = join(root.pathname, agent, `${direction}.png`)
    const data = await readFile(file)
    if (!data.subarray(0, 8).equals(pngSignature)) throw new Error(`Invalid PNG: ${file}`)
    const width = data.readUInt32BE(16)
    const height = data.readUInt32BE(20)
    const colorType = data[25]
    if (width !== 400 || height !== 1500 || colorType !== 6) {
      throw new Error(`Unexpected sprite contract: ${file} (${width}×${height}, color type ${colorType})`)
    }
    if ((await stat(file)).size === 0) throw new Error(`Empty sprite: ${file}`)
  }
}

console.log(`Verified ${agents.length * directions.length} RGBA Pixel Atelier directional sprites.`)
