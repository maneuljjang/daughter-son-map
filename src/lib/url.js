import { PLACES } from '../data/places.js'

const BASE = import.meta.env.BASE_URL // 예: '/' 또는 '/daughter-son-map/'

/** 쉼표로 구분된 장소 id → 알 수 있는 id만 남긴 배열 */
export function parseIds(value) {
  if (!value) return []
  const seen = new Set()
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((id) => PLACES[id] && !seen.has(id) && seen.add(id))
}

export function readParams(search = window.location.search) {
  const q = new URLSearchParams(search)
  return {
    ids: parseIds(q.get('r')),
    inviteId: q.get('i') || null,
    swap: parseIds(q.get('swap')), // 부모님이 "힘들 것 같아" 한 곳
    like: parseIds(q.get('like')), // 부모님이 "좋아요" 한 곳
  }
}

const appRoot = () => `${window.location.origin}${BASE}`

/** 부모님 초대장 주소:  …/invite/?r=guk,suyeon&i=ab12cd */
export function inviteUrl(ids, inviteId) {
  const q = new URLSearchParams({ r: ids.join(',') })
  if (inviteId) q.set('i', inviteId)
  return `${appRoot()}invite/?${decodeURIComponent(q.toString())}`
}

/** 자녀 화면으로 돌아오는 답장 주소:  …/?r=…&swap=simujang&like=guk */
export function replyUrl(ids, inviteId, { swap = [], like = [] } = {}) {
  const q = new URLSearchParams({ r: ids.join(',') })
  if (inviteId) q.set('i', inviteId)
  if (swap.length) q.set('swap', swap.join(','))
  if (like.length) q.set('like', like.join(','))
  return `${appRoot()}?${decodeURIComponent(q.toString())}`
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
