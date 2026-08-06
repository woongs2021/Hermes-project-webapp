export type HomeVisualMetadata = {
  dateKst: string
  displayMode: string
  interaction: string
  promptPolicy: string
  sourceStatus: string
  detailFallback: 'static_still'
}

export type HomeVisualItem = {
  id: string
  title: string
  dateKst: string
  theme: string
  metaphor: string
  why: string[]
  imageSrc: string
  videoSrc?: string
  status: 'public_home_allowed'
  mediaCapability: 'still_only' | 'turntable_available'
  detailMedia: 'static_still' | 'turntable_video'
  metadata: HomeVisualMetadata
  publicSafe: boolean
}

export type HomeVisualSet = {
  version: number
  generatedAt: string
  sourcePolicy: string
  homeComponent: 'HomeVisualHero'
  status: 'public_home_allowed'
  items: HomeVisualItem[]
}

export const fallbackHomeVisualSet: HomeVisualSet = {
  version: 0,
  generatedAt: 'fallback',
  sourcePolicy: 'fallback public-safe home visual set; generated manifest unavailable',
  homeComponent: 'HomeVisualHero',
  status: 'public_home_allowed',
  items: [],
}

export async function loadHomeVisualSet(): Promise<HomeVisualSet> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/home-visual-set.json`, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`home visual request failed: ${response.status}`)
    }

    const visualSet = (await response.json()) as HomeVisualSet
    const publicSafeItems = visualSet.items
      .filter((item) => item.publicSafe && item.status === 'public_home_allowed')
      .sort((left, right) => right.dateKst.localeCompare(left.dateKst))

    return {
      ...visualSet,
      items: publicSafeItems,
    }
  } catch {
    return fallbackHomeVisualSet
  }
}
