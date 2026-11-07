import BottomSheet from '../../components/ui/BottomSheet.jsx'
import PlaceImage from '../../components/place/PlaceImage.jsx'
import { PLACES, CATEGORIES } from '../../data/places.js'
import { alternativesFor, formatKm } from '../../lib/route.js'

export default function SwapSheet({ placeId, currentIds, onPick, onClose }) {
  const target = PLACES[placeId]
  const alts = alternativesFor(placeId, currentIds)
  return (
    <BottomSheet title={`${target.name} 대신`} onClose={onClose}>
      <p className="small muted" style={{ marginTop: 0 }}>
        같은 {CATEGORIES[target.cat].label} 장소예요. 경사 없는 곳을 먼저, 가까운 순으로 보여 드려요.
      </p>
      {!alts.length && <p>바꿀 수 있는 같은 종류 장소가 더 없어요.</p>}
      <ul className="place-list">
        {alts.map(({ place, dist }) => (
          <li key={place.id} className="place-row card">
            <div className="place-row-main">
              <PlaceImage place={place} className="place-thumb" />
              <span className="place-row-text">
                <span className="place-row-name">{place.name}</span>
                <span className="place-row-desc">{place.desc}</span>
                <span className="place-row-tags">
                  <span className="chip">원래 장소에서 {formatKm(dist)}</span>
                  {place.hill && <span className="chip chip-hill">경사</span>}
                </span>
              </span>
            </div>
            <button className="btn btn-sm btn-primary" onClick={() => onPick(place.id)}>이걸로</button>
          </li>
        ))}
      </ul>
    </BottomSheet>
  )
}
