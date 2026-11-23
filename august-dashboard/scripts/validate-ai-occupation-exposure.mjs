import { readFileSync } from 'node:fs'

const data = JSON.parse(readFileSync(new URL('../public/data/ai-occupation-exposure-top100.json', import.meta.url), 'utf8'))
const requiredSpecialties = ['UI/UX', 'graphic', 'visual communication', 'web/digital interface', 'motion', '3D/animation', 'brand identity', 'package', 'product/industrial', 'interior/exhibition', 'fashion', 'technical illustration']
const requiredSources = ['ilo.org', 'oecd.org', 'arxiv.org/abs/2303.10130', 'anthropic.com', 'onetonline.org']
const errors = []
if (!Array.isArray(data.occupations) || data.occupations.length !== 100) errors.push('occupations must contain exactly 100 entries')
const ranks = data.occupations.map((item) => item.rank)
if (new Set(ranks).size !== 100 || !ranks.every((rank, index) => rank === index + 1)) errors.push('ranks must be unique and sequential 1–100')
for (const item of data.occupations) {
  if (!item.jobKo || !item.jobEn || !item.family || !item.rationale) errors.push(`rank ${item.rank}: missing required text`)
  if (!Number.isInteger(item.score) || item.score < 0 || item.score > 100) errors.push(`rank ${item.rank}: score must be an integer from 0 to 100`)
  if (!['자동화 압력 높음', '재설계·증강'].includes(item.status)) errors.push(`rank ${item.rank}: invalid status`)
}
const specialties = data.occupations.filter((item) => item.family === '디자인').map((item) => item.designerSpecialty)
for (const specialty of requiredSpecialties) if (!specialties.includes(specialty)) errors.push(`missing designer specialty: ${specialty}`)
if (!Array.isArray(data.sources) || !requiredSources.every((source) => data.sources.some((item) => item.url.includes(source)))) errors.push('required source URLs are missing')
if (!data.methodology?.includes('휴리스틱') || !data.methodology.includes('인과')) errors.push('methodology disclaimer is incomplete')
if (errors.length) { console.error(`AI occupation exposure validation failed:\n- ${errors.join('\n- ')}`); process.exit(1) }
console.log(`AI occupation exposure validation passed: ${data.occupations.length} occupations, ${specialties.length} designer specialties, ${data.sources.length} sources.`)
