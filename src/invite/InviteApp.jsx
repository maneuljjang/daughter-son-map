import { Fragment, useCallback, useMemo, useState } from 'react'
import { getPlace, CATEGORIES, STATION } from '../data/places.js'
import KakaoPhotoViewer from '../components/place/KakaoPhotoViewer.jsx'
import PlaceDetails from '../components/place/PlaceDetails.jsx'
import { stripPrice } from '../lib/price.js'
import { useWalkPaths, useRestrooms } from '../lib/useRouteExtras.js'
import WeatherBox from '../components/route/WeatherBox.jsx'
import FontSizeButtons from './FontSizeButtons.jsx'
import { buildSchedule, fmtTime, formatWhen } from '../lib/schedule.js'
import { buildRoute, routePath } from '../lib/route.js'
import { readParams, asset } from '../lib/url.js'
import { submitVote, getVotes, josa } from '../feedback/index.js'
import KakaoMap from '../components/map/KakaoMap.jsx'
import PlaceImage from '../components/place/PlaceImage.jsx'
import RouteSummary from '../components/route/RouteSummary.jsx'
import { SegmentInfo, FinalLegInfo } from '../components/route/SegmentInfo.jsx'
import RoadviewWalker from '../components/roadview/RoadviewWalker.jsx'
import ReplySheet from './ReplySheet.jsx'
import RouteDetail from './RouteDetail.jsx'

const roundM = (m) => Math.max(10, Math.round(m / 10) * 10)

export default function InviteApp() {
  const params = useMemo(() => readParams(), [])
  const { ids, inviteId, date, time, from, hidePrice } = params
  const stops = useMemo(() => ids.map(getPlace), [ids])
  const paths = useWalkPaths(stops)
  const route = useMemo(() => buildRoute(stops, STATION, paths), [stops, paths])
  const restrooms = useRestrooms(stops)
  const path = useMemo(() => routePath(route), [route])
  const schedule = useMemo(() => buildSchedule(route, time), [route, time])
  const [votes, setVotes] = useState(() => getVotes(inviteId))
  const [walkFrom, setWalkFrom] = useState(undefined) // undefined: 닫힘, null: 처음부터, id: 그 장소부터
  const [replyOpen, setReplyOpen] = useState(false)
  const [photoOf, setPhotoOf] = useState(null)
  const [routeOpen, setRouteOpen] = useState(false)
  const closeRoute = useCallback(() => setRouteOpen(false), [])
  const closePhoto = useCallback(() => setPhotoOf(null), [])

  if (!stops.length) {
    return (
      <div className="app invite">
        <div className="iv-empty card">
          <h1 className="title">초대장을 찾지 못했어요</h1>
          <p>카카오톡으로 받은 [초대장 열기] 버튼을 다시 눌러 주세요.</p>
          <a className="btn btn-primary btn-lg btn-block" href={asset('')}>코스 직접 둘러보기</a>
        </div>
      </div>
    )
  }

  const vote = (placeId, v) => {
    const next = votes[placeId] === v ? null : v
    setVotes((prev) => {
      const copy = { ...prev }
      if (next) copy[placeId] = next
      else delete copy[placeId]
      return copy
    })
    submitVote(inviteId, placeId, next)
  }
  const voteCount = Object.keys(votes).filter((k) => ids.includes(k)).length

  const openWalk = (id) => setWalkFrom(id)

  return (
    <div className="app invite">
      <div className="iv-top">
        <span className="iv-from">{from ? `${from}${josa(from, '이', '가')} 보낸 초대장` : '딸, 아들이 보낸 초대장'}</span>
        <FontSizeButtons />
      </div>

      {/* 초대장 소개 */}
      <header className="iv-cover">
        <h1 className="title iv-headline">
          엄마, 아빠!
          <br />
          이번에 <span className="iv-hl">여기</span> 같이 가요.
        </h1>
        {(date || time) && (
          <p className="iv-when">
            {formatWhen(date, time)}
            {time ? ' 출발' : ''}
          </p>
        )}
      </header>

      {/* 오늘의 나들이 요약: 거리 · 시간 · 난이도 + 날씨 한 줄 */}
      <section className="iv-today" aria-label="오늘의 나들이 요약">
        <RouteSummary route={route} large />
        <WeatherBox date={date} time={time} compact />
      </section>

      {/* 이동 경로: 작은 지도 미리보기 → 누르면 자세히 */}
      <section className="iv-section iv-route-sec">
        <div className="iv-map-wrap">
          <KakaoMap className="iv-map" locked stops={stops} path={path} showStation={route.finalLeg?.walkable} fitKey={ids.join(',')} />
          <button className="iv-map-tap" onClick={() => setRouteOpen(true)} aria-label="경로 자세히 보기" />
        </div>
        <div className="btn-row iv-map-actions">
          <button className="btn" onClick={() => setRouteOpen(true)}>🗺️ 경로 자세히 보기</button>
          <button className="btn" onClick={() => openWalk(null)}>🚶 길 미리 걸어보기</button>
        </div>
      </section>

      {/* 함께 갈 장소 */}
      <section className="iv-section iv-pick">
        <div className="iv-pick-head">
          <h2 className="title iv-h2">함께 갈 장소</h2>
          <p className="iv-note">마음에 드는 곳을 선택해주세요.</p>
        </div>
        <ol className="iv-list">
          {stops.map((p, i) => {
            const wc = restrooms.byStop[p.id]
            const s = schedule?.[i]
            const notice = [p.hill && '경사나 계단이 있어요.', p.notice].filter(Boolean).join(' ')
            const v = votes[p.id]
            return (
              <Fragment key={p.id}>
                <li className={`iv-card ${v ? `voted-${v}` : ''}`}>
                  <div className="iv-card-head">
                    <div className="iv-thumb-wrap">
                      <PlaceImage place={p} className="iv-thumb" />
                      <span className="iv-num" style={{ background: CATEGORIES[p.cat].color }}>{i + 1}</span>
                    </div>
                    <div className="iv-card-title">
                      <h3 className="title iv-name">
                        {p.name}
                        {p.hill && <span className="chip chip-hill iv-hill">계단·경사</span>}
                      </h3>
                      <div className="iv-cat">
                        {s ? <b className="iv-time">{fmtTime(s.arrive)} 도착 · {s.stay}분 머물러요</b> : CATEGORIES[p.cat].label}
                      </div>
                      <p className="iv-desc">{hidePrice ? stripPrice(p.desc) : p.desc}</p>
                    </div>
                  </div>

                  <div className="btn-row iv-votes" role="group" aria-label={`${p.name} 어떠세요?`}>
                    <button className={`iv-vote like ${v === 'like' ? 'on' : ''}`} onClick={() => vote(p.id, 'like')} aria-pressed={v === 'like'}>
                      <span aria-hidden="true">👍</span> 좋아요
                    </button>
                    <button className={`iv-vote hard ${v === 'hard' ? 'on' : ''}`} onClick={() => vote(p.id, 'hard')} aria-pressed={v === 'hard'}>
                      <span aria-hidden="true">😮‍💨</span> 힘들 것 같아요
                    </button>
                  </div>

                  {/* 길·사진·메뉴·여는 시간·화장실 같은 부가 정보는 접어 두기 */}
                  <details className="iv-more">
                    <summary>자세히 보기</summary>
                    <div className="btn-row iv-actions">
                      <button className="btn" onClick={() => openWalk(p.id)}>🚶 거리 보기</button>
                      <button className="btn" onClick={() => setPhotoOf(p)}>
                        📷 {p.cat === 'food' ? '식당 사진' : p.cat === 'cafe' ? '가게 사진' : '사진 보기'}
                      </button>
                    </div>
                    {p.about && <PlaceDetails place={p} hidePrice={hidePrice} />}
                    <dl className="iv-info">
                      {p.hoursText && (
                        <div>
                          <dt>🕘 여는 시간</dt>
                          <dd>{p.hoursText}</dd>
                        </div>
                      )}
                      {p.fee && (
                        <div>
                          <dt>🎫 입장료</dt>
                          <dd>{p.fee}</dd>
                        </div>
                      )}
                      {p.parking && (
                        <div>
                          <dt>🚗 주차</dt>
                          <dd>{hidePrice ? stripPrice(p.parking) : p.parking}</dd>
                        </div>
                      )}
                      <div>
                        <dt>🚻 화장실</dt>
                        <dd>{wc ? `${wc.name} · ${roundM(wc.meters)}m` : '근처 정보가 없어요. 식당·카페에서 이용하세요.'}</dd>
                      </div>
                      <div>
                        <dt>🪑 쉬는 곳</dt>
                        <dd>{p.rest || (p.custom ? '카카오맵에서 확인해 주세요.' : '확인 중이에요.')}</dd>
                      </div>
                      {notice && (
                        <div>
                          <dt>📌 알아두기</dt>
                          <dd>{notice}</dd>
                        </div>
                      )}
                    </dl>
                  </details>
                </li>
                {route.segments[i] && <SegmentInfo segment={route.segments[i]} />}
              </Fragment>
            )
          })}
        </ol>
        <FinalLegInfo finalLeg={route.finalLeg} />
      </section>

      <div className="iv-bar">
        <p className="iv-bar-status">
          {voteCount === 0
            ? '장소를 골라 주시면 의견을 보낼 수 있어요'
            : voteCount < stops.length
              ? `${stops.length}곳 중 ${voteCount}곳 골랐어요`
              : '다 골랐어요! 의견을 보내 주세요'}
        </p>
        <button className="btn btn-primary btn-lg btn-block" onClick={() => setReplyOpen(true)}>
          의견 보내기
        </button>
      </div>

      {routeOpen && (
        <RouteDetail
          route={route}
          stops={stops}
          path={path}
          restrooms={restrooms.all}
          fitKey={ids.join(',')}
          onWalk={() => openWalk(null)}
          onClose={closeRoute}
        />
      )}
      {walkFrom !== undefined && <RoadviewWalker route={route} startStopId={walkFrom} onClose={() => setWalkFrom(undefined)} />}
      {photoOf && <KakaoPhotoViewer place={photoOf} onClose={closePhoto} />}
      {replyOpen && <ReplySheet ids={ids} inviteId={inviteId} votes={votes} extra={{ date, time, from, hidePrice }} onClose={() => setReplyOpen(false)} />}
    </div>
  )
}
