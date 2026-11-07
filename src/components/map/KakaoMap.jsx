import { useEffect, useRef, useState } from 'react'
import { loadKakaoMaps } from '../../lib/kakaoLoader.js'
import { CATEGORIES, STATION } from '../../data/places.js'

const CENTER = { lat: 37.5937, lng: 126.9975 }

function pinElement({ label, text, color, classes, onClick }) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = `pin ${classes}`
  el.setAttribute('aria-label', label)
  el.innerHTML = `<span class="pin-dot" style="background:${color}">${text}</span><span class="pin-label"></span>`
  el.querySelector('.pin-label').textContent = label
  if (onClick) el.addEventListener('click', onClick)
  return el
}

/**
 * stops: 코스에 들어간 장소 (번호 마커 + 선)
 * candidates: 고를 수 있는 다른 장소 (작은 마커)
 * path: 선으로 이을 좌표 목록
 * fitKey: 이 값이 바뀔 때만 지도 범위를 다시 맞춤
 */
export default function KakaoMap({
  stops = [],
  candidates = [],
  path = [],
  selectedId,
  flagged = [],
  showStation = false,
  restrooms = [],
  onSelect,
  fitKey,
  className = '',
  style,
  onReady,
}) {
  const boxRef = useRef(null)
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const drawn = useRef([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    loadKakaoMaps()
      .then((maps) => {
        if (!alive || !elRef.current) return
        mapRef.current = new maps.Map(elRef.current, {
          center: new maps.LatLng(CENTER.lat, CENTER.lng),
          level: 5,
        })
        mapRef.current.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT)
        onReady?.(mapRef.current)
        setStatus('ready')
      })
      .catch((e) => {
        if (!alive) return
        setStatus('error')
        setError(e.message === 'NO_KEY' ? '.env 파일에 VITE_KAKAO_JS_KEY 를 넣고 npm run dev 를 다시 실행해 주세요.' : e.message)
      })
    return () => {
      alive = false
    }
  }, [])

  // 크기가 바뀌면 지도 다시 그리기
  useEffect(() => {
    if (status !== 'ready') return
    const ro = new ResizeObserver(() => mapRef.current?.relayout())
    ro.observe(boxRef.current)
    return () => ro.disconnect()
  }, [status])

  // 마커·선 그리기
  useEffect(() => {
    if (status !== 'ready') return
    const maps = window.kakao.maps
    const map = mapRef.current
    drawn.current.forEach((o) => o.setMap(null))
    drawn.current = []

    const add = (place, opts, z) => {
      const ov = new maps.CustomOverlay({
        position: new maps.LatLng(place.lat, place.lng),
        content: pinElement(opts),
        yAnchor: 1,
        clickable: true,
        zIndex: z,
      })
      ov.setMap(map)
      drawn.current.push(ov)
    }

    if (path.length > 1) {
      const linePath = path.map((p) => new maps.LatLng(p.lat, p.lng))
      for (const [color, weight] of [['#4A3A30', 9], ['#F6D77A', 4]]) {
        const line = new maps.Polyline({ path: linePath, strokeWeight: weight, strokeColor: color, strokeOpacity: 1, strokeStyle: 'solid' })
        line.setMap(map)
        drawn.current.push(line)
      }
    }

    const stopIds = new Set(stops.map((s) => s.id))
    candidates
      .filter((p) => !stopIds.has(p.id))
      .forEach((p) =>
        add(p, {
          label: p.name,
          text: '+',
          color: CATEGORIES[p.cat].color,
          classes: `pin-candidate ${p.id === selectedId ? 'pin-selected' : ''}`,
          onClick: () => onSelect?.(p.id),
        }, 2),
      )

    stops.forEach((p, i) =>
      add(p, {
        label: p.name,
        text: String(i + 1),
        color: CATEGORIES[p.cat].color,
        classes: `${p.id === selectedId ? 'pin-selected' : ''} ${flagged.includes(p.id) ? 'pin-flagged' : ''}`,
        onClick: () => onSelect?.(p.id),
      }, 5),
    )

    restrooms.forEach((r) => {
      const ov = new maps.CustomOverlay({
        position: new maps.LatLng(r.lat, r.lng),
        content: `<div class="pin-wc" title="화장실">🚻</div>`,
        zIndex: 1,
      })
      ov.setMap(map)
      drawn.current.push(ov)
    })

    if (showStation) {
      add(STATION, { label: '한성대입구역', text: '역', color: '#4A3A30', classes: 'pin-station' }, 4)
    }
  }, [status, stops, candidates, path, selectedId, flagged, showStation, onSelect, restrooms])

  // 범위 맞추기
  useEffect(() => {
    if (status !== 'ready') return
    const maps = window.kakao.maps
    const pts = stops.length ? stops : candidates
    if (!pts.length) return
    const bounds = new maps.LatLngBounds()
    pts.forEach((p) => bounds.extend(new maps.LatLng(p.lat, p.lng)))
    if (showStation && stops.length) bounds.extend(new maps.LatLng(STATION.lat, STATION.lng))
    mapRef.current.setBounds(bounds, 40, 30, 40, 30)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, fitKey])

  return (
    <div ref={boxRef} className={`map-box ${className}`} style={style}>
      <div ref={elRef} className="map" />
      {status === 'loading' && <div className="map-fallback">지도를 불러오는 중…</div>}
      {status === 'error' && (
        <div className="map-fallback">
          <div>
            <b>지도를 불러오지 못했어요</b>
            <br />
            {error}
            <br />
            <span className="muted">아래 목록으로는 계속 코스를 볼 수 있어요.</span>
          </div>
        </div>
      )}
    </div>
  )
}
