import { useEffect, useState } from 'react'

const SIZES = [
  { scale: 1, name: '보통' },
  { scale: 1.15, name: '크게' },
  { scale: 1.3, name: '아주 크게' },
]
const KEY = 'dsm.fontScale'

/** 부모님 화면 글자 크기: 누를 때마다 보통 → 크게 → 아주 크게 (이 휴대폰에 기억) */
export default function FontSizeButtons() {
  const [i, setI] = useState(() => {
    try {
      const saved = Number(localStorage.getItem(KEY))
      return Math.max(0, SIZES.findIndex((s) => s.scale === saved))
    } catch {
      return 0
    }
  })
  const size = SIZES[i]
  useEffect(() => {
    document.documentElement.style.setProperty('--fs', String(size.scale))
    document.documentElement.dataset.fs = String(size.scale) // 글자가 커지면 버튼을 한 줄에 하나씩
    try {
      localStorage.setItem(KEY, String(size.scale))
    } catch {
      /* 무시 */
    }
  }, [size.scale])

  return (
    <button className="btn btn-sm fs-toggle" onClick={() => setI((i + 1) % SIZES.length)} aria-label={`글자 크기 ${size.name}, 눌러서 바꾸기`}>
      <span aria-hidden="true" className="fs-icon">가</span> 글자 {size.name}
    </button>
  )
}
