import { useCallback, useEffect, useRef, useState } from 'react'

export function useToast() {
  const [msg, setMsg] = useState(null)
  const timer = useRef()
  const show = useCallback((text) => {
    clearTimeout(timer.current)
    setMsg(text)
    timer.current = setTimeout(() => setMsg(null), 2600)
  }, [])
  useEffect(() => () => clearTimeout(timer.current), [])
  const node = msg ? <div className="toast" role="status">{msg}</div> : null
  return [node, show]
}
