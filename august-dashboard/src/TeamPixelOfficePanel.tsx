import { useEffect, useState } from 'react'
import { freshnessLabels, sceneStatusLabels, type PixelOfficeAgent } from './teamPixelOffice'

type TeamPixelOfficePanelProps = { agents: PixelOfficeAgent[]; toAssetSrc: (path: string) => string }
type Direction = 'south' | 'west' | 'east' | 'north'
type RouteSlot = { x: number; y: number; direction: Direction }

const zoneLabels: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '조율의 섬', research: '리서치 창가', visual: '비주얼 작업대',
  planning: '계획 선반', build: '빌드 작업대', validation: '검증 테이블',
}
const zoneNotes: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '요청과 handoff를 한 흐름으로 정리합니다.', research: '근거가 될 신호와 맥락을 살펴봅니다.', visual: '경험의 온도와 시각 언어를 다듬습니다.',
  planning: '범위와 다음 실행 단위를 선명하게 만듭니다.', build: '작동하는 화면과 자동화를 만듭니다.', validation: '공개 경계와 완성도를 마지막으로 확인합니다.',
}

// The six slots orbit the central circulation in a shared, deterministic cadence. A rotated starting
// index gives every agent a different slot at every tick, so sprites never overlap.
const route: RouteSlot[] = [
  { x: 24, y: 39, direction: 'east' }, { x: 42, y: 35, direction: 'south' }, { x: 69, y: 39, direction: 'west' },
  { x: 74, y: 65, direction: 'west' }, { x: 48, y: 70, direction: 'north' }, { x: 25, y: 64, direction: 'east' },
]
const directionIndex: Record<Direction, number> = { south: 0, west: 1, east: 2, north: 3 }

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(media.matches)
    sync(); media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  return reduced
}

function PixelWalker({ agent, agentIndex, step, toAssetSrc }: { agent: PixelOfficeAgent; agentIndex: number; step: number; toAssetSrc: (path: string) => string }) {
  const [failed, setFailed] = useState(false)
  const slot = route[(step + agentIndex) % route.length]
  const frame = step % 3
  const spriteStyle = {
    '--sprite-column': String(frame), '--sprite-row': String(directionIndex[slot.direction]),
    '--walker-x': `${slot.x}%`, '--walker-y': `${slot.y}%`,
  } as React.CSSProperties
  return (
    <div className="pixel-office-walker" style={spriteStyle} aria-hidden="true">
      <div className={`pixel-office-sprite-frame${failed ? ' pixel-office-sprite-frame--fallback' : ''}`}>
        <img
          src={toAssetSrc(failed ? agent.profileSrc : agent.pixelAvatarSrc)} alt="" width="96" height="192" decoding="async"
          onError={({ currentTarget }) => { if (!failed) { currentTarget.onerror = null; setFailed(true) } }}
        />
      </div>
    </div>
  )
}

function WorkIsland({ agent }: { agent: PixelOfficeAgent }) {
  return (
    <div className={`pixel-office-island pixel-office-island--${agent.zone}`} aria-hidden="true">
      <span className="pixel-office-island-desk" /><span className="pixel-office-island-screen" /><span className="pixel-office-island-chair" />
      <span className="pixel-office-island-detail" />
    </div>
  )
}

export function TeamPixelOfficePanel({ agents, toAssetSrc }: TeamPixelOfficePanelProps) {
  const reducedMotion = useReducedMotion()
  const [touring, setTouring] = useState(true)
  const [step, setStep] = useState(0)
  const moves = touring && !reducedMotion
  useEffect(() => {
    if (!moves) return undefined
    const timer = window.setInterval(() => setStep((current) => (current + 1) % route.length), 3600)
    return () => window.clearInterval(timer)
  }, [moves])

  return (
    <section className="pixel-office-panel pixel-office-panel--v2" aria-labelledby="pixel-office-title">
      <header className="pixel-office-intro">
        <div><p className="card-kicker">Hermes Pixel Office · v2</p><h3 id="pixel-office-title">하나의 오피스, 여섯 개의 느슨한 작업 섬</h3></div>
        <p>기존 공개 프로필의 팔레트만으로 만든 32×48 논리 픽셀 스프라이트가, 중앙 순환로를 따라 천천히 이동합니다.</p>
      </header>

      <div className="pixel-office-controls">
        <button type="button" className="pixel-office-tour-toggle" onClick={() => setTouring((current) => !current)} disabled={reducedMotion} aria-pressed={moves}>
          {reducedMotion ? '동작 줄이기' : moves ? '정지' : '둘러보기'}
        </button>
        <p>{reducedMotion ? '사용자 동작 줄이기 설정으로 이동을 멈췄습니다.' : moves ? '여섯 명이 겹치지 않는 고정 경로를 둘러봅니다.' : '장면을 정지했습니다. 둘러보기로 다시 이동합니다.'}</p>
      </div>

      <div className="pixel-office-scene" aria-hidden="true">
        <div className="pixel-office-wall"><span className="pixel-office-sign">HERMES · OFFICE</span><span className="pixel-office-window"><i /><i /><i /><i /></span><span className="pixel-office-plant"><i /><i /><i /></span></div>
        <div className="pixel-office-floor"><div className="pixel-office-circulation" /><div className="pixel-office-rug" />{agents.map((agent) => <WorkIsland agent={agent} key={agent.id} />)}{agents.map((agent, index) => <PixelWalker agent={agent} agentIndex={index} step={step} key={agent.id} toAssetSrc={toAssetSrc} />)}<span className="pixel-office-review-marker">Chris · 검토</span></div>
      </div>

      <div className="pixel-office-legend" aria-label="Pixel Office 범례"><span><i className="pixel-office-legend-mark pixel-office-legend-mark--person" aria-hidden="true" />공개 프로필 팔레트 기반 캐릭터</span><span><i className="pixel-office-legend-mark pixel-office-legend-mark--route" aria-hidden="true" />중앙 순환로</span><span><i className="pixel-office-legend-mark pixel-office-legend-mark--island" aria-hidden="true" />역할별 작업 섬</span></div>

      <div className="pixel-office-activity-list" aria-label="역할별 공개 가능한 작업 설명">
        {agents.map((agent) => <article key={agent.id}><div><p>{zoneLabels[agent.zone]}</p><h4>{agent.name}</h4></div><p>{zoneNotes[agent.zone]}</p><span>{sceneStatusLabels[agent.sceneStatus]} · {freshnessLabels[agent.freshness]}</span></article>)}
      </div>
    </section>
  )
}
