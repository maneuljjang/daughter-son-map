import { useState } from 'react'
import { asset } from '../../lib/url.js'
import { CATEGORIES } from '../../data/places.js'
import CategoryIcon from '../ui/CategoryIcon.jsx'

/** public/places/<id>.jpg 가 있으면 사진, 없으면 카테고리 일러스트 */
export default function PlaceImage({ place, className = '' }) {
  const [failed, setFailed] = useState(false)
  const color = CATEGORIES[place.cat]?.color
  return (
    <div className={`place-img ${failed || place.custom ? 'is-ph' : ''} ${className}`} style={{ color }}>
      {!failed && !place.custom && <img src={asset(`places/${place.id}.jpg`)} alt={place.name} loading="lazy" onError={() => setFailed(true)} />}
      {(failed || place.custom) && (
        <div className="ph" aria-label={`${place.name} 사진 준비 중`}>
          <CategoryIcon cat={place.cat} size={64} />
        </div>
      )}
    </div>
  )
}
