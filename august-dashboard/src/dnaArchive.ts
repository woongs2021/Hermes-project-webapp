export type DnaArchiveItem = {
  id: string
  title: string
  created: string
  status: string
  imageSrc: string
  prompt: string
  analysis: string
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
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/dna-archive.json`, { cache: 'no-store' })
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
