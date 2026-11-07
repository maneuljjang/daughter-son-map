// 날짜·시간을 넣으면: 장소별 도착 시각표 + 쉬는 날/영업시간 경고
import { josa } from '../feedback/josa.js'

export const STAY = { food: 70, cafe: 40, fun: 50, walk: 30 } // 머무는 시간(분) 기본값
const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
export const fmtTime = (min) => `${String(Math.floor(min / 60) % 24).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`

export const stayOf = (p) => p.stay || STAY[p.cat] || 40

/** '2026-11-23' → 0(일)~6(토). 시간대 영향 없이 계산 */
export function weekdayOf(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

/** '2026-11-23', '12:00' → '11월 23일 (월) 낮 12시' */
export function formatWhen(date, time) {
  const parts = []
  if (date) {
    const [, m, d] = date.split('-').map(Number)
    parts.push(`${m}월 ${d}일 (${DAYS[weekdayOf(date)]})`)
  }
  if (time) {
    const min = toMin(time)
    const h = Math.floor(min / 60)
    const label = h < 11 ? '오전' : h < 14 ? '낮' : h < 18 ? '오후' : '저녁'
    const h12 = h > 12 ? h - 12 : h
    parts.push(`${label} ${h12}시${min % 60 ? ` ${min % 60}분` : ''}`)
  }
  return parts.join(' ')
}

/** 장소마다 도착·출발 시각 (분 단위) */
export function buildSchedule(route, time) {
  if (!time || !route.stops.length) return null
  let t = toMin(time)
  return route.stops.map((p, i) => {
    const arrive = t
    const stay = stayOf(p)
    t = arrive + stay + (route.segments[i]?.minutes || 0)
    return { id: p.id, arrive, stay, leave: arrive + stay }
  })
}

/** 그날 쉬는 곳, 영업시간 밖에 도착하는 곳 */
export function scheduleWarnings(route, date, schedule) {
  const out = []
  const wd = date ? weekdayOf(date) : null
  route.stops.forEach((p, i) => {
    if (wd != null && p.closed?.includes(wd)) {
      out.push({ id: p.id, text: `${p.name}${josa(p.name, '은', '는')} ${DAYS[wd]}요일에 쉬어요.` })
    }
    const s = schedule?.[i]
    if (s && p.hours) {
      const open = toMin(p.hours.open)
      const close = toMin(p.hours.close)
      if (s.arrive < open || s.arrive >= close) {
        out.push({ id: p.id, text: `${p.name}${josa(p.name, '은', '는')} ${p.hours.open}~${p.hours.close}에만 열어요. (도착 예정 ${fmtTime(s.arrive)})` })
      } else if (s.leave > close) {
        out.push({ id: p.id, text: `${p.name}${josa(p.name, '은', '는')} ${p.hours.close}에 닫아요. 조금 서둘러야 해요. (도착 예정 ${fmtTime(s.arrive)})` })
      }
    }
  })
  return out
}
