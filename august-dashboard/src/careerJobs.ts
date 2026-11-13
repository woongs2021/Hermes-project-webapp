export type CareerCategory = 'faculty' | 'corporate_design' | 'ai_ax_education'
export type CareerStatus = 'NEW' | 'UPDATED' | 'ACTIVE' | 'CLOSED' | 'UNVERIFIED'
export type CareerVerificationState = 'verified_detail' | 'official_index_only' | 'fetch_blocked' | 'ambiguous'

export type CareerJob = {
  id: string
  companyOrInstitution: string
  category: CareerCategory
  title: string
  location: string
  status: CareerStatus
  fit: 'high' | 'medium' | 'low'
  checkedAt: string
  verificationState: CareerVerificationState
  canonicalUrl: string
  sourceEvidence: string
  publishedSalaryText: string
  deadline: string
  eligibility: string
  workMode: string
}

export type CareerWatchlistItem = {
  name: string
  result: 'open matching role' | 'no matching official posting found' | 'UNVERIFIED'
  sourceUrl: string
  checkedAt: string
  verificationState: CareerVerificationState
  verificationNote: string
  priority?: number
  monitoringRationale?: string
  programUrl?: string
}

export type CareerJobsManifest = {
  version: 1
  generatedAt: string
  sourcePolicy: string
  jobs: CareerJob[]
  watchlists: {
    priorityUniversities: CareerWatchlistItem[]
    koreanLargeCompanies: CareerWatchlistItem[]
    telecomCompanies: CareerWatchlistItem[]
    seniorGrowthCompanies: CareerWatchlistItem[]
    globalCompanies: CareerWatchlistItem[]
  }
  evidenceLimit: string
}

export const fallbackCareerJobsManifest: CareerJobsManifest = {
  version: 1,
  generatedAt: '',
  sourcePolicy: '',
  jobs: [],
  watchlists: { priorityUniversities: [], koreanLargeCompanies: [], telecomCompanies: [], seniorGrowthCompanies: [], globalCompanies: [] },
  evidenceLimit: '공식 공고 데이터를 불러오지 못했습니다.',
}

export async function loadCareerJobs(): Promise<CareerJobsManifest> {
  try {
    const response = await fetch(`${import.meta.env.BASE_URL}data/career-jobs.json`, { cache: 'no-store' })
    if (!response.ok) throw new Error(`career jobs request failed: ${response.status}`)
    const manifest = await response.json() as CareerJobsManifest
    return {
      ...manifest,
      jobs: manifest.jobs.filter((job) => job.verificationState === 'verified_detail'),
    }
  } catch {
    return fallbackCareerJobsManifest
  }
}
