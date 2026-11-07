import { useCallback, useEffect, useMemo, useState } from 'react'
import { PLACES } from '../data/places.js'
import { sortDownhill, buildRoute } from '../lib/route.js'
import { readParams } from '../lib/url.js'

const DRAFT_KEY = 'dsm.draft'

function loadInitial() {
  const params = readParams()
  if (params.ids.length) {
    // 부모님 답장 링크로 들어온 경우: 보낸 순서 그대로
    return {
      ids: params.ids,
      mode: 'fixed',
      courseId: null,
      inviteId: params.inviteId,
      parent: { swap: params.swap, like: params.like },
      fromReply: params.swap.length > 0 || params.like.length > 0,
    }
  }
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY))
    if (d?.ids) return { ...d, ids: d.ids.filter((id) => PLACES[id]), parent: d.parent || { swap: [], like: [] }, fromReply: false }
  } catch {
    /* 무시 */
  }
  return { ids: [], mode: 'auto', courseId: null, inviteId: null, parent: { swap: [], like: [] }, fromReply: false }
}

/**
 * 자녀 화면의 코스 상태
 * mode: 'auto'  = 직접 고른 코스, 항상 내리막 순서로 자동 정렬
 *       'fixed' = 추천 코스/답장으로 받은 코스, 순서를 그대로 둠
 */
export function useCourse() {
  const [state, setState] = useState(loadInitial)
  const { ids, mode } = state

  useEffect(() => {
    const { fromReply, ...rest } = state
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(rest))
    } catch {
      /* 저장이 막힌 브라우저 */
    }
  }, [state])

  // 답장 링크 주소는 한 번 읽은 뒤 깔끔하게 정리 (새로고침해도 초안이 유지되도록)
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const stops = useMemo(() => ids.map((id) => PLACES[id]), [ids])
  const route = useMemo(() => buildRoute(stops), [stops])

  const sorted = (list) => sortDownhill(list.map((id) => PLACES[id])).map((p) => p.id)

  /** 반환값: 순서를 다시 정했는지 */
  const add = useCallback(
    (id) => {
      if (ids.includes(id)) return false
      setState((s) => (s.ids.includes(id) ? s : { ...s, mode: 'auto', courseId: null, ids: sorted([...s.ids, id]) }))
      return mode === 'fixed' && ids.length > 0
    },
    [ids, mode],
  )

  const remove = useCallback((id) => {
    setState((s) => ({
      ...s,
      ids: s.ids.filter((x) => x !== id),
      parent: { swap: s.parent.swap.filter((x) => x !== id), like: s.parent.like.filter((x) => x !== id) },
    }))
  }, [])

  const swap = useCallback((oldId, newId) => {
    setState((s) => {
      const replaced = s.ids.map((x) => (x === oldId ? newId : x))
      return {
        ...s,
        ids: s.mode === 'auto' ? sorted(replaced) : replaced,
        parent: { swap: s.parent.swap.filter((x) => x !== oldId), like: s.parent.like },
      }
    })
  }, [])

  const loadCourse = useCallback((course) => {
    setState((s) => ({ ...s, ids: [...course.stops], mode: 'fixed', courseId: course.id, parent: { swap: [], like: [] } }))
  }, [])

  const resort = useCallback(() => setState((s) => ({ ...s, mode: 'auto', courseId: null, ids: sorted(s.ids) })), [])
  const clear = useCallback(() => setState((s) => ({ ...s, ids: [], mode: 'auto', courseId: null, parent: { swap: [], like: [] } })), [])
  const setInviteId = useCallback((inviteId) => setState((s) => ({ ...s, inviteId })), [])

  return { ...state, mode, stops, route, add, remove, swap, loadCourse, resort, clear, setInviteId }
}
