// 카카오맵에서 새로 넣은 장소의 높이(altitudeRank) 추정
//  1) Open-Meteo 고도 API(무료, 키 없음)로 해발 높이(m)를 받아 등급으로 바꾸고
//  2) 실패하면 가까운 기존 장소들의 등급으로 추정합니다.
// 기준값은 기존 장소들의 실제 고도로 맞췄어요 (2026-11 측정: 길상사 115m, 가구박물관 154m,
// 북정마을 111m, 수연산방 85m, 선잠박물관 64m, 나폴레옹과자점 46m …).
import { PLACE_LIST } from '../data/places.js'
import { distance } from './geo.js'

const THRESHOLDS = [
  [135, 1],
  [92, 2],
  [70, 3],
  [53, 4],
]

export function rankFromElevation(m) {
  for (const [min, rank] of THRESHOLDS) if (m >= min) return rank
  return 5
}

/** 가까운 기존 장소 3곳의 등급을 거리로 가중 평균 */
export function rankFromNeighbors(pos) {
  const near = PLACE_LIST.map((p) => ({ p, d: Math.max(distance(pos, p), 20) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3)
  const w = near.reduce((s, x) => s + 1 / x.d, 0)
  return Math.round(near.reduce((s, x) => s + x.p.alt / x.d, 0) / w)
}

export async function fetchElevation(pos, timeoutMs = 2500) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const url = `https://api.open-meteo.com/v1/elevation?latitude=${pos.lat}&longitude=${pos.lng}`
    const r = await fetch(url, { signal: ctrl.signal })
    const j = await r.json()
    const m = j?.elevation?.[0]
    return typeof m === 'number' ? m : null
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

/** place 에 alt(등급)와 elev(m, 있으면)를 채워서 돌려줍니다 */
export async function withAltitude(place) {
  const elev = await fetchElevation(place)
  return { ...place, elev, alt: elev == null ? rankFromNeighbors(place) : rankFromElevation(elev) }
}
