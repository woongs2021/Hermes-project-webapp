import {
  freshnessLabels,
  sceneStatusLabels,
  type PixelOfficeAgent,
} from './teamPixelOffice'

type TeamPixelOfficePanelProps = {
  agents: PixelOfficeAgent[]
  toAssetSrc: (path: string) => string
}

const zoneLabels: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '조율의 책상',
  research: '리서치 창가',
  visual: '비주얼 테이블',
  planning: '계획 선반',
  build: '빌드 작업대',
  validation: '검증 테이블',
}

const zoneNotes: Record<PixelOfficeAgent['zone'], string> = {
  coordination: '요청과 handoff를 한 흐름으로 정리합니다.',
  research: '근거가 될 신호와 맥락을 살펴봅니다.',
  visual: '경험의 온도와 시각 언어를 다듬습니다.',
  planning: '범위와 다음 실행 단위를 선명하게 만듭니다.',
  build: '작동하는 화면과 자동화를 만듭니다.',
  validation: '공개 경계와 완성도를 마지막으로 확인합니다.',
}

function PixelOfficeZone({ agent, toAssetSrc }: { agent: PixelOfficeAgent; toAssetSrc: (path: string) => string }) {
  const zoneLabel = zoneLabels[agent.zone]
  const statusLabel = sceneStatusLabels[agent.sceneStatus]
  const freshnessLabel = freshnessLabels[agent.freshness]

  return (
    <article
      className={`pixel-office-zone pixel-office-zone--${agent.zone}`}
    >
      <div className="pixel-office-zone-furniture" aria-hidden="true">
        <span className="pixel-office-desk" />
        <span className="pixel-office-paper pixel-office-paper--one" />
        <span className="pixel-office-paper pixel-office-paper--two" />
        <span className="pixel-office-lamp" />
      </div>
      <img
        className="pixel-office-sprite"
        src={toAssetSrc(agent.pixelAvatarSrc)}
        alt=""
        width="64"
        height="64"
        decoding="async"
      />
      <div className="pixel-office-zone-copy">
        <p className="pixel-office-zone-label">{zoneLabel}</p>
        <h4>{agent.name}</h4>
        <p className="pixel-office-role">{agent.roleLabel}</p>
      </div>
      <div className="pixel-office-zone-state" aria-label={`상태: ${statusLabel}, 갱신: ${freshnessLabel}`}>
        <span>{statusLabel}</span>
        <span>{freshnessLabel}</span>
      </div>
    </article>
  )
}

export function TeamPixelOfficePanel({ agents, toAssetSrc }: TeamPixelOfficePanelProps) {
  return (
    <section className="pixel-office-panel" aria-labelledby="pixel-office-title">
      <header className="pixel-office-intro">
        <div>
          <p className="card-kicker">Hermes Pixel Office</p>
          <h3 id="pixel-office-title">한 사람의 질문이, 함께 검토되는 여섯 개의 자리</h3>
        </div>
        <p>
          지금 이 장면은 역할과 공개 가능한 상태만 담은 조용한 작업 지도입니다. 정확한 실행 정보 대신,
          각 자리가 무엇을 맡는지 읽을 수 있습니다.
        </p>
      </header>

      <div className="pixel-office-legend" aria-label="장면 범례">
        <span><i className="pixel-office-legend-mark pixel-office-legend-mark--person" aria-hidden="true" />기존 프로필에서 만든 픽셀 아바타</span>
        <span><i className="pixel-office-legend-mark pixel-office-legend-mark--status" aria-hidden="true" />공개 가능한 상태</span>
        <span><i className="pixel-office-legend-mark pixel-office-legend-mark--freshness" aria-hidden="true" />갱신 정보가 없으면 정보 없음</span>
      </div>

      <div className="pixel-office-scene" aria-hidden="true">
        <div className="pixel-office-wall" aria-hidden="true">
          <span className="pixel-office-window"><i /><i /><i /><i /></span>
          <span className="pixel-office-wall-note">HERMES OFFICE</span>
          <span className="pixel-office-plant"><i /><i /><i /></span>
        </div>
        <div className="pixel-office-room">
          <div className="pixel-office-review-marker" aria-label="Chris의 검토 도착점">
            <span aria-hidden="true" />
            <small>Chris · 검토</small>
          </div>
          {agents.map((agent) => <PixelOfficeZone agent={agent} key={agent.id} toAssetSrc={toAssetSrc} />)}
        </div>
      </div>

      <div className="pixel-office-activity-list" aria-label="역할별 공개 상태 설명">
        {agents.map((agent) => (
          <article key={agent.id}>
            <div>
              <p>{zoneLabels[agent.zone]}</p>
              <h4>{agent.name}</h4>
            </div>
            <p>{zoneNotes[agent.zone]}</p>
            <span>{sceneStatusLabels[agent.sceneStatus]} · {freshnessLabels[agent.freshness]}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
