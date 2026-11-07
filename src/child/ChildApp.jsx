import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, CATEGORY_ORDER, PLACE_LIST, getPlace } from '../data/places.js'
import { COURSES } from '../data/courses.js'
import { routePath, formatKm } from '../lib/route.js'
import { withAltitude } from '../lib/altitude.js'
import { searchKeyword, searchNearby, SEONGBUK_CENTER } from '../lib/kakaoPlaces.js'
import { subscribeVotes, josa } from '../feedback/index.js'
import { useCourse } from './useCourse.js'
import KakaoMap from '../components/map/KakaoMap.jsx'
import PlaceImage from '../components/place/PlaceImage.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import PlaceSheet from './screens/PlaceSheet.jsx'
import CourseSheet from './screens/CourseSheet.jsx'
import SwapSheet from './screens/SwapSheet.jsx'
import PreviewSheet from './screens/PreviewSheet.jsx'

export default function ChildApp() {
  const course = useCourse()
  const { ids, stops, route, parent, inviteId } = course
  const [tab, setTab] = useState('food')
  const [selected, setSelected] = useState(null) // 장소 객체 (검색 결과일 수도 있음)
  const [sheet, setSheet] = useState(course.fromReply ? 'course' : null) // null | 'course' | 'preview'
  const [swapId, setSwapId] = useState(null)
  const [remoteVotes, setRemoteVotes] = useState({})
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null) // { title, items, loading, error }
  const [busyId, setBusyId] = useState(null)
  const [toast, showToast] = useToast()
  const mapRef = useRef(null)

  // 2차(Firestore)를 켜면 부모님 의견이 실시간으로 들어옵니다. 1차에서는 아무 일도 하지 않아요.
  useEffect(() => subscribeVotes(inviteId, setRemoteVotes), [inviteId])

  const pick = (list, vote) => [...new Set([...list, ...Object.keys(remoteVotes).filter((k) => remoteVotes[k] === vote)])].filter((id) => ids.includes(id))
  const hardIds = useMemo(() => pick(parent.swap, 'hard'), [parent.swap, remoteVotes, ids]) // eslint-disable-line react-hooks/exhaustive-deps
  const likeIds = useMemo(() => pick(parent.like, 'like'), [parent.like, remoteVotes, ids]) // eslint-disable-line react-hooks/exhaustive-deps

  const curated = useMemo(() => PLACE_LIST.filter((p) => p.cat === tab), [tab])
  const listItems = results?.items || curated
  const path = useMemo(() => routePath(route), [route])
  const onSelectPin = useCallback((id) => setSelected(getPlace(id) || listItems.find((p) => p.id === id) || null), [listItems])
  const mapCenter = () => {
    const c = mapRef.current?.getCenter()
    return c ? { lat: c.getLat(), lng: c.getLng() } : SEONGBUK_CENTER
  }

  /** 카카오맵 장소는 높이를 먼저 알아낸 뒤 코스에 넣어요 */
  const ensureAlt = async (p) => (p.custom && p.alt == null ? withAltitude(p) : p)

  const add = async (p) => {
    setBusyId(p.id)
    try {
      const place = await ensureAlt(p)
      course.add(place)
      showToast(course.mode === 'auto' ? `${place.name} 담았어요` : `${place.name} 담았어요 · 내리막 순서에 맞춰 끼워 넣었어요`)
    } finally {
      setBusyId(null)
    }
  }
  const remove = (id) => {
    const name = getPlace(id)?.name
    course.remove(id)
    showToast(`${name} 뺐어요`)
  }
  const toggle = (p) => (ids.includes(p.id) ? remove(p.id) : add(p))

  const loadCourse = (c) => {
    course.loadCourse(c)
    setSheet('course')
  }

  const doSwap = async (oldId, p) => {
    const place = await ensureAlt(p)
    const oldName = getPlace(oldId)?.name
    course.swap(oldId, place)
    setSwapId(null)
    showToast(`${oldName} 대신 ${place.name}${josa(place.name, '을', '를')} 넣었어요`)
  }

  const runSearch = async (title, fn) => {
    setResults({ title, items: [], loading: true })
    try {
      const items = await fn()
      setResults({ title, items, loading: false, error: items.length ? null : '성북동 안에서 찾은 곳이 없어요. 다른 말로 찾아보세요.' })
    } catch (e) {
      setResults({ title, items: [], loading: false, error: e.message === 'NO_KEY' ? '카카오 키가 없어요' : '카카오맵 검색을 하지 못했어요' })
    }
  }
  const onSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (q) runSearch(`성북동 '${q}' 검색 결과`, () => searchKeyword(q, mapCenter()))
  }
  const onNearby = () => runSearch(`지도 근처 ${CATEGORIES[tab].label}`, () => searchNearby(tab, mapCenter()))
  const closeResults = () => {
    setResults(null)
    setQuery('')
  }

  return (
    <div className="app child">
      <header className="c-header">
        <div>
          <h1 className="title riso-shadow c-logo">딸, 아들 어디가</h1>
          <p className="c-tag">성북동 · 부모님 모시고 오기 좋은 동네</p>
        </div>
        <a className="c-stamp" href="#how" aria-label="이용 방법">?</a>
      </header>

      {hardIds.length > 0 && (
        <button className="reply-banner" onClick={() => setSheet('course')}>
          <span className="reply-banner-k">💌 부모님 답장</span>
          <span>
            <b>{hardIds.map((id) => getPlace(id).name).join(', ')}</b>
            {josa(getPlace(hardIds.at(-1)).name, '은', '는')} 힘들 것 같대요. 바꾸러 가기 →
          </span>
        </button>
      )}

      <section className="c-map-wrap">
        <KakaoMap
          className="c-map"
          stops={stops}
          candidates={listItems}
          path={path}
          selectedId={selected?.id}
          flagged={hardIds}
          showStation={route.finalLeg?.walkable}
          onSelect={onSelectPin}
          onReady={(m) => (mapRef.current = m)}
          fitKey={`${ids.join(',')}|${ids.length ? '' : tab}|${results?.title || ''}|${results?.loading}`}
        />
      </section>

      <section className="c-section">
        <h2 className="title c-h2">추천 코스 불러오기</h2>
        <div className="course-grid">
          {COURSES.map((c) => (
            <button key={c.id} className={`course-card ${course.courseId === c.id ? 'on' : ''}`} onClick={() => loadCourse(c)}>
              <span className="course-emoji" aria-hidden="true">{c.emoji}</span>
              <span className="course-title">{c.title}</span>
              <span className="course-sum">{c.summary}</span>
              {c.uphill && <span className="chip chip-hill">오르막 코스</span>}
            </button>
          ))}
        </div>
      </section>

      <section className="c-section">
        <h2 className="title c-h2">직접 고르기</h2>
        <form className="search" onSubmit={onSearch} role="search">
          <input
            className="search-input"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="성북동에서 찾기 (예: 칼국수, 서점)"
            enterKeyHint="search"
          />
          <button className="btn btn-dark btn-sm" type="submit">찾기</button>
        </form>

        {!results && (
          <div className="tabs" role="tablist">
            {CATEGORY_ORDER.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={tab === cat}
                className={`tab ${tab === cat ? 'on' : ''}`}
                style={{ '--cat': CATEGORIES[cat].color }}
                onClick={() => setTab(cat)}
              >
                {CATEGORIES[cat].label}
              </button>
            ))}
          </div>
        )}

        {results && (
          <div className="results-head">
            <b>{results.title}</b>
            <button className="btn btn-sm btn-ghost" onClick={closeResults}>← 추천 장소로</button>
          </div>
        )}
        {results?.loading && <p className="muted">찾는 중…</p>}
        {results?.error && <p className="muted">{results.error}</p>}

        <ul className="place-list">
          {listItems.map((p) => {
            const inCourse = ids.includes(p.id)
            return (
              <li key={p.id} className={`place-row card ${inCourse ? 'in' : ''}`}>
                <button className="place-row-main" onClick={() => setSelected(p)}>
                  <PlaceImage place={p} className="place-thumb" />
                  <span className="place-row-text">
                    <span className="place-row-name">
                      {inCourse && <span className="num">{ids.indexOf(p.id) + 1}</span>}
                      {p.name}
                    </span>
                    <span className="place-row-desc">{p.custom ? `${CATEGORIES[p.cat].label} · ${p.desc}` : p.desc}</span>
                    <span className="place-row-tags">
                      {p.custom && <span className="chip">카카오맵</span>}
                      {p.hill && <span className="chip chip-hill">경사</span>}
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                    </span>
                  </span>
                </button>
                <button className={`btn btn-sm ${inCourse ? 'btn-dark' : 'btn-primary'}`} onClick={() => toggle(p)} disabled={busyId === p.id}>
                  {busyId === p.id ? '…' : inCourse ? '빼기' : '담기'}
                </button>
              </li>
            )
          })}
        </ul>
        {!results && (
          <button className="btn btn-block btn-ghost" style={{ marginTop: 10 }} onClick={onNearby}>
            🗺️ 지도 근처 {CATEGORIES[tab].label} 더 찾기 (카카오맵)
          </button>
        )}
      </section>

      <section className="c-section how" id="how">
        <h2 className="title c-h2">이렇게 써요</h2>
        <ol>
          <li>추천 장소를 담거나, 카카오맵에서 찾아 담거나, 추천 코스를 불러와요.</li>
          <li>앱이 <b>높은 곳에서 낮은 곳으로</b> 걷는 순서를 짜 줘요. 시작 지점까지는 성북02 버스나 택시로 올라가요.</li>
          <li>날짜·시간을 넣으면 장소별 도착 시각과 쉬는 날을 알려 줘요.</li>
          <li>[초대장 보내기]로 부모님께 카톡을 보내요. 부모님이 "여기는 힘들 것 같아"를 누르면 답장이 와요.</li>
        </ol>
        <p className="small muted">
          거리·시간은 직선 거리 × 1.3으로 계산한 추정치예요. 카카오맵에서 넣은 장소의 높이는 고도 데이터로 추정해요. 운영 정보는 방문 전에 꼭 확인해 주세요.
        </p>
      </section>

      <div className="c-bar">
        {ids.length ? (
          <button className="c-bar-btn" onClick={() => setSheet('course')}>
            <span className="c-bar-count">{ids.length}</span>
            <span className="c-bar-text">
              <b>내 코스</b> · {formatKm(route.totalWalk)} · 난이도 {route.difficulty}
              {hardIds.length > 0 && <span className="chip chip-hill" style={{ marginLeft: 6 }}>바꿀 곳 {hardIds.length}</span>}
            </span>
            <span className="c-bar-go">코스 보기 ▲</span>
          </button>
        ) : (
          <div className="c-bar-empty">장소를 담거나 추천 코스를 불러와 보세요</div>
        )}
      </div>

      {selected && (
        <PlaceSheet
          place={selected}
          inCourse={ids.includes(selected.id)}
          busy={busyId === selected.id}
          onToggle={async () => {
            await toggle(selected)
            setSelected(null)
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {sheet === 'course' && (
        <CourseSheet
          course={course}
          hardIds={hardIds}
          likeIds={likeIds}
          onRemove={remove}
          onSwap={setSwapId}
          onPreview={() => setSheet('preview')}
          onClose={() => setSheet(null)}
        />
      )}

      {swapId && <SwapSheet placeId={swapId} currentIds={ids} onPick={(p) => doSwap(swapId, p)} onClose={() => setSwapId(null)} />}

      {sheet === 'preview' && (
        <PreviewSheet course={course} showToast={showToast} onBack={() => setSheet('course')} onClose={() => setSheet(null)} />
      )}

      {toast}
    </div>
  )
}
