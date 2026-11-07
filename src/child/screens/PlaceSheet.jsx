import BottomSheet from '../../components/ui/BottomSheet.jsx'
import PlaceImage from '../../components/place/PlaceImage.jsx'
import { CATEGORIES } from '../../data/places.js'

export default function PlaceSheet({ place, inCourse, onToggle, onClose }) {
  return (
    <BottomSheet title={place.name} onClose={onClose}>
      <PlaceImage place={place} />
      <div className="ps-meta">
        <span className="chip chip-dark">{CATEGORIES[place.cat].label}</span>
        {place.hill && <span className="chip chip-hill">경사·계단</span>}
        {place.tags.map((t) => (
          <span key={t} className="chip">{t}</span>
        ))}
      </div>
      <p className="ps-desc">{place.desc}</p>
      <dl className="ps-dl">
        <dt>주소</dt>
        <dd>{place.addr}</dd>
        <dt>쉬는 곳</dt>
        <dd>{place.rest || <span className="muted">확인 중이에요</span>}</dd>
        {place.notice && (
          <>
            <dt>알아두기</dt>
            <dd>{place.notice}</dd>
          </>
        )}
      </dl>
      <p className="small muted">운영 정보는 2026년 11월 기준이에요. 방문 전에 확인해 주세요.</p>
      <button className={`btn btn-block ${inCourse ? 'btn-dark' : 'btn-primary'}`} onClick={onToggle}>
        {inCourse ? '코스에서 빼기' : '코스에 담기'}
      </button>
    </BottomSheet>
  )
}
