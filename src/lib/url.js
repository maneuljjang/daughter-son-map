import { getPlace, registerPlaces } from '../data/places.js'
import { encodeCustom, decodeCustom } from './customCodec.js'

const BASE = import.meta.env.BASE_URL // 예: '/' 또는 '/daughter-son-map/'

/** 쉼표로 구분된 장소 id → 알 수 있는 id만 남긴 배열 */
export function parseIds(value) {
  if (!value) return []
  const seen = new Set()
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((id) => getPlace(id) && !seen.has(id) && seen.add(id))
}

export function readParams(search = window.location.search) {
  const q = new URLSearchParams(search)
  registerPlaces(decodeCustom(q.get('c'))) // 카카오맵에서 넣은 장소 먼저 등록
  const date = q.get('d') || ''
  const time = q.get('t') || ''
  return {
    ids: parseIds(q.get('r')),
    inviteId: q.get('i') || null,
    swap: parseIds(q.get('swap')), // 부모님이 "힘들 것 같아" 한 곳
    like: parseIds(q.get('like')), // 부모님이 "좋아요" 한 곳
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '',
    time: /^\d{2}:\d{2}$/.test(time) ? time : '',
    from: (q.get('f') || '').slice(0, 20),
  }
}

const appRoot = () => `${window.location.origin}${BASE}`

function courseQuery(ids, inviteId, { date, time, from } = {}) {
  const q = new URLSearchParams({ r: ids.join(',') })
  const custom = ids.map(getPlace).filter((p) => p?.custom)
  if (custom.length) q.set('c', encodeCustom(custom))
  if (inviteId) q.set('i', inviteId)
  if (date) q.set('d', date)
  if (time) q.set('t', time)
  if (from) q.set('f', from)
  return q
}
const pretty = (q) => q.toString().replace(/%2C/g, ',').replace(/%3A/g, ':')

/** 부모님 초대장 주소:  …/invite/?r=guk,suyeon&i=ab12cd&d=2026-11-23&t=12:00 */
export function inviteUrl(ids, inviteId, extra) {
  return `${appRoot()}invite/?${pretty(courseQuery(ids, inviteId, extra))}`
}

/** 자녀 화면으로 돌아오는 답장 주소:  …/?r=…&swap=simujang&like=guk */
export function replyUrl(ids, inviteId, { swap = [], like = [], ...extra } = {}) {
  const q = courseQuery(ids, inviteId, extra)
  if (swap.length) q.set('swap', swap.join(','))
  if (like.length) q.set('like', like.join(','))
  return `${appRoot()}?${pretty(q)}`
}

/** public/ 안의 파일 주소 */
export const asset = (path) => `${BASE}${path.replace(/^\//, '')}`
export const absoluteAsset = (path) => `${window.location.origin}${asset(path)}`

export function newInviteId() {
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789'
  let s = ''
  const rnd = crypto.getRandomValues(new Uint8Array(6))
  for (const b of rnd) s += chars[b % chars.length]
  return s
}
