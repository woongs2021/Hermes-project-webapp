export const teamPixelAvatarMap = {
  karina: {
    source: '/assets/team/karina_profile.jpg',
    sprite: '/assets/team/pixel/karina.png',
  },
  yuna: {
    source: '/assets/team/yuna_profile.jpg',
    sprite: '/assets/team/pixel/yuna.png',
  },
  goyounjung: {
    source: '/assets/team/goyounjung_profile.jpg',
    sprite: '/assets/team/pixel/goyounjung.png',
  },
  son: {
    source: '/assets/team/son_profile.jpg',
    sprite: '/assets/team/pixel/son.png',
  },
  faker: {
    source: '/assets/team/faker_profile.jpg',
    sprite: '/assets/team/pixel/faker.png',
  },
  muyeol: {
    source: '/assets/team/muyeol_profile.jpg',
    sprite: '/assets/team/pixel/muyeol.png',
  },
} as const

export type TeamPixelAvatarId = keyof typeof teamPixelAvatarMap
