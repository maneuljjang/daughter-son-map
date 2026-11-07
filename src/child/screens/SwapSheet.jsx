import { useState } from 'react'
import BottomSheet from '../../components/ui/BottomSheet.jsx'
import PlaceImage from '../../components/place/PlaceImage.jsx'
import { CATEGORIES, getPlace } from '../../data/places.js'
import { alternativesFor, formatKm } from '../../lib/route.js'
import { distance } from '../../lib/geo.js'
import { searchNearby } from '../../lib/kakaoPlaces.js'

export default function SwapSheet({ placeId, currentIds, onPick, onClose }) {
  const target = getPlace(placeId)
  const [kakao, setKakao] = useState(null) // null | 'loading' | place[]
  const [busy, setBusy] = useState(null)
  const curated = alternativesFor(placeId, currentIds)
  const fromKakao = Array.isArray(kakao)
    ? kakao.filter((p) => !currentIds.includes(p.id) && !curated.some((c) => c.place.id === p.id)).map((p) => ({ place: p, dist: distance(target, p) }))
    : []

  const findMore = async () => {
    setKakao('loading')
    try {
      setKakao(await searchNearby(target.cat, target))
    } catch {
      setKakao([])
    }
  }
  const pick = async (p) => {
    setBusy(p.id)
    await onPick(p)
  }

  const row = ({ place, dist }) => (
    <li key={place.id} className="place-row card">
      <div className="place-row-main">
        <PlaceImage place={place} className="place-thumb" />
        <span className="place-row-text">
          <span className="place-row-name">{place.name}</span>
          <span className="place-row-desc">{place.desc}</span>
          <span className="place-row-tags">
            <span className="chip">원래 장소에서 {formatKm(dist)}</span>
            {place.custom && <span className="chip">카카오맵</span>}
            {place.hill && <span className="chip chip-hill">경사</span>}
          </span>
        </span>
      </div>
      <button className="btn btn-sm btn-primary" onClick={() => pick(place)} disabled={busy === place.id}>
        {busy === place.id ? '…' : '이걸로'}
      </button>
    </li>
  )

  return (
    <BottomSheet title={`${target.name} 대신`} onClose={onClose}>
      <p className="small muted" style={{ marginTop: 0 }}>
        같은 {CATEGORIES[target.cat].label} 장소예요. 경사 없는 곳을 먼저, 가까운 순으로 보여 드려요.
      </p>
      <ul className="place-list">{curated.map(row)}</ul>
      {kakao === null && (
        <button className="btn btn-block more-btn" onClick={findMore}>
          🗺️ 근처 {CATEGORIES[target.cat].label} 카카오맵에서 더 찾기
        </button>
      )}
      {kakao === 'loading' && <p className="muted">찾는 중…</p>}
      {Array.isArray(kakao) && (
        <>
          <h3 className="title" style={{ fontSize: 18, margin: '16px 0 8px' }}>카카오맵에서 찾은 곳</h3>
          {!fromKakao.length && <p className="muted">더 찾은 곳이 없어요.</p>}
          <ul className="place-list">{fromKakao.map(row)}</ul>
        </>
      )}
    </BottomSheet>
  )
}
