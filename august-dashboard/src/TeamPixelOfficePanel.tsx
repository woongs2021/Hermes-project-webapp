import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { teamAtelierSpriteMap, type AtelierDirection, type AtelierSpriteId } from './teamAtelierSpriteMap'
import { freshnessLabels, sceneStatusLabels, type PixelOfficeAgent } from './teamPixelOffice'

type TeamPixelOfficePanelProps = { agents: PixelOfficeAgent[]; toAssetSrc: (path: string) => string }
type Direction = AtelierDirection
type Position = { x: number; y: number }
type Obstacle = { x: number; y: number; width: number; height: number }
type Walker = { position: Position; direction: Direction; mirrored: boolean; duration: number }

const playerHalfSize = { x: 3, y: 8 }
const sceneBounds = { minX: 4, maxX: 96, minY: 9, maxY: 92 }
const worktables: Obstacle[] = [
  { x: 11, y: 17, width: 36, height: 25 },
  { x: 68, y: 12, width: 19, height: 45 },
  { x: 30, y: 52, width: 39, height: 28 },
]
const initialPositions: Record<AtelierSpriteId, Position> = {
  karina: { x: 53, y: 34 }, yuna: { x: 8, y: 74 }, goyounjung: { x: 77, y: 75 },
  son: { x: 60, y: 88 }, faker: { x: 91, y: 72 }, muyeol: { x: 18, y: 48 },
}

const zoneLabels: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '조율', research: '리서치', visual: '비주얼',
  planning: '계획', build: '빌드', validation: '검증',
}
const zoneNotes: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '요청과 handoff를 한 흐름으로 정리합니다.', research: '근거가 될 신호와 맥락을 살펴봅니다.', visual: '경험의 온도와 시각 언어를 다듬습니다.',
  planning: '범위와 다음 실행 단위를 선명하게 만듭니다.', build: '작동하는 화면과 자동화를 만듭니다.', validation: '공개 경계와 완성도를 마지막으로 확인합니다.',
}

function overlapsWorktable(position: Position) {
  return worktables.some((table) => (
    position.x + playerHalfSize.x > table.x
    && position.x - playerHalfSize.x < table.x + table.width
    && position.y + playerHalfSize.y > table.y
    && position.y - playerHalfSize.y < table.y + table.height
  ))
}

function isWalkable(position: Position) {
  return position.x >= sceneBounds.minX && position.x <= sceneBounds.maxX
    && position.y >= sceneBounds.minY && position.y <= sceneBounds.maxY
    && !overlapsWorktable(position)
}

function canTravel(from: Position, to: Position) {
  return Array.from({ length: 18 }, (_, index) => index / 17).every((step) => isWalkable({
    x: from.x + (to.x - from.x) * step,
    y: from.y + (to.y - from.y) * step,
  }))
}

function getDirection(deltaX: number, deltaY: number, current: Direction) {
  if (Math.abs(deltaX) + Math.abs(deltaY) < 0.1) return current
  if (Math.abs(deltaY) > Math.abs(deltaX)) return deltaY > 0 ? 'front' : 'back'
  return deltaY > 0 ? 'front-three-quarter' : 'back-three-quarter'
}

function shouldMirror(direction: Direction, deltaX: number) {
  return direction !== 'front' && direction !== 'back' && deltaX > 0
}

function pickDestination(current: Position) {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const candidate = {
      x: sceneBounds.minX + Math.random() * (sceneBounds.maxX - sceneBounds.minX),
      y: sceneBounds.minY + Math.random() * (sceneBounds.maxY - sceneBounds.minY),
    }
    if (canTravel(current, candidate)) return candidate
  }
  return current
}

function createInitialWalkers(agents: PixelOfficeAgent[]) {
  return Object.fromEntries(agents.map((agent) => [agent.id, {
    position: initialPositions[agent.id], direction: 'front', mirrored: false, duration: 7600,
  }])) as Record<AtelierSpriteId, Walker>
}

export function TeamPixelOfficePanel({ agents, toAssetSrc }: TeamPixelOfficePanelProps) {
  const [walkers, setWalkers] = useState(() => createInitialWalkers(agents))
  const [failedSprites, setFailedSprites] = useState<Partial<Record<AtelierSpriteId, boolean>>>({})
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const scheduleWalk = (id: AtelierSpriteId, initialDelay: number) => {
      const move = () => {
        setWalkers((current) => {
          const walker = current[id]
          const next = pickDestination(walker.position)
          const deltaX = next.x - walker.position.x
          const deltaY = next.y - walker.position.y
          const duration = 6200 + Math.round(Math.random() * 2600)
          const direction = getDirection(deltaX, deltaY, walker.direction)
          return {
            ...current,
            [id]: { position: next, direction, mirrored: shouldMirror(direction, deltaX), duration },
          }
        })
        timersRef.current.push(window.setTimeout(move, 9600 + Math.round(Math.random() * 2400)))
      }
      timersRef.current.push(window.setTimeout(move, initialDelay))
    }

    agents.forEach((agent, index) => scheduleWalk(agent.id, 800 + index * 1100))
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [agents])

  return (
    <section className="pixel-atelier-panel" aria-labelledby="pixel-atelier-title">
      <header className="pixel-atelier-intro">
        <div>
          <p className="card-kicker">Hermes Team · Pixel Atelier</p>
          <h3 id="pixel-atelier-title">하나의 작업실, 여섯 개의 흔적</h3>
        </div>
        <p>여섯 동료가 작업대 사이의 여백을 천천히 오가며, 이동 방향에 맞춰 모습을 바꿉니다.</p>
      </header>

      <figure className="pixel-atelier-scene pixel-atelier-scene--active" aria-label="여섯 Hermes 동료가 Pixel Atelier 안을 천천히 이동합니다. 방향에 따라 각 캐릭터의 모습이 바뀝니다.">
        <img src={toAssetSrc('/assets/team/pixel-atelier-walkable.webp')} alt="따뜻한 도트 질감의 Atelier 공간. 세 개의 작업대 사이에 걸을 수 있는 여백이 있다." width="1536" height="868" />
        {agents.map((agent) => {
          const id = agent.id as AtelierSpriteId
          const walker = walkers[id]
          const fallback = failedSprites[id]
          const style = {
            left: `${walker.position.x}%`, top: `${walker.position.y}%`, '--walk-duration': `${walker.duration}ms`,
          } as CSSProperties
          return (
            <span
              key={id}
              className={`pixel-atelier-walker${walker.mirrored ? ' pixel-atelier-walker--mirrored' : ''}${fallback ? ' pixel-atelier-walker--fallback' : ''}`}
              style={style}
              aria-label={`${agent.name} · ${agent.roleLabel}`}
            >
              <img
                src={toAssetSrc(fallback ? agent.pixelAvatarSrc : teamAtelierSpriteMap[id][walker.direction])}
                alt=""
                width={fallback ? 96 : 400}
                height={fallback ? 192 : 1500}
                draggable="false"
                onError={({ currentTarget }) => {
                  if (!fallback) {
                    currentTarget.onerror = null
                    setFailedSprites((current) => ({ ...current, [id]: true }))
                  }
                }}
              />
            </span>
          )
        })}
        <figcaption><b>Pixel Atelier · 함께 이동 중</b><span>각 동료는 작업대를 피해, 조용한 속도로 다음 작업 자리로 움직여.</span></figcaption>
        <span className="pixel-atelier-review" aria-hidden="true">Chris · 검토</span>
      </figure>

      <div className="pixel-atelier-principles" aria-label="Pixel Atelier 안내">
        <span>6명의 동료</span><span>방향별 sprite 전환</span><span>작업대 충돌 방지</span><span>모션 줄이기 지원</span>
      </div>

      <div className="pixel-atelier-activity-list" aria-label="역할별 공개 가능한 작업 설명">
        {agents.map((agent) => <article key={agent.id}><div><p>{zoneLabels[agent.zone]}</p><h4>{agent.name}</h4></div><p>{zoneNotes[agent.zone]}</p><span>{sceneStatusLabels[agent.sceneStatus]} · {freshnessLabels[agent.freshness]}</span></article>)}
      </div>
    </section>
  )
}
