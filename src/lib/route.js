import { distance, lerp } from './geo.js'
import { PLACE_LIST, STATION, getPlace } from '../data/places.js'

export const WALK_FACTOR = 1.3 // 직선 거리 × 1.3 = 추정 도보 거리
export const SPEED_M_PER_MIN = 60 // 부모님 걸음 기준 (일반 성인 약 67m/분보다 느리게)
export const FINAL_WALK_MAX = 600 // 마지막 장소 → 역이 이 거리(추정) 이하면 걸어서 귀가
export const LEVELS = [
  { max: 1200, label: '하' },
  { max: 1800, label: '중' },
  { max: Infinity, label: '상' },
]

export const walkDistance = (a, b) => distance(a, b) * WALK_FACTOR
export const walkMinutes = (m) => Math.max(1, Math.round(m / SPEED_M_PER_MIN))

/**
 * "높은 곳에서 시작해 낮은 곳으로 내려오는" 순서로 정렬합니다.
 * - altitudeRank(alt) 가 작은(높은) 그룹부터
 * - 같은 그룹 안에서는 바로 앞 장소에서 가까운 순 (첫 장소는 역에서 가장 먼 곳)
 */
export function sortDownhill(places, station = STATION) {
  const groups = new Map()
  for (const p of places) {
    if (!groups.has(p.alt)) groups.set(p.alt, [])
    groups.get(p.alt).push(p)
  }
  const result = []
  let prev = null
  for (const alt of [...groups.keys()].sort((a, b) => a - b)) {
    const remaining = [...groups.get(alt)]
    while (remaining.length) {
      let idx = 0
      for (let i = 1; i < remaining.length; i++) {
        const better = prev
          ? distance(prev, remaining[i]) < distance(prev, remaining[idx])
          : distance(station, remaining[i]) > distance(station, remaining[idx])
        if (better) idx = i
      }
      prev = remaining.splice(idx, 1)[0]
      result.push(prev)
    }
  }
  return result
}

export function difficultyOf(meters, hasHill) {
  let label = LEVELS.find((l) => meters <= l.max).label
  if (hasHill && label === '하') label = '중'
  return label
}

/**
 * 장소 목록(이미 정한 순서) → 루트 정보
 * 시작 지점까지는 버스/택시로 올라가므로 걷는 거리에 넣지 않습니다.
 */
export function buildRoute(stops, station = STATION) {
  if (!stops.length) {
    return { stops, segments: [], finalLeg: null, totalWalk: 0, totalMinutes: 0, difficulty: '하', hasHill: false, uphillCount: 0 }
  }
  const segments = []
  for (let i = 0; i < stops.length - 1; i++) {
    const from = stops[i]
    const to = stops[i + 1]
    const walk = walkDistance(from, to)
    segments.push({
      index: i,
      from,
      to,
      walk,
      minutes: walkMinutes(walk),
      uphill: to.alt < from.alt, // 숫자가 작아지면 더 높은 곳으로 올라감
    })
  }

  const last = stops[stops.length - 1]
  const finalWalk = walkDistance(last, station)
  const finalLeg = {
    from: last,
    to: station,
    walk: finalWalk,
    minutes: walkMinutes(finalWalk),
    walkable: finalWalk <= FINAL_WALK_MAX,
  }

  const walkSum = segments.reduce((s, x) => s + x.walk, 0) + (finalLeg.walkable ? finalWalk : 0)
  const hasHill = stops.some((p) => p.hill)

  return {
    stops,
    segments,
    finalLeg,
    totalWalk: walkSum,
    totalMinutes: walkMinutes(walkSum),
    difficulty: difficultyOf(walkSum, hasHill),
    hasHill,
    uphillCount: segments.filter((s) => s.uphill).length,
  }
}

/** 걷는 길을 그릴 좌표 목록 (마지막에 역까지 걸어가면 역도 포함) */
export function routePath(route) {
  const pts = route.stops.map((p) => ({ lat: p.lat, lng: p.lng }))
  if (route.finalLeg?.walkable) pts.push({ lat: route.finalLeg.to.lat, lng: route.finalLeg.to.lng })
  return pts
}

/**
 * 미리 걸어보기용 지점 목록: 장소 + 구간마다 중간 지점 2~3개
 */
export function walkSteps(route) {
  const steps = []
  const legs = [...route.segments]
  if (route.finalLeg?.walkable) legs.push({ ...route.finalLeg, index: route.segments.length })
  route.stops.forEach((stop, i) => {
    steps.push({ kind: 'stop', stop, order: i + 1, pos: { lat: stop.lat, lng: stop.lng } })
    const leg = legs[i]
    if (!leg) return
    const n = leg.walk > 450 ? 3 : 2
    for (let k = 1; k <= n; k++) {
      steps.push({ kind: 'path', from: leg.from, to: leg.to, part: k, parts: n, pos: lerp(leg.from, leg.to, k / (n + 1)) })
    }
  })
  if (route.finalLeg?.walkable) {
    const s = route.finalLeg.to
    steps.push({ kind: 'end', stop: s, pos: { lat: s.lat, lng: s.lng } })
  }
  // 각 지점에서 다음 지점을 바라보도록
  steps.forEach((s, i) => {
    s.next = steps[i + 1]?.pos || null
  })
  return steps
}

/**
 * 순서를 직접 정한 코스에 장소를 끼워 넣을 자리:
 * 내리막이 깨지지 않도록, 새 장소보다 낮은 곳(alt 가 더 큰 곳) 바로 앞
 */
export function insertIndex(stops, place) {
  const i = stops.findIndex((s) => s.alt > place.alt)
  return i === -1 ? stops.length : i
}

/** 같은 종류의 다른 장소 (경사 없는 곳 먼저, 그다음 가까운 순) */
export function alternativesFor(placeId, currentIds) {
  const target = getPlace(placeId)
  if (!target) return []
  return PLACE_LIST
    .filter((p) => p.cat === target.cat && !currentIds.includes(p.id))
    .map((p) => ({ place: p, dist: distance(target, p) }))
    .sort((a, b) => Number(a.place.hill) - Number(b.place.hill) || a.dist - b.dist)
}

export const formatKm = (m) => (m < 1000 ? `${Math.round(m / 10) * 10}m` : `${(m / 1000).toFixed(1)}km`)
export const formatMin = (min) => (min < 60 ? `${min}분` : `${Math.floor(min / 60)}시간${min % 60 ? ` ${min % 60}분` : ''}`)
