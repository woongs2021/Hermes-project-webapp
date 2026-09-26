export type DnaArchiveItem = {
  id: string
  title: string
  created: string
  status: string
  imageSrc: string
  prompt: string
  midjourneyPrompt?: string
  analysis: string
  sourceTool?: string
  sourceRun?: string
  dnaClusters: string[]
}

export type DnaArchiveManifest = {
  version: number
  generatedAt: string
  sourcePolicy: string
  items: DnaArchiveItem[]
}

export const fallbackDnaArchive: DnaArchiveManifest = {
  version: 1,
  generatedAt: 'fallback',
  sourcePolicy: 'Only Chris-selected GoYJ generated assets are saved here. Unselected review candidates are temporary and are not published.',
  items: [],
}

export async function loadDnaArchive(): Promise<DnaArchiveManifest> {
  return loadDnaArchiveFrom('data/dna-archive.json')
}

export async function loadMidjourneyDnaArchive(): Promise<DnaArchiveManifest> {
  return loadDnaArchiveFrom('data/midjourney-dna-archive.json')
}

async function loadDnaArchiveFrom(path: string): Promise<DnaArchiveManifest> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}${path}`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`dna archive request failed: ${response.status}`)
    const archive = (await response.json()) as DnaArchiveManifest
    return {
      ...archive,
      items: [...archive.items].sort((left, right) => {
        const dateDelta = left.created.localeCompare(right.created)
        return dateDelta !== 0 ? dateDelta : left.title.localeCompare(right.title)
      }),
    }
  } catch {
    return fallbackDnaArchive
  }
}
