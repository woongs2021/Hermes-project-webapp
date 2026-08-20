import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'

export const sourceAssetRoot = '/opt/data/hermes-webapp-build-loop/assets/image-gallery'
export const visualInputPath = '/opt/data/hermes-webapp-build-loop/data/image-gallery/final/current-home-visual-set.json'
export const visualArchiveInputDir = '/opt/data/hermes-webapp-build-loop/data/image-gallery'
export const visualOutputPath = resolve('public/data/home-visual-set.json')
export const visualSchemaPath = resolve('schemas/home-visual-set.schema.json')
export const publicAssetDir = resolve('public/assets/home-visuals')
export const publicTurntableAssetDir = resolve('public/assets/home-visuals/turntables')
export const visualSourcePolicy = 'public-safe home visual manifest only; exposes copied still/turntable assets and approved display copy; excludes raw logs, prompts, remote URLs, model/job IDs, credentials, private IDs, and local source paths'

const allowedSourceStatuses = new Set([
  'final_current_stills_only_no_turntables',
  'final_approved_with_turntable',
  'final_current_partial_2_of_3_due_to_higgsfield_credits',
  'final_single_approved',
  'final_current',
  'archived_final',
  'final',
])

const forbiddenPublicKeys = new Set([
  'model',
  'source_path',
  'webapp_asset_path',
  'turntable_remote_url',
  'turntable_model',
  'turntable_options',
  'turntable_job_id',
  'turntable_qa',
  'turntable_video_asset_path',
  'loop_video_asset_path',
  'prompt',
  'exact_prompt',
])

const suspiciousSecretPatterns = [
  /https?:\/\//i,
  /cloudfront\.net/i,
  /user_[A-Za-z0-9]{12,}/,
  /hf_\d{8}_[A-Za-z0-9-]{20,}/,
  /sk-[A-Za-z0-9_-]{20,}/,
  /gh[pousr]_[A-Za-z0-9_]{20,}/,
  /AIza[0-9A-Za-z_-]{20,}/,
  /Bearer\s+[A-Za-z0-9._-]{20,}/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /password\s*[:=]\s*['"]?[^'"\s]{8,}/i,
  /secret\s*[:=]\s*['"]?[^'"\s]{8,}/i,
  /token\s*[:=]\s*['"]?[^'"\s]{12,}/i,
  /\/opt\/data\//,
]

export function fail(message) {
  throw new Error(`home visual validation failed: ${message}`)
}

export function readJsonFile(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function extractItemsFromSource(source, sourceLabel = 'source') {
  if (Array.isArray(source)) return source

  if (!source || typeof source !== 'object') {
    fail(`${sourceLabel} root must be an object or item array`)
  }

  if (source.status && !allowedSourceStatuses.has(source.status)) {
    fail(`${sourceLabel}.status is not allowed for public home: ${source.status}`)
  }

  if (source.home_component && source.home_component !== 'HomeVisualHero') {
    fail(`${sourceLabel}.home_component must be HomeVisualHero`)
  }

  if (Array.isArray(source.items)) return source.items

  const items = []
  if (source.lead && typeof source.lead === 'object') items.push(source.lead)
  if (Array.isArray(source.support)) items.push(...source.support)
  if (items.length === 0 && Array.isArray(source.final_items)) items.push(...source.final_items)

  return items
}

function getSourceItems(source) {
  const items = extractItemsFromSource(source)

  if (items.length === 0) {
    fail('source must contain at least one visual candidate')
  }

  return items
    .map((item, sourceIndex) => ({ item, sourceIndex }))
    .sort((left, right) => {
      const leftDate = left.item?.date_kst ?? ''
      const rightDate = right.item?.date_kst ?? ''
      return leftDate.localeCompare(rightDate) || left.sourceIndex - right.sourceIndex
    })
    .map(({ item }) => item)
}

function readArchiveSources() {
  return readdirSync(visualArchiveInputDir)
    .filter((fileName) => /^\d{4}-\d{2}-\d{2}\.json$/.test(fileName))
    .sort()
    .flatMap((fileName) => {
      const source = readJsonFile(join(visualArchiveInputDir, fileName))
      return extractItemsFromSource(source, fileName)
    })
}

function assertNonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`)
  }
}

function findPublicApprovedTurntablePath(item, assetPath) {
  if (typeof item.turntable_video_asset_path === 'string' && item.turntable_video_asset_path.length > 0) {
    return item.turntable_video_asset_path
  }

  const stillStem = basename(assetPath, '.png')
  const candidatePath = join(dirname(assetPath), 'turntables', `${stillStem}-turntable-1080.mp4`)
  return existsSync(candidatePath) ? candidatePath : undefined
}

function sanitizeVisualItem(item, index) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    fail(`item[${index}] must be an object`)
  }

  const sourceStatus = item.status ?? item.canonical_status ?? 'archived_final'
  if (!allowedSourceStatuses.has(sourceStatus)) {
    fail(`item[${index}].status is not allowed for public home: ${sourceStatus}`)
  }

  for (const field of ['id', 'title', 'date_kst', 'theme', 'metaphor', 'webapp_asset_path']) {
    assertNonEmptyString(item[field], `item[${index}].${field}`)
  }

  if (!Array.isArray(item.why) || item.why.length === 0 || item.why.length > 3) {
    fail(`item[${index}].why must contain 1-3 public display reasons`)
  }
  item.why.forEach((reason, reasonIndex) => assertNonEmptyString(reason, `item[${index}].why[${reasonIndex}]`))

  const assetPath = item.webapp_asset_path
  if (!assetPath.startsWith(sourceAssetRoot)) {
    fail(`item[${index}].webapp_asset_path must stay inside the approved gallery asset tree`)
  }
  if (!assetPath.endsWith('.png')) {
    fail(`item[${index}].webapp_asset_path must be a still PNG`)
  }
  if (statSync(assetPath).size <= 0) {
    fail(`item[${index}].webapp_asset_path is empty`)
  }

  mkdirSync(publicAssetDir, { recursive: true })
  const publicFileName = `${item.date_kst}-${String(index + 1).padStart(2, '0')}-${basename(assetPath)}`
  const publicAssetPath = resolve(publicAssetDir, publicFileName)
  copyFileSync(assetPath, publicAssetPath)

  const turntablePath = findPublicApprovedTurntablePath(item, assetPath)
  const hasTurntable = typeof turntablePath === 'string' && turntablePath.length > 0
  let publicVideoSrc

  if (hasTurntable) {
    if (!turntablePath.startsWith(sourceAssetRoot)) {
      fail(`item[${index}].turntable_video_asset_path must stay inside the approved gallery asset tree`)
    }
    if (!turntablePath.endsWith('.mp4')) {
      fail(`item[${index}].turntable_video_asset_path must be an MP4`)
    }
    if (statSync(turntablePath).size <= 0) {
      fail(`item[${index}].turntable_video_asset_path is empty`)
    }

    mkdirSync(publicTurntableAssetDir, { recursive: true })
    const publicVideoFileName = `${item.date_kst}-${String(index + 1).padStart(2, '0')}-${basename(turntablePath)}`
    const publicVideoAssetPath = resolve(publicTurntableAssetDir, publicVideoFileName)
    copyFileSync(turntablePath, publicVideoAssetPath)
    publicVideoSrc = `/assets/home-visuals/turntables/${publicVideoFileName}`
  }

  return {
    id: item.id,
    title: item.title,
    dateKst: item.date_kst,
    theme: item.theme,
    metaphor: item.metaphor,
    why: item.why,
    imageSrc: `/assets/home-visuals/${publicFileName}`,
    ...(publicVideoSrc ? { videoSrc: publicVideoSrc } : {}),
    status: 'public_home_allowed',
    mediaCapability: publicVideoSrc ? 'turntable_available' : 'still_only',
    detailMedia: publicVideoSrc ? 'turntable_video' : 'static_still',
    metadata: {
      dateKst: item.date_kst,
      displayMode: item.display_mode ?? 'pinterest_masonry_card',
      interaction: 'dashboard_still_click_opens_turntable_detail_view',
      promptPolicy: 'exact_prompt_hidden_by_default; share only on Chris request',
      sourceStatus,
      detailFallback: 'static_still',
    },
    publicSafe: true,
  }
}

export function buildHomeVisualManifest(source, generatedAt = new Date().toISOString()) {
  return validateHomeVisualManifest({
    version: 1,
    generatedAt,
    sourcePolicy: visualSourcePolicy,
    homeComponent: 'HomeVisualHero',
    status: 'public_home_allowed',
    items: getSourceItems(source).map(sanitizeVisualItem),
  })
}

export function validateHomeVisualManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    fail('manifest root must be an object')
  }

  const allowedManifestKeys = new Set(['version', 'generatedAt', 'sourcePolicy', 'homeComponent', 'status', 'items'])
  for (const key of Object.keys(manifest)) {
    if (!allowedManifestKeys.has(key)) {
      fail(`manifest has unsupported key "${key}"`)
    }
  }

  if (manifest.version !== 1) fail('manifest.version must be 1')
  if (typeof manifest.generatedAt !== 'string' || Number.isNaN(Date.parse(manifest.generatedAt))) {
    fail('manifest.generatedAt must be an ISO date-time string')
  }
  if (manifest.sourcePolicy !== visualSourcePolicy) fail('manifest.sourcePolicy does not match policy')
  if (manifest.homeComponent !== 'HomeVisualHero') fail('manifest.homeComponent must be HomeVisualHero')
  if (manifest.status !== 'public_home_allowed') fail('manifest.status must be public_home_allowed')
  if (!Array.isArray(manifest.items) || manifest.items.length === 0) fail('manifest.items must contain at least one item')

  const seenIds = new Set()
  let turntableCount = 0
  for (const [index, item] of manifest.items.entries()) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) fail(`items[${index}] must be an object`)

    for (const key of Object.keys(item)) {
      if (forbiddenPublicKeys.has(key)) fail(`items[${index}] leaks forbidden key "${key}"`)
    }

    const allowedItemKeys = new Set(['id', 'title', 'dateKst', 'theme', 'metaphor', 'why', 'imageSrc', 'videoSrc', 'status', 'mediaCapability', 'detailMedia', 'metadata', 'publicSafe'])
    for (const key of Object.keys(item)) {
      if (!allowedItemKeys.has(key)) fail(`items[${index}] has unsupported key "${key}"`)
    }

    for (const field of ['id', 'title', 'dateKst', 'theme', 'metaphor', 'imageSrc', 'status', 'mediaCapability', 'detailMedia']) {
      assertNonEmptyString(item[field], `items[${index}].${field}`)
    }
    if (seenIds.has(item.id)) fail(`duplicate item id: ${item.id}`)
    seenIds.add(item.id)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(item.dateKst)) fail(`items[${index}].dateKst must be YYYY-MM-DD`)
    if (!item.imageSrc.startsWith('/assets/home-visuals/') || !item.imageSrc.endsWith('.png')) {
      fail(`items[${index}].imageSrc must point to a copied public still PNG`)
    }
    if (item.status !== 'public_home_allowed') fail(`items[${index}].status must be public_home_allowed`)
    if (!['still_only', 'turntable_available'].includes(item.mediaCapability)) {
      fail(`items[${index}].mediaCapability is not allowed`)
    }
    if (!['static_still', 'turntable_video'].includes(item.detailMedia)) {
      fail(`items[${index}].detailMedia is not allowed`)
    }
    if (item.detailMedia === 'turntable_video') {
      turntableCount += 1
      assertNonEmptyString(item.videoSrc, `items[${index}].videoSrc`)
      if (!item.videoSrc.startsWith('/assets/home-visuals/turntables/') || !item.videoSrc.endsWith('.mp4')) {
        fail(`items[${index}].videoSrc must point to a copied public MP4`)
      }
    }
    if (item.mediaCapability === 'still_only' && Object.hasOwn(item, 'videoSrc')) {
      fail(`items[${index}].videoSrc is only allowed when a turntable is available`)
    }
    if (!item.metadata || typeof item.metadata !== 'object' || Array.isArray(item.metadata)) {
      fail(`items[${index}].metadata must be an object`)
    }
    const allowedMetadataKeys = new Set(['dateKst', 'displayMode', 'interaction', 'promptPolicy', 'sourceStatus', 'detailFallback'])
    for (const key of Object.keys(item.metadata)) {
      if (!allowedMetadataKeys.has(key)) fail(`items[${index}].metadata has unsupported key "${key}"`)
    }
    for (const field of ['dateKst', 'displayMode', 'interaction', 'promptPolicy', 'sourceStatus', 'detailFallback']) {
      assertNonEmptyString(item.metadata[field], `items[${index}].metadata.${field}`)
    }
    if (item.metadata.dateKst !== item.dateKst) fail(`items[${index}].metadata.dateKst must match item.dateKst`)
    if (item.metadata.promptPolicy !== 'exact_prompt_hidden_by_default; share only on Chris request') {
      fail(`items[${index}].metadata.promptPolicy is not allowed`)
    }
    if (item.metadata.detailFallback !== 'static_still') fail(`items[${index}].metadata.detailFallback must be static_still`)
    if (item.publicSafe !== true) fail(`items[${index}].publicSafe must be true`)
    if (!Array.isArray(item.why) || item.why.length === 0 || item.why.length > 3) fail(`items[${index}].why must contain 1-3 reasons`)

    const combinedText = JSON.stringify(item)
    for (const pattern of suspiciousSecretPatterns) {
      if (pattern.test(combinedText)) {
        fail(`items[${index}] appears to expose private/source/secret-like text`)
      }
    }
  }

  if (turntableCount > manifest.items.length) {
    fail(`turntable count exceeds still count: stills=${manifest.items.length} turntables=${turntableCount}`)
  }

  return manifest
}

export function validateHomeVisualManifestFile(path = visualOutputPath) {
  return validateHomeVisualManifest(readJsonFile(path))
}

export function generateHomeVisualManifest({ checkOnly = false } = {}) {
  const source = { items: readArchiveSources() }
  const manifest = buildHomeVisualManifest(source)

  if (!checkOnly) {
    mkdirSync(dirname(visualOutputPath), { recursive: true })
    writeFileSync(visualOutputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
  }

  return manifest
}
