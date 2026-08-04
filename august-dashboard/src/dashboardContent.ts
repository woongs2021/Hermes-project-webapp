export type ManifestDocument = {
  path: string
  title: string
  section: string
  format: 'markdown' | 'json'
  publicSafe: boolean
  summary: string
  bodyPreview: string
}

export type DashboardManifest = {
  version: number
  generatedAt: string
  sourcePolicy: string
  documents: ManifestDocument[]
}

export const fallbackManifest: DashboardManifest = {
  version: 0,
  generatedAt: 'fallback',
  sourcePolicy: 'fallback public-safe sample registry only; generated manifest unavailable',
  documents: [
    {
      path: '/data/metaphor-loops/command-garden.md',
      title: 'Command Garden',
      section: 'Metaphor Loops',
      format: 'markdown',
      publicSafe: true,
      summary: 'Chris의 의도가 Karina의 조율을 거쳐 실행 결과로 자라는 루프.',
      bodyPreview: 'Chris Order → Karina Framing → Agent Team Execution → Muyeol Validation → Karina Synthesis → Chris Feedback',
    },
    {
      path: '/data/overview/today.md',
      title: 'Today Summary',
      section: 'Overview',
      format: 'markdown',
      publicSafe: true,
      summary: '오늘 운영 상태를 private 원문 없이 요약하는 로컬 카드 소스.',
      bodyPreview: 'Local-only placeholder for the daily operating summary. No raw DM or credentials are stored here.',
    },
    {
      path: '/data/research/index.json',
      title: 'Research Index',
      section: 'Research',
      format: 'json',
      publicSafe: true,
      summary: '논문 Markdown 파일을 검색/필터링하기 위한 작은 index 후보.',
      bodyPreview: '{ "papers": [], "filters": ["topic", "year", "status", "relevance"] }',
    },
  ],
}

export async function loadDashboardManifest(): Promise<DashboardManifest> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/dashboard-manifest.json`, { cache: 'no-store' })

    if (!response.ok) {
      throw new Error(`manifest request failed: ${response.status}`)
    }

    const manifest = (await response.json()) as DashboardManifest
    const publicSafeDocuments = manifest.documents.filter((document) => document.publicSafe)

    return {
      ...manifest,
      documents: publicSafeDocuments,
    }
  } catch {
    return fallbackManifest
  }
}
