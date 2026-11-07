import { useEffect, useState } from 'react'
import { legsToFetch } from './route.js'
import { fetchWalk, legKey, TMAP_KEY } from './walkRoute.js'
import { findRestrooms } from './restrooms.js'

const idsKey = (stops) => stops.map((p) => `${p.id}@${p.lat},${p.lng}`).join('|')

/** 코스가 바뀌면 구간마다 실제 걷는 길(TMAP)을 차례로 받아 옵니다. 키가 없으면 빈 값. */
export function useWalkPaths(stops) {
  const [paths, setPaths] = useState({})
  const key = idsKey(stops)
  useEffect(() => {
    if (!TMAP_KEY || !stops.length) return
    let alive = true
    ;(async () => {
      for (const [a, b] of legsToFetch(stops)) {
        const k = legKey(a, b)
        const walk = await fetchWalk(a, b) // 한 구간씩 (동시에 많이 부르면 막힐 수 있어요)
        if (!alive) return
        if (walk) setPaths((prev) => (prev[k] ? prev : { ...prev, [k]: walk }))
      }
    })()
    return () => {
      alive = false
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return paths
}

/** 코스 장소마다 가까운 화장실 */
export function useRestrooms(stops) {
  const [data, setData] = useState({ byStop: {}, all: [] })
  const key = idsKey(stops)
  useEffect(() => {
    if (!stops.length) return
    let alive = true
    findRestrooms(stops)
      .then((r) => alive && setData(r))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  return data
}
