/** 장소 자세한 설명: 어떤 곳인지 + 대표 메뉴 또는 볼거리 (자녀·부모님 화면 공용) */
export default function PlaceDetails({ place }) {
  const { about, menu, points } = place
  if (!about && !menu && !points) return null
  return (
    <div className="pd">
      {about && <p className="pd-about">{about}</p>}
      {menu?.length > 0 && (
        <div className="pd-box">
          <div className="pd-title">🍽️ 이런 메뉴가 있어요</div>
          <ul className="pd-menu">
            {menu.map(([name, price]) => (
              <li key={name}>
                <span>{name}</span>
                <b>{price}</b>
              </li>
            ))}
          </ul>
          <p className="pd-note">가격은 2026년 11월 기준이에요. 바뀔 수 있어요.</p>
        </div>
      )}
      {points?.length > 0 && (
        <div className="pd-box">
          <div className="pd-title">👀 여기서 볼 것</div>
          <ul className="pd-points">
            {points.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
