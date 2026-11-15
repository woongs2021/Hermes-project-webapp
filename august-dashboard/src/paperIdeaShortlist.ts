export type PaperIdea = 'educator-judgment' | 'learner-agency'
export type PaperIdeaShortlistItem = {
  id: string
  lane: 'yuna' | 'goyounjung'
  idea: PaperIdea
  title: string
  titleKo: string
  authors: string
  venue: string
  year: number
  doi: string
  url: string
  directRelevance: number
  evidenceLevel: string
  summary: string
  fit: string
  validationStatus: 'GO' | 'HOLD'
  publicSafe: boolean
}

export type PaperIdeaShortlist = {
  version: number
  updatedAt: string
  status: 'published_after_validation'
  policy: string
  selection: {
    minimumVisible: 3
    maximumVisible: 4
    directRelevanceThreshold: 80
    rule: string
  }
  items: PaperIdeaShortlistItem[]
}

export const fallbackPaperIdeaShortlist: PaperIdeaShortlist = {
  version: 0,
  updatedAt: 'fallback',
  status: 'published_after_validation',
  policy: 'Public shortlist is unavailable.',
  selection: { minimumVisible: 3, maximumVisible: 4, directRelevanceThreshold: 80, rule: 'Only validated, directly relevant papers are shown.' },
  items: [],
}

export function visiblePaperIdeaShortlist(board: PaperIdeaShortlist) {
  return board.items
    .filter((item) => item.publicSafe && item.validationStatus === 'GO' && item.directRelevance >= board.selection.directRelevanceThreshold)
    .sort((left, right) => right.directRelevance - left.directRelevance || left.title.localeCompare(right.title))
    .slice(0, board.selection.maximumVisible)
}

export async function loadPaperIdeaShortlist(): Promise<PaperIdeaShortlist> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/paper-idea-shortlist.json`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`paper shortlist request failed: ${response.status}`)
    const board = (await response.json()) as PaperIdeaShortlist
    return { ...board, items: visiblePaperIdeaShortlist(board) }
  } catch {
    return fallbackPaperIdeaShortlist
  }
}
