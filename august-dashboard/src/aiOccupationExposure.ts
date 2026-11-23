export type OccupationStatus = '자동화 압력 높음' | '재설계·증강'

export type OccupationExposure = {
  rank: number
  jobKo: string
  jobEn: string
  family: string
  score: number
  status: OccupationStatus
  rationale: string
  designerSpecialty?: string
}

export type OccupationExposureData = {
  title: string
  updatedAt: string
  methodology: string
  sources: { label: string; url: string }[]
  occupations: OccupationExposure[]
}

export async function loadOccupationExposure(): Promise<OccupationExposureData> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/ai-occupation-exposure-top100.json`)
  if (!response.ok) throw new Error(`Occupation exposure data could not be loaded (${response.status})`)
  const data = await response.json() as OccupationExposureData
  if (!Array.isArray(data.occupations) || data.occupations.length !== 100) throw new Error('Occupation exposure data must contain exactly 100 entries')
  return data
}
