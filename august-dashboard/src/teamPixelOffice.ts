import { teamPixelAvatarMap, type TeamPixelAvatarId } from './teamPixelAvatarMap'

export type PublicSceneStatus = 'needs-attention'
export type PublicFreshness = 'unknown'

export type PixelOfficeAgentId = 'karina' | 'yuna' | 'goyounjung' | 'son' | 'faker' | 'muyeol'

type PixelOfficeZone = 'coordination' | 'research' | 'visual' | 'planning' | 'build' | 'validation'

export type PixelOfficeAgent = {
  id: PixelOfficeAgentId
  name: string
  roleLabel: string
  profileSrc: string
  pixelAvatarSrc: string
  zone: PixelOfficeZone
  sceneStatus: PublicSceneStatus
  freshness: PublicFreshness
  activityLabel: string
  loopOrder: number
}

export const sceneStatusLabels: Record<PublicSceneStatus, string> = {
  'needs-attention': '확인 필요',
}

export const freshnessLabels: Record<PublicFreshness, string> = {
  unknown: '정보 없음',
}

type AgentDefinition = Omit<PixelOfficeAgent, 'profileSrc' | 'pixelAvatarSrc' | 'sceneStatus' | 'freshness'> & {
  avatarId: TeamPixelAvatarId
}

const agentDefinitions: readonly AgentDefinition[] = [
  {
    id: 'karina',
    name: 'Karina',
    roleLabel: 'Coordination Lead · CDO Partner',
    avatarId: 'karina',
    zone: 'coordination',
    activityLabel: '요청을 실행 순서와 팀 handoff로 정리합니다.',
    loopOrder: 2,

  },
  {
    id: 'yuna',
    name: 'Yuna',
    roleLabel: 'Research Intelligence',
    avatarId: 'yuna',
    zone: 'research',
    activityLabel: '판단에 필요한 리서치 신호를 수집합니다.',
    loopOrder: 3,

  },
  {
    id: 'goyounjung',
    name: 'Go Youn-jung',
    roleLabel: 'Visual / Experience Muse',
    avatarId: 'goyounjung',
    zone: 'visual',
    activityLabel: '따뜻하고 인간적인 경험의 시각 언어를 다듬습니다.',
    loopOrder: 3,

  },
  {
    id: 'son',
    name: 'Son',
    roleLabel: 'Scope / Priority Strategist',
    avatarId: 'son',
    zone: 'planning',
    activityLabel: '범위와 수용 기준을 다음 실행 단위로 정리합니다.',
    loopOrder: 3,

  },
  {
    id: 'faker',
    name: 'Faker',
    roleLabel: 'Coding / Automation Builder',
    avatarId: 'faker',
    zone: 'build',
    activityLabel: '검증 가능한 프로토타입과 자동화를 구현합니다.',
    loopOrder: 3,

  },
  {
    id: 'muyeol',
    name: 'Muyeol',
    roleLabel: 'QA / Risk Validation',
    avatarId: 'muyeol',
    zone: 'validation',
    activityLabel: '공개 경계와 최종 리스크를 확인합니다.',
    loopOrder: 4,

  },
]

/**
 * Converts the fixed public profile-to-avatar mapping.
 * The scene intentionally exposes no operational state, timing, metadata, logs, prompts, IDs, or runtime data.
 */
export function createTeamPixelOfficeAgents(): PixelOfficeAgent[] {
  return agentDefinitions.map((definition) => {
    const avatar = teamPixelAvatarMap[definition.avatarId]

    return {
      id: definition.id,
      name: definition.name,
      roleLabel: definition.roleLabel,
      profileSrc: avatar.source,
      pixelAvatarSrc: avatar.sprite,
      zone: definition.zone,
      // No public-safe runtime status is available, so never infer one from private operations.
      sceneStatus: 'needs-attention',
      freshness: 'unknown',
      activityLabel: definition.activityLabel,
      loopOrder: definition.loopOrder,
    }
  })
}
