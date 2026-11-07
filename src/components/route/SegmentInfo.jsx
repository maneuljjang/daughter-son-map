import { formatKm, formatMin } from '../../lib/route.js'
import { busTip, BUS } from '../../data/transit.js'

/** 장소와 장소 사이: 걷는 거리 + "힘들면 여기서 버스" */
export function SegmentInfo({ segment }) {
  return (
    <div className="segment">
      <div className="segment-line" aria-hidden="true" />
      <div className="segment-body">
        <div>
          🚶 걸어서 약 {formatMin(segment.minutes)} · {formatKm(segment.walk)}
          {segment.uphill && <span className="chip chip-hill" style={{ marginLeft: 6 }}>오르막</span>}
        </div>
        <div className="segment-bus">🚌 {busTip(segment.from.id)}</div>
      </div>
    </div>
  )
}

/** 마지막 장소 → 한성대입구역 */
export function FinalLegInfo({ finalLeg }) {
  if (!finalLeg) return null
  return (
    <div className="segment segment-final">
      <div className="segment-line" aria-hidden="true" />
      <div className="segment-body">
        {finalLeg.walkable ? (
          <div>🚉 한성대입구역까지 걸어서 약 {formatMin(finalLeg.minutes)} · {formatKm(finalLeg.walk)}</div>
        ) : (
          <div>🚌 여기서 마을버스 {BUS}나 택시로 한성대입구역까지 내려가요</div>
        )}
      </div>
    </div>
  )
}
