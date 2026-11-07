import { useEffect, useState } from 'react'

const SIZES = [
  { label: '가', scale: 1, name: '보통 글자' },
  { label: '가+', scale: 1.15, name: '큰 글자' },
  { label: '가++', scale: 1.3, name: '아주 큰 글자' },
]
const KEY = 'dsm.fontScale'

/** 부모님 화면 글자 크기 (이 휴대폰에 기억) */
export default function FontSizeButtons() {
  const [scale, setScale] = useState(() => {
    try {
      return Number(localStorage.getItem(KEY)) || 1
    } catch {
      return 1
    }
  })
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', String(scale))
    try {
      localStorage.setItem(KEY, String(scale))
    } catch {
      /* 무시 */
    }
  }, [scale])

  return (
    <div className="fs-buttons" role="group" aria-label="글자 크기">
      {SIZES.map((s) => (
        <button key={s.scale} className={`fs-btn ${scale === s.scale ? 'on' : ''}`} onClick={() => setScale(s.scale)} aria-label={s.name} aria-pressed={scale === s.scale}>
          {s.label}
        </button>
      ))}
    </div>
  )
}
