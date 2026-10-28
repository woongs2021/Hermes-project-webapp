import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { teamAtelierSpriteMap, type AtelierDirection, type AtelierSpriteId } from './teamAtelierSpriteMap'
import { freshnessLabels, sceneStatusLabels, type PixelOfficeAgent } from './teamPixelOffice'

type TeamPixelOfficePanelProps = { agents: PixelOfficeAgent[]; toAssetSrc: (path: string) => string }
type Direction = AtelierDirection
type Position = { x: number; y: number }
type Obstacle = { x: number; y: number; width: number; height: number }
type Walker = { position: Position; direction: Direction; mirrored: boolean; duration: number }
type RoleBubble = { title: string; description: string }
type DragState = { id: AtelierSpriteId; pointerId: number; offset: Position }

// The collision shape follows a character's grounded footprint, not its tall transparent canvas.
const playerHalfSize = { x: 3.6, y: 7 }
const walkerSeparation = 15
// Selected bubbles need headroom as well as the character's grounded footprint.
const sceneBounds = { minX: 10, maxX: 86, minY: 32, maxY: 93 }
const inputStep = 3
// Background analysis: shelves, walls, counters and three worktables are all non-walkable.
const nonWalkableAreas: Obstacle[] = [
  { x: 0, y: 0, width: 100, height: 12 }, // upper wall / window ledge
  { x: 0, y: 0, width: 10, height: 51 }, // left library and plant
  { x: 0, y: 47, width: 11, height: 53 }, // lower-left cabinet and plant
  { x: 86, y: 0, width: 14, height: 100 }, // right library and plant
  { x: 11, y: 16, width: 37, height: 27 }, // upper research table + stools
  { x: 68, y: 11, width: 20, height: 48 }, // right material table + stools
  { x: 31, y: 52, width: 38, height: 30 }, // central making table + stools
]
const initialPositions: Record<AtelierSpriteId, Position> = {
  karina: { x: 54, y: 39 }, yuna: { x: 16, y: 53 }, goyounjung: { x: 75, y: 68 },
  son: { x: 64, y: 43 }, faker: { x: 25, y: 80 }, muyeol: { x: 80, y: 86 },
}

const zoneLabels: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '조율', research: '리서치', visual: '비주얼',
  planning: '계획', build: '빌드', validation: '검증',
}
const zoneNotes: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '요청과 handoff를 한 흐름으로 정리합니다.', research: '근거가 될 신호와 맥락을 살펴봅니다.', visual: '경험의 온도와 시각 언어를 다듬습니다.',
  planning: '범위와 다음 실행 단위를 선명하게 만듭니다.', build: '작동하는 화면과 자동화를 구현합니다.', validation: '공개 경계와 최종 리스크를 확인합니다.',
}
const roleBubbles: Record<AtelierSpriteId, RoleBubble> = {
  karina: { title: 'Orchestrator', description: '요청을 실행 순서와 협업 흐름으로 조율합니다.' },
  yuna: { title: 'AI Researcher', description: 'AI 기술과 트렌드에서 판단 근거를 찾습니다.' },
  goyounjung: { title: 'Design Specialist', description: 'UX와 브랜드의 경험 언어를 설계합니다.' },
  son: { title: 'Product Manager', description: '범위와 우선순위를 실행 단위로 정리합니다.' },
  faker: { title: 'Developer', description: '프로토타입과 자동화를 구현합니다.' },
  muyeol: { title: 'Validator', description: '완성도와 리스크를 검증합니다.' },
}

function overlapsNonWalkableArea(position: Position) {
  return nonWalkableAreas.some((area) => (
    position.x + playerHalfSize.x > area.x
    && position.x - playerHalfSize.x < area.x + area.width
    && position.y + playerHalfSize.y > area.y
    && position.y - playerHalfSize.y < area.y + area.height
  ))
}

function isWalkable(position: Position) {
  return position.x - playerHalfSize.x >= sceneBounds.minX
    && position.x + playerHalfSize.x <= sceneBounds.maxX
    && position.y - playerHalfSize.y >= sceneBounds.minY
    && position.y + playerHalfSize.y <= sceneBounds.maxY
    && !overlapsNonWalkableArea(position)
}

function canTravel(from: Position, to: Position) {
  return Array.from({ length: 22 }, (_, index) => index / 21).every((step) => isWalkable({
    x: from.x + (to.x - from.x) * step,
    y: from.y + (to.y - from.y) * step,
  }))
}

function isSeparatedFromOthers(candidate: Position, occupiedPositions: Position[]) {
  return occupiedPositions.every((position) => Math.hypot(candidate.x - position.x, candidate.y - position.y) >= walkerSeparation)
}

function getDirection(deltaX: number, deltaY: number, current: Direction) {
  if (Math.abs(deltaX) + Math.abs(deltaY) < 0.1) return current
  if (Math.abs(deltaY) > Math.abs(deltaX)) return deltaY > 0 ? 'front' : 'back'
  return deltaY >= 0 ? 'front-three-quarter' : 'back-three-quarter'
}

function shouldMirror(direction: Direction, deltaX: number) {
  return direction !== 'front' && direction !== 'back' && deltaX > 0
}

function pickDestination(current: Position, occupiedPositions: Position[]) {
  for (let attempt = 0; attempt < 128; attempt += 1) {
    const candidate = {
      x: sceneBounds.minX + playerHalfSize.x + Math.random() * (sceneBounds.maxX - sceneBounds.minX - playerHalfSize.x * 2),
      y: sceneBounds.minY + playerHalfSize.y + Math.random() * (sceneBounds.maxY - sceneBounds.minY - playerHalfSize.y * 2),
    }
    if (isSeparatedFromOthers(candidate, occupiedPositions) && canTravel(current, candidate)) return candidate
  }
  return current
}

function createInitialWalkers(agents: PixelOfficeAgent[]) {
  return Object.fromEntries(agents.map((agent) => [agent.id, {
    position: initialPositions[agent.id], direction: 'front', mirrored: false, duration: 5067,
  }])) as Record<AtelierSpriteId, Walker>
}

export function TeamPixelOfficePanel({ agents, toAssetSrc }: TeamPixelOfficePanelProps) {
  const [walkers, setWalkers] = useState(() => createInitialWalkers(agents))
  const [selectedId, setSelectedId] = useState<AtelierSpriteId | null>(null)
  const [failedSprites, setFailedSprites] = useState<Partial<Record<AtelierSpriteId, boolean>>>({})
  const sceneRef = useRef<HTMLElement>(null)
  const selectedIdRef = useRef<AtelierSpriteId | null>(null)
  const previousSelectedIdRef = useRef<AtelierSpriteId | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const timersRef = useRef<number[]>([])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    const releasedId = previousSelectedIdRef.current
    previousSelectedIdRef.current = selectedId
    if (selectedId || !releasedId) return

    setWalkers((current) => {
      const walker = current[releasedId]
      const occupiedPositions = Object.entries(current)
        .filter(([id]) => id !== releasedId)
        .map(([, other]) => other.position)
      const next = pickDestination(walker.position, occupiedPositions)
      const deltaX = next.x - walker.position.x
      const deltaY = next.y - walker.position.y
      return {
        ...current,
        [releasedId]: {
          position: next,
          direction: getDirection(deltaX, deltaY, walker.direction),
          mirrored: shouldMirror(getDirection(deltaX, deltaY, walker.direction), deltaX),
          duration: 4133 + Math.round(Math.random() * 1734),
        },
      }
    })
  }, [selectedId])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const scheduleWalk = (id: AtelierSpriteId, initialDelay: number) => {
      const move = () => {
        if (selectedIdRef.current !== id) {
          setWalkers((current) => {
            const walker = current[id]
            const occupiedPositions = Object.entries(current)
              .filter(([otherId]) => otherId !== id)
              .map(([, other]) => other.position)
            const next = pickDestination(walker.position, occupiedPositions)
            const deltaX = next.x - walker.position.x
            const deltaY = next.y - walker.position.y
            const direction = getDirection(deltaX, deltaY, walker.direction)
            return {
              ...current,
              [id]: { position: next, direction, mirrored: shouldMirror(direction, deltaX), duration: 4133 + Math.round(Math.random() * 1734) },
            }
          })
        }
        timersRef.current.push(window.setTimeout(move, 6400 + Math.round(Math.random() * 1600)))
      }
      timersRef.current.push(window.setTimeout(move, initialDelay))
    }

    agents.forEach((agent, index) => scheduleWalk(agent.id, 600 + index * 720))
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [agents])

  function positionFromPointer(clientX: number, clientY: number): Position | null {
    const scene = sceneRef.current
    if (!scene) return null
    const rect = scene.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }

  function moveSelectedWalker(id: AtelierSpriteId, candidate: Position) {
    setWalkers((current) => {
      const walker = current[id]
      if (!isWalkable(candidate) || !canTravel(walker.position, candidate)) return current
      const deltaX = candidate.x - walker.position.x
      const deltaY = candidate.y - walker.position.y
      const direction = getDirection(deltaX, deltaY, walker.direction)
      return {
        ...current,
        [id]: { position: candidate, direction, mirrored: shouldMirror(direction, deltaX), duration: 0 },
      }
    })
  }

  function startDrag(id: AtelierSpriteId, event: PointerEvent<HTMLButtonElement>) {
    if (selectedIdRef.current !== id) return
    const pointerPosition = positionFromPointer(event.clientX, event.clientY)
    if (!pointerPosition) return
    const walker = walkers[id]
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      offset: { x: pointerPosition.x - walker.position.x, y: pointerPosition.y - walker.position.y },
    }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const pointerPosition = positionFromPointer(event.clientX, event.clientY)
    if (!pointerPosition) return
    moveSelectedWalker(drag.id, { x: pointerPosition.x - drag.offset.x, y: pointerPosition.y - drag.offset.y })
    event.preventDefault()
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  }

  function moveWithKeyboard(id: AtelierSpriteId, event: KeyboardEvent<HTMLButtonElement>) {
    const offsets: Partial<Record<string, Position>> = {
      ArrowUp: { x: 0, y: -inputStep }, ArrowDown: { x: 0, y: inputStep },
      ArrowLeft: { x: -inputStep, y: 0 }, ArrowRight: { x: inputStep, y: 0 },
    }
    const offset = offsets[event.key]
    if (!offset || selectedIdRef.current !== id) return
    event.preventDefault()
    const walker = walkers[id]
    moveSelectedWalker(id, { x: walker.position.x + offset.x, y: walker.position.y + offset.y })
  }

  function selectWalker(id: AtelierSpriteId, event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    if (selectedIdRef.current === id) return
    const previouslySelectedId = selectedIdRef.current
    const scene = sceneRef.current
    const rect = event.currentTarget.getBoundingClientRect()
    let stoppedPosition: Position | null = null
    if (scene) {
      const sceneRect = scene.getBoundingClientRect()
      const position = {
        x: ((rect.left + rect.width / 2 - sceneRect.left) / sceneRect.width) * 100,
        y: ((rect.top + rect.height * 0.92 - sceneRect.top) / sceneRect.height) * 100,
      }
      if (isWalkable(position)) stoppedPosition = position
    }

    setWalkers((current) => {
      const nextWalkers = { ...current }
      if (previouslySelectedId && previouslySelectedId !== id) {
        const previousWalker = current[previouslySelectedId]
        const occupiedPositions = Object.entries(current)
          .filter(([otherId]) => otherId !== previouslySelectedId)
          .map(([, other]) => other.position)
        const next = pickDestination(previousWalker.position, occupiedPositions)
        const deltaX = next.x - previousWalker.position.x
        const deltaY = next.y - previousWalker.position.y
        const direction = getDirection(deltaX, deltaY, previousWalker.direction)
        nextWalkers[previouslySelectedId] = { position: next, direction, mirrored: shouldMirror(direction, deltaX), duration: 4133 + Math.round(Math.random() * 1734) }
      }
      nextWalkers[id] = { ...current[id], position: stoppedPosition ?? current[id].position, direction: 'front', mirrored: false, duration: 0 }
      return nextWalkers
    })
    selectedIdRef.current = id
    setSelectedId(id)
  }

  return (
    <section className="pixel-atelier-panel" aria-labelledby="pixel-atelier-title">
      <header className="pixel-atelier-intro">
        <div>
          <p className="card-kicker">Hermes Team · Pixel Atelier</p>
          <h3 id="pixel-atelier-title">하나의 작업실, 여섯 개의 흔적</h3>
        </div>
        <p>여섯 동료가 작업대 사이의 여백을 조금 더 활기 있게 오가며, 이동 방향에 맞춰 모습을 바꿉니다.</p>
      </header>

      <figure ref={sceneRef} className="pixel-atelier-scene pixel-atelier-scene--active" onClick={() => setSelectedId(null)} aria-label="여섯 Hermes 동료가 Pixel Atelier 안을 이동합니다. 캐릭터를 선택하면 역할 설명을 확인하고, 배경을 선택하면 다시 이동합니다.">
        <img src={toAssetSrc('/assets/team/pixel-atelier-walkable.webp')} alt="따뜻한 도트 질감의 Atelier 공간. 세 개의 작업대 사이에 걸을 수 있는 여백이 있다." width="1536" height="868" />
        {agents.map((agent) => {
          const id = agent.id as AtelierSpriteId
          const walker = walkers[id]
          const fallback = failedSprites[id]
          const isSelected = selectedId === id
          const roleBubble = roleBubbles[id]
          const style = {
            left: `${walker.position.x}%`, top: `${walker.position.y}%`, '--walk-duration': `${walker.duration}ms`,
          } as CSSProperties
          return (
            <button
              key={id}
              type="button"
              className={`pixel-atelier-walker${walker.mirrored ? ' pixel-atelier-walker--mirrored' : ''}${fallback ? ' pixel-atelier-walker--fallback' : ''}${isSelected ? ' pixel-atelier-walker--selected' : ''}`}
              style={style}
              aria-label={`${agent.name}의 역할 보기`}
              aria-pressed={isSelected}
              onClick={(event) => selectWalker(id, event)}
              onPointerDown={(event) => startDrag(id, event)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={(event) => moveWithKeyboard(id, event)}
            >
              {isSelected && <span className={`pixel-atelier-role-bubble${walker.position.x < 25 ? ' pixel-atelier-role-bubble--left' : walker.position.x > 75 ? ' pixel-atelier-role-bubble--right' : ''}`}><b>{roleBubble.title}</b><span>{roleBubble.description}</span></span>}
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
            </button>
          )
        })}
        <figcaption><b>Pixel Atelier · 함께 이동 중</b><span>캐릭터를 선택해 역할을 보고, 드래그하거나 방향키로 움직여. 빈 배경을 선택하면 다시 이동해.</span></figcaption>
        <span className="pixel-atelier-review" aria-hidden="true">Chris · 검토</span>
      </figure>

      <div className="pixel-atelier-principles" aria-label="Pixel Atelier 안내">
        <span>6명의 동료</span><span>방향별 sprite 전환</span><span>배경 충돌 방지</span><span>역할 보기</span><span>모션 줄이기 지원</span>
      </div>

      <div className="pixel-atelier-activity-list" aria-label="역할별 공개 가능한 작업 설명">
        {agents.map((agent) => <article key={agent.id}><div><p>{zoneLabels[agent.zone]}</p><h4>{agent.name}</h4></div><p>{zoneNotes[agent.zone]}</p><span>{sceneStatusLabels[agent.sceneStatus]} · {freshnessLabels[agent.freshness]}</span></article>)}
      </div>
    </section>
  )
}
