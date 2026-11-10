import { useEffect } from 'react'
import KakaoMap from '../components/map/KakaoMap.jsx'
import { SegmentInfo, FinalLegInfo } from '../components/route/SegmentInfo.jsx'
import { START_GUIDE } from '../data/transit.js'
import { CATEGORIES } from '../data/places.js'

/** 경로 자세히 보기 (전체 화면): 움직일 수 있는 지도 + 출발 안내 + 장소 사이 걷는 길 */
export default function RouteDetail({ route, stops, path, restrooms, fitKey, onWalk, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div className="iv-route" role="dialog" aria-modal="true" aria-label="경로 자세히 보기">
      <div className="iv-route-head">
        <h2 className="title iv-route-title">경로 자세히 보기</h2>
        <button className="btn btn-sm" onClick={onClose}>닫기</button>
      </div>
      <KakaoMap className="iv-route-map" stops={stops} path={path} restrooms={restrooms} showStation={route.finalLeg?.walkable} fitKey={fitKey} />
      <div className="iv-route-body">
        <p className="iv-route-hint">
          손가락으로 지도를 움직여 볼 수 있어요.
          {restrooms.length > 0 && ' 🚻는 화장실이에요.'}
        </p>
        <button className="btn btn-dark btn-block" onClick={onWalk}>🚶 길 미리 걸어보기</button>

        <div className="iv-route-start">
          <b>🚌 출발은 이렇게</b>
          <p>{START_GUIDE(stops[0].name)}</p>
        </div>

        <ol className="iv-route-steps">
          {stops.map((p, i) => (
            <li key={p.id}>
              <div className="iv-route-stop">
                <span className="iv-route-num" style={{ background: CATEGORIES[p.cat].color }}>{i + 1}</span>
                {p.name}
              </div>
              {route.segments[i] && <SegmentInfo segment={route.segments[i]} />}
            </li>
          ))}
        </ol>
        <FinalLegInfo finalLeg={route.finalLeg} />
        <p className="iv-route-note">운영 시간과 휴무일은 가기 전에 다시 확인할게요.</p>
      </div>
    </div>
  )
}
