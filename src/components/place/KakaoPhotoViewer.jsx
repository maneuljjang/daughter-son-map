import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { kakaoPhotoLink } from '../../data/places.js'

const SLOW_MS = 8000

/**
 * 초대장을 벗어나지 않고 카카오맵 사진 탭을 보여 줍니다.
 * 사진을 앱에 복사하지 않고 카카오맵 화면을 그대로 띄우는 방식이에요.
 * 휴대폰 뒤로 가기를 누르면 초대장을 떠나지 않고 이 창만 닫혀요.
 */
export default function KakaoPhotoViewer({ place, onClose }) {
  const link = kakaoPhotoLink(place)
  const [loaded, setLoaded] = useState(false)
  const [slow, setSlow] = useState(false)
  const pushed = useRef(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = setTimeout(() => setSlow(true), SLOW_MS)

    // 뒤로 가기로 닫을 수 있게 기록을 하나 쌓아요. (개발 모드에서 두 번 실행돼도 한 번만)
    if (!pushed.current) {
      window.history.pushState({ kakaoPhoto: true }, '')
      pushed.current = true
    }
    window.addEventListener('popstate', onClose)

    return () => {
      document.body.style.overflow = prev
      clearTimeout(timer)
      window.removeEventListener('popstate', onClose)
    }
  }, [onClose])

  // 시트 안에서 열어도 항상 화면 맨 위에 뜨도록 body 에 바로 붙여요
  return createPortal(
    <div className="kv" role="dialog" aria-modal="true" aria-label={`${place.name} 사진`}>
      <div className="kv-head">
        <div className="kv-title title">{place.name} 사진</div>
        <button className="btn btn-dark btn-sm" onClick={onClose}>✕ 닫기</button>
      </div>
      <div className="kv-body">
        <iframe className="kv-frame" src={link} title={`${place.name} 카카오맵 사진`} onLoad={() => setLoaded(true)} />
        {!loaded && (
          <div className="kv-loading">
            <p>사진을 불러오는 중이에요…</p>
            {slow && (
              <a className="btn btn-primary" href={link} target="_blank" rel="noreferrer">
                카카오맵에서 바로 열기
              </a>
            )}
          </div>
        )}
      </div>
      <a className="kv-foot" href={link} target="_blank" rel="noreferrer">
        사진이 안 보이면 카카오맵에서 열기 ↗
      </a>
    </div>,
    document.body,
  )
}
