import { useCallback, useEffect, useMemo, useState } from 'react'
import { getPlace, registerPlaces } from '../data/places.js'
import { sortDownhill, buildRoute, insertIndex } from '../lib/route.js'
import { readParams } from '../lib/url.js'
import { useWalkPaths } from '../lib/useRouteExtras.js'
import { STATION } from '../data/places.js'

const DRAFT_KEY = 'dsm.draft'
const EMPTY_PARENT = { swap: [], like: [] }
const BASE = { ids: [], mode: 'auto', courseId: null, inviteId: null, parent: EMPTY_PARENT, date: '', time: '', from: '', hidePrice: false }

function loadInitial() {
  let draft = null
  try {
    draft = JSON.parse(localStorage.getItem(DRAFT_KEY))
    if (draft?.custom) registerPlaces(draft.custom)
  } catch {
    /* 무시 */
  }

  const params = readParams()
  if (params.ids.length) {
    // 부모님 답장 링크로 들어온 경우: 보낸 순서 그대로
    return {
      ...BASE,
      from: draft?.from || params.from,
      ids: params.ids,
      mode: 'fixed',
      inviteId: params.inviteId,
      parent: { swap: params.swap, like: params.like },
      date: params.date,
      hidePrice: params.hidePrice,
      time: params.time,
      fromReply: params.swap.length > 0 || params.like.length > 0,
    }
  }
  if (draft?.ids) {
    const { custom, ...rest } = draft
    return { ...BASE, ...rest, ids: draft.ids.filter((id) => getPlace(id)), parent: draft.parent || EMPTY_PARENT, fromReply: false }
  }
  return { ...BASE, fromReply: false }
}

/**
 * 자녀 화면의 코스 상태
 * mode: 'auto'  = 직접 고른 코스, 항상 내리막 순서로 자동 정렬
 *       'fixed' = 추천 코스·답장으로 받은 코스·순서를 직접 바꾼 코스. 순서를 그대로 둠
 */
export function useCourse() {
  const [state, setState] = useState(loadInitial)
  const { ids, mode } = state

  const stops = useMemo(() => ids.map(getPlace).filter(Boolean), [ids])
  const paths = useWalkPaths(stops) // 실제 걷는 길 (TMAP 키가 있을 때)
  const route = useMemo(() => buildRoute(stops, STATION, paths), [stops, paths])

  useEffect(() => {
    const { fromReply, ...rest } = state
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...rest, custom: stops.filter((p) => p.custom) }))
    } catch {
      /* 저장이 막힌 브라우저 */
    }
  }, [state, stops])

  // 답장 링크 주소는 한 번 읽은 뒤 깔끔하게 정리 (새로고침해도 초안이 유지되도록)
  useEffect(() => {
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname)
  }, [])

  const sorted = (list) => sortDownhill(list.map(getPlace)).map((p) => p.id)

  const add = useCallback((place) => {
    registerPlaces([place])
    setState((s) => {
      if (s.ids.includes(place.id)) return s
      if (s.mode === 'auto') return { ...s, ids: sorted([...s.ids, place.id]) }
      // 순서를 정해 둔 코스: 내리막이 깨지지 않는 자리에 끼워 넣기
      const list = s.ids.map(getPlace)
      const at = insertIndex(list, getPlace(place.id))
      const next = [...s.ids]
      next.splice(at, 0, place.id)
      return { ...s, ids: next }
    })
  }, [])

  const remove = useCallback((id) => {
    setState((s) => ({
      ...s,
      ids: s.ids.filter((x) => x !== id),
      parent: { swap: s.parent.swap.filter((x) => x !== id), like: s.parent.like.filter((x) => x !== id) },
    }))
  }, [])

  const swap = useCallback((oldId, newPlace) => {
    registerPlaces([newPlace])
    setState((s) => {
      const replaced = s.ids.map((x) => (x === oldId ? newPlace.id : x))
      return {
        ...s,
        ids: s.mode === 'auto' ? sorted(replaced) : replaced,
        parent: { swap: s.parent.swap.filter((x) => x !== oldId), like: s.parent.like },
      }
    })
  }, [])

  /** 위(-1)·아래(+1)로 한 칸 옮기기 → 이후로는 순서를 그대로 둠 */
  const move = useCallback((id, dir) => {
    setState((s) => {
      const i = s.ids.indexOf(id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= s.ids.length) return s
      const next = [...s.ids]
      ;[next[i], next[j]] = [next[j], next[i]]
      return { ...s, ids: next, mode: 'fixed' }
    })
  }, [])

  const loadCourse = useCallback((course) => {
    setState((s) => ({ ...s, ids: [...course.stops], mode: 'fixed', courseId: course.id, parent: EMPTY_PARENT }))
  }, [])

  const resort = useCallback(() => setState((s) => ({ ...s, mode: 'auto', ids: sorted(s.ids) })), [])
  const clear = useCallback(() => setState((s) => ({ ...s, ids: [], mode: 'auto', courseId: null, parent: EMPTY_PARENT })), [])
  const setField = useCallback((key, value) => setState((s) => ({ ...s, [key]: value })), [])

  return { ...state, mode, stops, route, add, remove, swap, move, loadCourse, resort, clear, setField }
}
