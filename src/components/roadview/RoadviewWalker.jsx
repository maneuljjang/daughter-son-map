import { useEffect, useMemo, useRef, useState } from 'react'
import { loadKakaoMaps } from '../../lib/kakaoLoader.js'
import { walkSteps, routePath } from '../../lib/route.js'
import { bearing } from '../../lib/geo.js'
import { busTip } from '../../data/transit.js'
import { CATEGORIES } from '../../data/places.js'

const AUTO_MS = 4500

/**
 * 미리 걸어보기: 카카오 로드뷰로 코스를 따라 한 지점씩 넘어갑니다.
 * startStopId 가 있으면 그 장소부터 시작.
 */
export default function RoadviewWalker({ route, startStopId, onClose }) {
  const steps = useMemo(() => walkSteps(route), [route])
  const startIndex = Math.max(0, startStopId ? steps.findIndex((s) => s.stop?.id === startStopId) : 0)
  const [index, setIndex] = useState(startIndex)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [noPano, setNoPano] = useState(false)
  const [auto, setAuto] = useState(false)
  const rvEl = useRef(null)
  const miniEl = useRef(null)
  const sdk = useRef({})
  const indexRef = useRef(index)
  indexRef.current = index

  const step = steps[index]

  // 로드뷰·미니맵 준비
  useEffect(() => {
    let alive = true
    loadKakaoMaps()
      .then((maps) => {
        if (!alive) return
        const rv = new maps.Roadview(rvEl.current)
        const client = new maps.RoadviewClient()
        const mini = new maps.Map(miniEl.current, {
          center: new maps.LatLng(steps[0].pos.lat, steps[0].pos.lng),
          level: 4,
          draggable: false,
          disableDoubleClickZoom: true,
        })
        const path = routePath(route).map((p) => new maps.LatLng(p.lat, p.lng))
        new maps.Polyline({ path, strokeWeight: 5, strokeColor: '#4A3A30', strokeOpacity: 0.9 }).setMap(mini)
        const me = new maps.CustomOverlay({ content: '<div class="rv-me"></div>', position: path[0], zIndex: 3 })
        me.setMap(mini)
        // 로드뷰가 열리면 다음 지점 쪽을 바라보게
        maps.event.addListener(rv, 'init', () => {
          const s = steps[indexRef.current]
          if (s?.next) rv.setViewpoint({ pan: bearing(s.pos, s.next), tilt: 0, zoom: 0 })
        })
        sdk.current = { maps, rv, client, mini, me }
        setStatus('ready')
      })
      .catch(() => alive && setStatus('error'))
    return () => {
      alive = false
    }
  }, [route, steps])

  // 지점이 바뀌면 가장 가까운 로드뷰 찾기
  useEffect(() => {
    if (status !== 'ready') return
    const { maps, rv, client, mini, me } = sdk.current
    const pos = new maps.LatLng(step.pos.lat, step.pos.lng)
    me.setPosition(pos)
    mini.panTo(pos)
    let cancelled = false
    const tryRadius = (radii) => {
      if (!radii.length) return setNoPano(true)
      client.getNearestPanoId(pos, radii[0], (panoId) => {
        if (cancelled) return
        if (panoId) {
          setNoPano(false)
          rv.setPanoId(panoId, pos)
          rv.relayout()
        } else tryRadius(radii.slice(1))
      })
    }
    tryRadius([50, 120, 250])
    return () => {
      cancelled = true
    }
  }, [status, step])

  // 자동으로 걷기
  useEffect(() => {
    if (!auto) return
    if (index >= steps.length - 1) return setAuto(false)
    const t = setTimeout(() => setIndex((i) => Math.min(i + 1, steps.length - 1)), AUTO_MS)
    return () => clearTimeout(t)
  }, [auto, index, steps.length])

  const go = (d) => {
    setAuto(false)
    setIndex((i) => Math.min(Math.max(i + d, 0), steps.length - 1))
  }

  const stopCount = route.stops.length
  const caption = (() => {
    if (step.kind === 'stop')
      return { tag: `${step.order}번째 장소`, title: step.stop.name, sub: step.stop.rest || step.stop.desc, color: CATEGORIES[step.stop.cat].color }
    if (step.kind === 'end') return { tag: '도착', title: '한성대입구역', sub: '수고하셨어요! 여기서 지하철을 타요.', color: 'var(--brown)' }
    return { tag: `${step.to.name} 가는 길 (${step.part}/${step.parts})`, title: '이 길로 걸어가요', sub: busTip(step.from.id), color: 'var(--brown-soft)' }
  })()

  return (
    <div className="rv" role="dialog" aria-label="미리 걸어보기">
      <div className="rv-view">
        <div ref={rvEl} className="rv-canvas" />
        {status === 'loading' && <div className="rv-msg">로드뷰를 불러오는 중…</div>}
        {status === 'error' && <div className="rv-msg">로드뷰를 불러오지 못했어요.<br />인터넷 연결과 카카오 키 설정을 확인해 주세요.</div>}
        {status === 'ready' && noPano && <div className="rv-msg">이 지점은 로드뷰 사진이 없어요.<br />[다음]을 눌러 계속 걸어가요.</div>}
        <button className="btn rv-close" onClick={onClose}>✕ 닫기</button>
        <div ref={miniEl} className="rv-mini" aria-hidden="true" />
      </div>

      <div className="rv-panel">
        <div className="rv-progress" aria-label={`${steps.length}개 중 ${index + 1}번째`}>
          {steps.map((s, i) => (
            <span key={i} className={`rv-dot ${s.kind !== 'path' ? 'rv-dot-stop' : ''} ${i <= index ? 'on' : ''}`} />
          ))}
        </div>
        <div className="rv-tag" style={{ background: caption.color }}>{caption.tag}</div>
        <div className="rv-title title">{caption.title}</div>
        <p className="rv-sub">{caption.sub}</p>

        <div className="rv-controls">
          <button className="btn btn-lg" onClick={() => go(-1)} disabled={index === 0}>◀ 이전</button>
          <button className="btn btn-lg btn-primary" onClick={() => go(1)} disabled={index === steps.length - 1}>다음 ▶</button>
        </div>
        <button className="btn btn-block" onClick={() => setAuto((a) => !a)} disabled={index === steps.length - 1}>
          {auto ? '⏸ 멈추기' : '▶ 자동으로 따라 걷기'}
        </button>
        <p className="small muted" style={{ textAlign: 'center', margin: '8px 0 0' }}>
          장소 {stopCount}곳 · 사진은 실제 길과 다를 수 있어요
        </p>
      </div>
    </div>
  )
}
