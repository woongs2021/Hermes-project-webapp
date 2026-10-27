import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { teamPixelAvatarMap } from '../src/teamPixelAvatarMap.ts'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const gridSize = 16
const outputSize = 80
const maxColors = 12

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    throw new Error(`${command} failed for ${args.at(-1)}\n${result.stderr || result.stdout}`)
  }
}

for (const [id, asset] of Object.entries(teamPixelAvatarMap)) {
  const source = resolve(repoRoot, `public${asset.source}`)
  const output = resolve(repoRoot, `public${asset.sprite}`)
  mkdirSync(dirname(output), { recursive: true })

  // A mild warm grade and a 12-colour palette retain the source silhouette while
  // keeping every output on the same calm pixel-art system.
  const pixelFilter = [
    "crop='min(iw,ih)':'min(iw,ih)':'(iw-ow)/2':'(ih-oh)/2'",
    'eq=contrast=1.06:brightness=0.015:saturation=0.74',
    'colorbalance=rs=0.05:gs=0.02:bs=-0.08',
    `scale=${gridSize}:${gridSize}:flags=neighbor`,
    `scale=${outputSize}:${outputSize}:flags=neighbor`,
  ].join(',')
  const filterGraph = `[0:v]${pixelFilter},split[pixel][palette];[palette]palettegen=max_colors=${maxColors}:reserve_transparent=0[paletteout];[pixel][paletteout]paletteuse=dither=none[out]`

  run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-y', '-i', source,
    '-filter_complex', filterGraph,
    '-map', '[out]', '-frames:v', '1', output,
  ])

  console.log(`${id}: ${asset.source} -> ${asset.sprite} (${gridSize}x${gridSize} -> ${outputSize}x${outputSize}, <=${maxColors} colours)`)
}
