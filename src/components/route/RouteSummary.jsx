import { formatKm, formatMin } from '../../lib/route.js'

/** 총 도보 거리·예상 시간·난이도 */
export default function RouteSummary({ route, large = false }) {
  return (
    <div className={`summary ${large ? 'summary-lg' : ''}`}>
      <div className="summary-item">
        <span className="summary-k">걷는 길</span>
        <span className="summary-v">
          {formatKm(route.totalWalk)} <span className="estimate">추정치</span>
        </span>
      </div>
      <div className="summary-item">
        <span className="summary-k">걷는 시간</span>
        <span className="summary-v">약 {formatMin(route.totalMinutes)}</span>
      </div>
      <div className="summary-item">
        <span className="summary-k">난이도</span>
        <span className={`level level-${route.difficulty}`}>{route.difficulty}</span>
      </div>
    </div>
  )
}
