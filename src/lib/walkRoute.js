// 실제 걷는 길 (TMAP 보행자 경로 API)
// - .env 에 VITE_TMAP_KEY 가 있을 때만 써요. 없거나 실패하면 지금처럼 "직선 × 1.3" 추정치를 씁니다.
// - 같은 구간은 이 기기에 저장해 두고 다시 부르지 않아요 (무료 사용량 아끼기).
export const TMAP_KEY = import.meta.env.VITE_TMAP_KEY || ''
const URL = 'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1&format=json'
const STORE = 'dsm.walk.v1'

export const legKey = (a, b) => `${a.lat.toFixed(5)},${a.lng.toFixed(5)}>${b.lat.toFixed(5)},${b.lng.toFixed(5)}`

let memory = null
function store() {
  if (memory) return memory
  try {
    memory = JSON.parse(localStorage.getItem(STORE)) || {}
  } catch {
    memory = {}
  }
  return memory
}
function save(key, value) {
  store()[key] = value
  try {
    localStorage.setItem(STORE, JSON.stringify(memory))
  } catch {
    /* 저장이 막혀도 이번 화면에서는 기억 */
  }
}

/** TMAP 응답(GeoJSON) → { meters, coords: [{lat, lng}] } */
export function parseTmap(json) {
  const features = json?.features
  if (!Array.isArray(features) || !features.length) return null
  const meters = features[0]?.properties?.totalDistance
  const coords = []
  for (const f of features) {
    if (f.geometry?.type !== 'LineString') continue
    for (const [lng, lat] of f.geometry.coordinates) {
      const last = coords[coords.length - 1]
      if (!last || last.lat !== lat || last.lng !== lng) coords.push({ lat, lng })
    }
  }
  if (!Number.isFinite(meters) || coords.length < 2) return null
  return { meters, coords }
}

export async function fetchWalk(a, b) {
  if (!TMAP_KEY) return null
  const key = legKey(a, b)
  const cached = store()[key]
  if (cached) return cached
  try {
    const r = await fetch(URL, {
      method: 'POST',
      headers: { appKey: TMAP_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        startX: a.lng,
        startY: a.lat,
        endX: b.lng,
        endY: b.lat,
        startName: encodeURIComponent('출발'),
        endName: encodeURIComponent('도착'),
        reqCoordType: 'WGS84GEO',
        resCoordType: 'WGS84GEO',
      }),
    })
    if (!r.ok) return null
    const walk = parseTmap(await r.json())
    if (walk) save(key, walk)
    return walk
  } catch {
    return null
  }
}
