export const atelierDirections = ['front', 'front-three-quarter', 'profile', 'back-three-quarter', 'back'] as const

export type AtelierDirection = (typeof atelierDirections)[number]
export type AtelierSpriteId = 'karina' | 'yuna' | 'goyounjung' | 'son' | 'faker' | 'muyeol'

const spriteBase = '/assets/team/atelier-sprites'

function directionSet(id: AtelierSpriteId): Record<AtelierDirection, string> {
  return Object.fromEntries(
    atelierDirections.map((direction) => [direction, `${spriteBase}/${id}/${direction}.png`]),
  ) as Record<AtelierDirection, string>
}

/**
 * Local public-asset contract for the Pixel Atelier directional sprites.
 * All six team members have a consistent front / 3-4 front / profile / 3-4 back / back set.
 */
export const teamAtelierSpriteMap: Record<AtelierSpriteId, Record<AtelierDirection, string>> = {
  karina: directionSet('karina'),
  yuna: directionSet('yuna'),
  goyounjung: directionSet('goyounjung'),
  son: directionSet('son'),
  faker: directionSet('faker'),
  muyeol: directionSet('muyeol'),
}
