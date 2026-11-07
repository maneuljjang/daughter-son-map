import { Fragment, useMemo } from 'react'
import BottomSheet from '../../components/ui/BottomSheet.jsx'
import RouteSummary from '../../components/route/RouteSummary.jsx'
import { SegmentInfo, FinalLegInfo } from '../../components/route/SegmentInfo.jsx'
import { CATEGORIES } from '../../data/places.js'
import { getCourse } from '../../data/courses.js'
import { START_GUIDE } from '../../data/transit.js'
import { buildSchedule, scheduleWarnings, fmtTime, formatWhen } from '../../lib/schedule.js'

export default function CourseSheet({ course, hardIds, likeIds, onRemove, onSwap, onPreview, onClose }) {
  const { route, stops, mode, courseId, date, time } = course
  const preset = courseId ? getCourse(courseId) : null
  const schedule = useMemo(() => buildSchedule(route, time), [route, time])
  const warnings = useMemo(() => scheduleWarnings(route, date, schedule), [route, date, schedule])

  if (!stops.length) {
    return (
      <BottomSheet title="내 코스" onClose={onClose}>
        <p>아직 담은 장소가 없어요. 장소를 담거나 추천 코스를 불러와 보세요.</p>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet title={preset ? preset.title : '내 코스'} onClose={onClose}>
      <RouteSummary route={route} />

      <div className="when">
        <span className="when-k">언제 오세요?</span>
        <input type="date" value={date} onChange={(e) => course.setField('date', e.target.value)} aria-label="날짜" />
        <input type="time" value={time} step={600} onChange={(e) => course.setField('time', e.target.value)} aria-label="출발 시각" />
        {(date || time) && <span className="when-v">{formatWhen(date, time)} 출발</span>}
      </div>
      {warnings.length > 0 && (
        <div className="notice-box warn" style={{ marginTop: 8 }} role="alert">
          {warnings.map((w) => (
            <div key={w.text}>⚠️ {w.text}</div>
          ))}
        </div>
      )}

      <div className="notice-box" style={{ marginTop: 10 }}>
        <b>출발</b> · {START_GUIDE(stops[0].name)}
      </div>
      {preset?.note && <div className="notice-box warn" style={{ marginTop: 8 }}>{preset.note}</div>}
      {mode === 'fixed' && route.uphillCount > 0 && (
        <div className="cs-resort">
          <span className="small">오르막 구간이 {route.uphillCount}곳 있어요.</span>
          <button className="btn btn-sm" onClick={course.resort}>내리막 순서로 정렬</button>
        </div>
      )}
      {mode === 'auto' && <p className="small muted" style={{ margin: '10px 0 0' }}>높은 곳 → 낮은 곳 순서로 자동 정렬했어요. ▲▼로 순서를 직접 바꿀 수 있어요.</p>}

      <ol className="cs-list">
        {stops.map((p, i) => {
          const hard = hardIds.includes(p.id)
          const like = likeIds.includes(p.id)
          const s = schedule?.[i]
          const warn = warnings.some((w) => w.id === p.id)
          return (
            <Fragment key={p.id}>
              <li className={`cs-stop ${hard ? 'hard' : ''}`}>
                <span className="cs-order">
                  <button className="cs-move" onClick={() => course.move(p.id, -1)} disabled={i === 0} aria-label={`${p.name} 위로`}>▲</button>
                  <span className="cs-num" style={{ background: CATEGORIES[p.cat].color }}>{i + 1}</span>
                  <button className="cs-move" onClick={() => course.move(p.id, 1)} disabled={i === stops.length - 1} aria-label={`${p.name} 아래로`}>▼</button>
                </span>
                <span className="cs-text">
                  <span className="cs-name">
                    {p.name} {p.hill && <span className="chip chip-hill">경사</span>}
                  </span>
                  <span className="small muted">
                    {CATEGORIES[p.cat].label}
                    {p.custom && ' · 카카오맵'}
                    {s && <b className={`cs-time ${warn ? 'warn' : ''}`}> · {fmtTime(s.arrive)} 도착 · {s.stay}분</b>}
                  </span>
                  {hard && <span className="cs-flag">😮‍💨 부모님: 여기는 힘들 것 같아요</span>}
                  {like && <span className="cs-like">👍 부모님이 좋대요</span>}
                </span>
                <span className="cs-actions">
                  <button className={`btn btn-sm ${hard ? 'btn-primary' : ''}`} onClick={() => onSwap(p.id)}>바꾸기</button>
                  <button className="icon-btn" onClick={() => onRemove(p.id)} aria-label={`${p.name} 빼기`}>✕</button>
                </span>
              </li>
              {route.segments[i] && <SegmentInfo segment={route.segments[i]} />}
            </Fragment>
          )
        })}
      </ol>
      <FinalLegInfo finalLeg={route.finalLeg} />

      <div className="cs-foot">
        <button className="btn btn-dark btn-block" onClick={onPreview}>
          💌 {hardIds.length ? '바꾼 코스로 ' : ''}초대장 보내기
        </button>
        <button className="btn btn-ghost btn-sm" onClick={course.clear}>코스 비우기</button>
      </div>
    </BottomSheet>
  )
}
