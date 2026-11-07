import { useCallback, useEffect, useMemo, useState } from 'react'
import { CATEGORIES, CATEGORY_ORDER, PLACE_LIST, PLACES } from '../data/places.js'
import { COURSES } from '../data/courses.js'
import { routePath, formatKm } from '../lib/route.js'
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
  const [selectedId, setSelectedId] = useState(null)
  const [sheet, setSheet] = useState(course.fromReply ? 'course' : null) // null | 'course' | 'preview'
  const [swapId, setSwapId] = useState(null)
  const [remoteVotes, setRemoteVotes] = useState({})
  const [toast, showToast] = useToast()

  // 2차(Firestore)를 켜면 부모님 의견이 실시간으로 들어옵니다. 1차에서는 아무 일도 하지 않아요.
  useEffect(() => subscribeVotes(inviteId, setRemoteVotes), [inviteId])

  const hardIds = useMemo(
    () => [...new Set([...parent.swap, ...Object.keys(remoteVotes).filter((k) => remoteVotes[k] === 'hard')])].filter((id) => ids.includes(id)),
    [parent.swap, remoteVotes, ids],
  )
  const likeIds = useMemo(
    () => [...new Set([...parent.like, ...Object.keys(remoteVotes).filter((k) => remoteVotes[k] === 'like')])].filter((id) => ids.includes(id)),
    [parent.like, remoteVotes, ids],
  )

  const candidates = useMemo(() => PLACE_LIST.filter((p) => p.cat === tab), [tab])
  const path = useMemo(() => routePath(route), [route])
  const onSelect = useCallback((id) => setSelectedId(id), [])

  const add = (id) => {
    const resorted = course.add(id)
    showToast(resorted ? `${PLACES[id].name} 담았어요 · 내리막 순서로 다시 정렬했어요` : `${PLACES[id].name} 담았어요`)
  }
  const remove = (id) => {
    course.remove(id)
    showToast(`${PLACES[id].name} 뺐어요`)
  }
  const toggle = (id) => (ids.includes(id) ? remove(id) : add(id))

  const loadCourse = (c) => {
    course.loadCourse(c)
    setSheet('course')
  }

  const doSwap = (oldId, newId) => {
    course.swap(oldId, newId)
    setSwapId(null)
    showToast(`${PLACES[oldId].name} 대신 ${PLACES[newId].name}${josa(PLACES[newId].name, '을', '를')} 넣었어요`)
  }

  const selected = selectedId ? PLACES[selectedId] : null

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
            <b>{hardIds.map((id) => PLACES[id].name).join(', ')}</b>
            {josa(PLACES[hardIds.at(-1)].name, '은', '는')} 힘들 것 같대요. 바꾸러 가기 →
          </span>
        </button>
      )}

      <section className="c-map-wrap">
        <KakaoMap
          className="c-map"
          stops={stops}
          candidates={candidates}
          path={path}
          selectedId={selectedId}
          flagged={hardIds}
          showStation={route.finalLeg?.walkable}
          onSelect={onSelect}
          fitKey={`${ids.join(',')}|${ids.length ? '' : tab}`}
        />
      </section>

      <section className="c-section">
        <h2 className="title c-h2">추천 코스 불러오기</h2>
        <div className="course-row">
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
        <ul className="place-list">
          {candidates.map((p) => {
            const inCourse = ids.includes(p.id)
            return (
              <li key={p.id} className={`place-row card ${inCourse ? 'in' : ''}`}>
                <button className="place-row-main" onClick={() => setSelectedId(p.id)}>
                  <PlaceImage place={p} className="place-thumb" />
                  <span className="place-row-text">
                    <span className="place-row-name">
                      {inCourse && <span className="num">{ids.indexOf(p.id) + 1}</span>}
                      {p.name}
                    </span>
                    <span className="place-row-desc">{p.desc}</span>
                    <span className="place-row-tags">
                      {p.hill && <span className="chip chip-hill">경사</span>}
                      {p.tags.slice(0, 2).map((t) => (
                        <span key={t} className="chip">{t}</span>
                      ))}
                    </span>
                  </span>
                </button>
                <button className={`btn btn-sm ${inCourse ? 'btn-dark' : 'btn-primary'}`} onClick={() => toggle(p.id)}>
                  {inCourse ? '빼기' : '담기'}
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="c-section how" id="how">
        <h2 className="title c-h2">이렇게 써요</h2>
        <ol>
          <li>밥·카페·즐길거리·산책 장소를 담거나 추천 코스를 불러와요.</li>
          <li>앱이 <b>높은 곳에서 낮은 곳으로</b> 걷는 순서를 짜 줘요. 시작 지점까지는 성북02 버스나 택시로 올라가요.</li>
          <li>[초대장 보내기]로 부모님께 카톡을 보내요.</li>
          <li>부모님이 "여기는 힘들 것 같아"를 누르면 답장이 와요. 같은 종류의 다른 곳으로 바꿔 다시 보내요.</li>
        </ol>
        <p className="small muted">거리·시간은 직선 거리 × 1.3으로 계산한 추정치예요. 운영 정보는 방문 전에 꼭 확인해 주세요.</p>
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
          onToggle={() => {
            toggle(selected.id)
            setSelectedId(null)
          }}
          onClose={() => setSelectedId(null)}
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

      {swapId && <SwapSheet placeId={swapId} currentIds={ids} onPick={(newId) => doSwap(swapId, newId)} onClose={() => setSwapId(null)} />}

      {sheet === 'preview' && (
        <PreviewSheet
          route={route}
          ids={ids}
          inviteId={inviteId}
          setInviteId={course.setInviteId}
          showToast={showToast}
          onBack={() => setSheet('course')}
          onClose={() => setSheet(null)}
        />
      )}

      {toast}
    </div>
  )
}
