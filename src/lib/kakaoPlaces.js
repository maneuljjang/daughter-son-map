// 카카오맵 장소 검색 (지도 SDK 의 services 라이브러리)
import { loadKakaoMaps } from './kakaoLoader.js'
import { PLACE_LIST } from '../data/places.js'
import { distance } from './geo.js'

export const SEONGBUK_CENTER = { lat: 37.5937, lng: 126.9975 }

// 우리 카테고리 → 카카오 카테고리 코드 (산책은 코드가 없어 키워드로 찾음)
const CATEGORY_QUERY = {
  food: { codes: ['FD6'] },
  cafe: { codes: ['CE7'] },
  fun: { codes: ['CT1', 'AT4'] },
  walk: { keyword: '공원' },
}

function catFromDoc(doc) {
  const name = `${doc.category_name} ${doc.place_name}`
  if (doc.category_group_code === 'FD6') return 'food'
  if (doc.category_group_code === 'CE7' || /제과|베이커리|디저트|카페/.test(name)) return 'cafe'
  if (/공원|산책|둘레길|성곽|숲|산$/.test(name)) return 'walk'
  if (/음식점|식당/.test(name)) return 'food'
  return 'fun'
}

function toPlace(doc) {
  const lat = Number(doc.y)
  const lng = Number(doc.x)
  // 우리가 이미 가진 장소면 그쪽을 씀 (사진·쉬는 곳 정보가 있으니까)
  const same = PLACE_LIST.find((p) => distance(p, { lat, lng }) < 60 && (doc.place_name.includes(p.name) || p.name.includes(doc.place_name)))
  if (same) return same
  const parts = doc.category_name.split(' > ')
  return {
    id: `k${doc.id}`,
    cat: catFromDoc(doc),
    name: doc.place_name,
    addr: doc.road_address_name || doc.address_name,
    lat,
    lng,
    desc: parts.slice(-2).join(' · '),
    phone: doc.phone || '',
    kakaoUrl: doc.place_url,
    tags: [],
    hill: false,
    rest: null,
    notice: null,
    alt: null,
    custom: true,
  }
}

/** keywordSearch(검색어, 콜백, 옵션) · categorySearch(코드, 콜백, 옵션) 를 Promise 로 */
function run(fn, first, options) {
  return new Promise((resolve) => {
    fn(first, (data, status) => resolve(status === window.kakao.maps.services.Status.OK ? data : []), options)
  })
}

// 성북동(성북동1가 포함) 주소만 남겨요. 근처 명륜동·혜화동·삼선동 등은 빼요.
export const isSeongbukdong = (doc) => /성북구 성북동/.test(doc.address_name || '')
const PAGES = [1, 2, 3] // 카카오는 한 번에 15곳까지라 3쪽(최대 45곳)을 받아서 거른 뒤 보여 줘요
const MAX_RESULTS = 20

/** 지도 가운데가 성북동에서 많이 벗어나 있으면 성북동 가운데를 기준으로 */
const clampCenter = (c) => (distance(c, SEONGBUK_CENTER) > 1200 ? SEONGBUK_CENTER : c)

/** 키워드 검색 (성북동 안만) */
export async function searchKeyword(keyword, center = SEONGBUK_CENTER) {
  const maps = await loadKakaoMaps()
  const ps = new maps.services.Places()
  const c = clampCenter(center)
  const opts = (page) => ({ location: new maps.LatLng(c.lat, c.lng), radius: 2000, size: 15, page })
  const pages = await Promise.all(PAGES.map((page) => run(ps.keywordSearch.bind(ps), keyword, opts(page))))
  return dedupe(pages.flat().filter(isSeongbukdong).map(toPlace)).slice(0, MAX_RESULTS)
}

/** 카테고리로 주변 장소 (지도 가운데 기준 가까운 순, 성북동 안만) */
export async function searchNearby(cat, center = SEONGBUK_CENTER) {
  const maps = await loadKakaoMaps()
  const ps = new maps.services.Places()
  const c = clampCenter(center)
  const q = CATEGORY_QUERY[cat]
  const opts = (page) => ({ location: new maps.LatLng(c.lat, c.lng), radius: 1200, sort: maps.services.SortBy.DISTANCE, size: 15, page })
  const calls = (q.keyword ? [q.keyword] : q.codes).flatMap((key) =>
    PAGES.map((page) => run((q.keyword ? ps.keywordSearch : ps.categorySearch).bind(ps), key, opts(page))),
  )
  const docs = (await Promise.all(calls)).flat().filter(isSeongbukdong)
  const places = dedupe(docs.map(toPlace)).map((p) => (p.custom ? { ...p, cat } : p))
  return places.sort((a, b) => distance(c, a) - distance(c, b)).slice(0, MAX_RESULTS)
}

function dedupe(list) {
  const seen = new Set()
  return list.filter((p) => !seen.has(p.id) && seen.add(p.id))
}
