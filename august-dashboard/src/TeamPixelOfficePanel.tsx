import { freshnessLabels, sceneStatusLabels, type PixelOfficeAgent } from './teamPixelOffice'

type TeamPixelOfficePanelProps = { agents: PixelOfficeAgent[]; toAssetSrc: (path: string) => string }

const zoneLabels: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '조율', research: '리서치', visual: '비주얼',
  planning: '계획', build: '빌드', validation: '검증',
}
const zoneNotes: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '요청과 handoff를 한 흐름으로 정리합니다.', research: '근거가 될 신호와 맥락을 살펴봅니다.', visual: '경험의 온도와 시각 언어를 다듬습니다.',
  planning: '범위와 다음 실행 단위를 선명하게 만듭니다.', build: '작동하는 화면과 자동화를 만듭니다.', validation: '공개 경계와 완성도를 마지막으로 확인합니다.',
}

export function TeamPixelOfficePanel({ agents, toAssetSrc }: TeamPixelOfficePanelProps) {
  return (
    <section className="pixel-atelier-panel" aria-labelledby="pixel-atelier-title">
      <header className="pixel-atelier-intro">
        <div>
          <p className="card-kicker">Hermes Team · Pixel Atelier</p>
          <h3 id="pixel-atelier-title">하나의 작업실, 여섯 개의 흔적</h3>
        </div>
        <p>게임처럼 누가 어디를 걷는지 보여주기보다, 함께 놓아둔 재료와 작업의 결로 팀의 존재를 읽습니다.</p>
      </header>

      <figure className="pixel-atelier-scene">
        <img src={toAssetSrc('/assets/team/pixel-atelier-studio.webp')} alt="종이, 견본, 재료 책, 작업대와 자연광으로 구성된 따뜻한 Hermes 작업실" width="1536" height="864" />
        <figcaption><b>Presence, not performance.</b><span>각 역할은 상태표가 아니라 남겨진 작업의 온도로 읽힙니다.</span></figcaption>
        <span className="pixel-atelier-review" aria-hidden="true">Chris · 검토</span>
      </figure>

      <div className="pixel-atelier-principles" aria-label="Pixel Atelier 방향">
        <span>사람 대신 흔적</span><span>타일맵 대신 아틀리에</span><span>걷기 대신 호흡</span>
      </div>

      <div className="pixel-atelier-activity-list" aria-label="역할별 공개 가능한 작업 설명">
        {agents.map((agent) => <article key={agent.id}><div><p>{zoneLabels[agent.zone]}</p><h4>{agent.name}</h4></div><p>{zoneNotes[agent.zone]}</p><span>{sceneStatusLabels[agent.sceneStatus]} · {freshnessLabels[agent.freshness]}</span></article>)}
      </div>
    </section>
  )
}
