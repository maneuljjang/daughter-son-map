// 코스 근처 화장실 (카카오맵 '화장실' 검색)
// 성북동 안에는 등록된 곳이 적어서(개방화장실 5곳 정도), 동 경계와 상관없이 장소 400m 안이면 보여 줘요.
import { loadKakaoMaps } from './kakaoLoader.js'
import { distance } from './geo.js'

export const RESTROOM_RADIUS = 400
const cache = new Map()

async function searchAround(maps, ps, p) {
  const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`
  if (cache.has(key)) return cache.get(key)
  const docs = await new Promise((resolve) =>
    ps.keywordSearch('화장실', (d, s) => resolve(s === maps.services.Status.OK ? d : []), {
      location: new maps.LatLng(p.lat, p.lng),
      radius: RESTROOM_RADIUS,
      sort: maps.services.SortBy.DISTANCE,
    }),
  )
  const list = docs
    .filter((d) => /화장실/.test(d.category_name) || /화장실/.test(d.place_name))
    .map((d) => ({ id: `wc${d.id}`, name: d.place_name, lat: Number(d.y), lng: Number(d.x), url: d.place_url }))
  cache.set(key, list)
  return list
}

/**
 * 반환: { byStop: { [장소id]: { name, meters, url } | null }, all: [화장실…] }
 */
export async function findRestrooms(stops) {
  const maps = await loadKakaoMaps()
  const ps = new maps.services.Places()
  const lists = await Promise.all(stops.map((p) => searchAround(maps, ps, p)))
  const byStop = {}
  stops.forEach((p, i) => {
    const near = lists[i].map((r) => ({ ...r, meters: distance(p, r) })).sort((a, b) => a.meters - b.meters)[0]
    byStop[p.id] = near && near.meters <= RESTROOM_RADIUS ? near : null
  })
  const all = [...new Map(lists.flat().map((r) => [r.id, r])).values()]
  return { byStop, all }
}
