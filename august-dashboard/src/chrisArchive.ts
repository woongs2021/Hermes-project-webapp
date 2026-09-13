export type ChrisArchiveItem = {
  id: string
  title: string
  created: string
  status: string
  imageSrc: string
  entryPath: string
  assetPath: string
  summary: string
  interpretation: string
  tags: string[]
  candidates: string[]
}

export type ChrisArchiveManifest = {
  version: number
  generatedAt: string
  sourcePolicy: string
  items: ChrisArchiveItem[]
}

export const fallbackChrisArchive: ChrisArchiveManifest = {
  version: 0,
  generatedAt: 'fallback',
  sourcePolicy: 'Chris Archive manifest unavailable; no private source files are read by the webapp.',
  items: [],
}

export async function loadChrisArchive(): Promise<ChrisArchiveManifest> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/chris-archive.json`, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`chris archive request failed: ${response.status}`)
    }

    const archive = (await response.json()) as ChrisArchiveManifest
    return {
      ...archive,
      items: [...archive.items].sort((left, right) => {
        const dateDelta = left.created.localeCompare(right.created)
        return dateDelta !== 0 ? dateDelta : left.title.localeCompare(right.title)
      }),
    }
  } catch {
    return fallbackChrisArchive
  }
}
