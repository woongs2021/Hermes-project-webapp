export type ResearchLane = 'yuna' | 'goyounjung'

export type ResearchBoardItem = {
  id: string
  dateKst: string
  isoWeek: string
  lane: ResearchLane
  owner: ResearchLane
  title: string
  thumbnailLabel: string
  sourceVenue: string
  sourceAccess: string
  sourceUrlOrId: string
  publicationDate: string
  summary: string
  chrisRelevance: string
  koreanSourceStatus: string
  score: number
  duplicateSignal: string
  status: 'daily_candidate' | 'friday_final_pick'
  validationStatus: 'unreviewed' | 'GO' | 'WATCH' | 'HOLD'
  publicSafe: boolean
}

export type ResearchBoard = {
  version: number
  generatedAt: string
  sourcePolicy: string
  status: 'public_research_board_allowed'
  items: ResearchBoardItem[]
}

export const fallbackResearchBoard: ResearchBoard = {
  version: 0,
  generatedAt: 'fallback',
  sourcePolicy: 'fallback public-safe research board; generated manifest unavailable',
  status: 'public_research_board_allowed',
  items: [],
}

export async function loadResearchBoard(): Promise<ResearchBoard> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/research-board.json`, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`research board request failed: ${response.status}`)
    }

    const board = (await response.json()) as ResearchBoard
    const publicSafeItems = board.items
      .filter((item) => item.publicSafe && (item.lane === 'yuna' || item.lane === 'goyounjung'))
      .sort((left, right) => left.dateKst.localeCompare(right.dateKst) || left.lane.localeCompare(right.lane) || left.title.localeCompare(right.title))

    return {
      ...board,
      items: publicSafeItems,
    }
  } catch {
    return fallbackResearchBoard
  }
}
