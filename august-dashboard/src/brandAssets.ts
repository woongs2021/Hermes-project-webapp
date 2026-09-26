export type BrandMockupAsset = {
  id: string
  title: string
  description: string
  imageSrc: string
  assetHash: string
  width: number
  height: number
}

export type BrandMockupCollection = {
  id: string
  title: string
  created: string
  status: string
  description: string
  items: BrandMockupAsset[]
}

export type BrandMockupManifest = {
  version: number
  generatedAt: string
  sourcePolicy: string
  collections: BrandMockupCollection[]
}

export const fallbackBrandMockupAssets: BrandMockupManifest = {
  version: 1,
  generatedAt: 'fallback',
  sourcePolicy: 'Only Chris-selected brand mockup moodboard assets are saved here.',
  collections: [],
}

export async function loadBrandMockupAssets(): Promise<BrandMockupManifest> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/brand-mockup-assets.json`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`brand mockup assets request failed: ${response.status}`)
    return (await response.json()) as BrandMockupManifest
  } catch {
    return fallbackBrandMockupAssets
  }
}
