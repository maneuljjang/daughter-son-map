// 카카오맵에서 넣은 장소는 우리 데이터에 없으니, 초대장 주소(c=)에 이름·좌표를 함께 담습니다.
// 형식: base64url(JSON [[id, name, lat, lng, cat, alt, addr, desc], …])

const toB64url = (str) => {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
const fromB64url = (b64) => {
  const bin = atob(b64.replace(/-/g, '+').replace(/_/g, '/'))
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
}

export function encodeCustom(places) {
  if (!places.length) return ''
  const rows = places.map((p) => [p.id, p.name, +p.lat.toFixed(6), +p.lng.toFixed(6), p.cat, p.alt, p.addr || '', p.desc || ''])
  return toB64url(JSON.stringify(rows))
}

export function decodeCustom(value) {
  if (!value) return []
  try {
    return JSON.parse(fromB64url(value))
      .filter((r) => Array.isArray(r) && /^k\d+$/.test(r[0]) && Number.isFinite(r[2]) && Number.isFinite(r[3]))
      .map(([id, name, lat, lng, cat, alt, addr, desc]) => ({
        id,
        name: String(name).slice(0, 60),
        lat,
        lng,
        cat: ['food', 'cafe', 'fun', 'walk'].includes(cat) ? cat : 'fun',
        alt: [1, 2, 3, 4, 5].includes(alt) ? alt : 3,
        addr: String(addr || '').slice(0, 80),
        desc: String(desc || '').slice(0, 80),
        kakaoUrl: `https://place.map.kakao.com/${id.slice(1)}`,
        tags: [],
        hill: false,
        rest: null,
        notice: null,
      }))
  } catch {
    return []
  }
}
