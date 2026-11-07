import { Fragment, useMemo, useState } from 'react'
import { getPlace, CATEGORIES, kakaoMapLink, STATION } from '../data/places.js'
import { useWalkPaths, useRestrooms } from '../lib/useRouteExtras.js'
import WeatherBox from '../components/route/WeatherBox.jsx'
import FontSizeButtons from './FontSizeButtons.jsx'
import { buildSchedule, fmtTime, formatWhen } from '../lib/schedule.js'
import { START_GUIDE, BUS } from '../data/transit.js'
import { buildRoute, routePath, formatKm, formatMin } from '../lib/route.js'
import { readParams, asset } from '../lib/url.js'
import { submitVote, getVotes, josa } from '../feedback/index.js'
import KakaoMap from '../components/map/KakaoMap.jsx'
import PlaceImage from '../components/place/PlaceImage.jsx'
import RouteSummary from '../components/route/RouteSummary.jsx'
import { SegmentInfo, FinalLegInfo } from '../components/route/SegmentInfo.jsx'
import RoadviewWalker from '../components/roadview/RoadviewWalker.jsx'
import ReplySheet from './ReplySheet.jsx'

export default function InviteApp() {
  const params = useMemo(() => readParams(), [])
  const { ids, inviteId, date, time, from } = params
  const stops = useMemo(() => ids.map(getPlace), [ids])
  const paths = useWalkPaths(stops)
  const route = useMemo(() => buildRoute(stops, STATION, paths), [stops, paths])
  const restrooms = useRestrooms(stops)
  const path = useMemo(() => routePath(route), [route])
  const schedule = useMemo(() => buildSchedule(route, time), [route, time])
  const [votes, setVotes] = useState(() => getVotes(inviteId))
  const [walkFrom, setWalkFrom] = useState(undefined) // undefined: 닫힘, null: 처음부터, id: 그 장소부터
  const [replyOpen, setReplyOpen] = useState(false)

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

  return (
    <div className="app invite">
      {/* 표지 */}
      <FontSizeButtons />
      <header className="iv-cover">
        <p className="iv-from">💌 {from ? `${from}${josa(from, '이', '가')} 보낸 초대장` : '딸, 아들이 보낸 초대장'}</p>
        <h1 className="title iv-headline riso-shadow">
          엄마, 아빠
          <br />
          이번에 올라오시면
          <br />
          <span className="iv-hl">여기 가요</span>
        </h1>
        {(date || time) && <p className="iv-when">📅 {formatWhen(date, time)}</p>}
        <WeatherBox date={date} time={time} large />
        <p className="iv-place-line">
          {stops.map((p, i) => (
            <Fragment key={p.id}>
              {i > 0 && <span className="iv-arrow"> → </span>}
              <span>{p.name}</span>
            </Fragment>
          ))}
        </p>
        <RouteSummary route={route} large />
        <div className="notice-box iv-start">
          <b>🚌 출발은 이렇게</b>
          <br />
          {START_GUIDE(stops[0].name)}
        </div>
        <button className="btn btn-dark btn-lg btn-block iv-walk" onClick={() => setWalkFrom(null)}>
          🚶 길 미리 걸어보기
        </button>
        <p className="iv-hint">실제 거리 사진으로 코스를 따라 걸어 볼 수 있어요</p>
      </header>

      {/* 지도 */}
      <section className="iv-section">
        <h2 className="title iv-h2">코스 지도</h2>
        <KakaoMap className="iv-map" stops={stops} path={path} restrooms={restrooms.all} showStation={route.finalLeg?.walkable} fitKey={ids.join(',')} />
        <p className="iv-note">숫자 순서대로 걸어요. 높은 곳에서 낮은 곳으로 내려오는 길이에요.{restrooms.all.length > 0 && ' 🚻 표시는 화장실이에요.'}</p>
      </section>

      {/* 장소 카드 */}
      <section className="iv-section">
        <h2 className="title iv-h2">갈 곳 {stops.length}곳</h2>
        <p className="iv-note" style={{ marginTop: -4 }}>마음에 드시면 [좋아요], 힘드실 것 같으면 [여기는 힘들 것 같아]를 눌러 주세요.</p>
        <ol className="iv-list">
          {stops.map((p, i) => (
            <Fragment key={p.id}>
              <li className="iv-card card">
                <div className="iv-card-head">
                  <span className="iv-num" style={{ background: CATEGORIES[p.cat].color }}>{i + 1}</span>
                  <div>
                    <div className="iv-cat">{CATEGORIES[p.cat].label}</div>
                    <h3 className="title iv-name">{p.name}</h3>
                  </div>
                </div>
                {schedule && (
                  <p className="iv-time">
                    🕛 {fmtTime(schedule[i].arrive)} 도착 · 약 {schedule[i].stay}분 머물러요
                  </p>
                )}
                <PlaceImage place={p} />
                <p className="iv-desc">{p.desc}</p>
                <dl className="iv-dl">
                  <dt>🚻 화장실</dt>
                  <dd>
                    {restrooms.byStop[p.id]
                      ? `${restrooms.byStop[p.id].name} · 약 ${Math.max(10, Math.round(restrooms.byStop[p.id].meters / 10) * 10)}m`
                      : '근처 공중화장실 정보가 없어요. 식당·카페에서 이용하세요.'}
                  </dd>
                  <dt>🪑 쉬는 곳</dt>
                  <dd>{p.rest || (p.custom ? '카카오맵에서 확인해 주세요' : '쉬는 곳 정보는 확인 중이에요')}</dd>
                  {(p.notice || p.hill) && (
                    <>
                      <dt>📌 알아두세요</dt>
                      <dd>{[p.hill && '경사나 계단이 있어요.', p.notice].filter(Boolean).join(' ')}</dd>
                    </>
                  )}
                </dl>
                <button className="btn btn-block iv-peek" onClick={() => setWalkFrom(p.id)}>📷 이 장소 거리 미리 보기</button>
                <a className="btn btn-block iv-peek" href={kakaoMapLink(p)} target="_blank" rel="noreferrer">🗺️ 카카오맵에서 사진·영업시간 보기</a>
                <div className="iv-votes">
                  <button className={`iv-vote like ${votes[p.id] === 'like' ? 'on' : ''}`} onClick={() => vote(p.id, 'like')} aria-pressed={votes[p.id] === 'like'}>
                    👍 좋아요
                  </button>
                  <button className={`iv-vote hard ${votes[p.id] === 'hard' ? 'on' : ''}`} onClick={() => vote(p.id, 'hard')} aria-pressed={votes[p.id] === 'hard'}>
                    😮‍💨 여기는 힘들 것 같아
                  </button>
                </div>
              </li>
              {route.segments[i] && <SegmentInfo segment={route.segments[i]} />}
            </Fragment>
          ))}
        </ol>
        <FinalLegInfo finalLeg={route.finalLeg} />
      </section>

      <section className="iv-section iv-foot">
        <p>
          걷는 길은 모두 합쳐 약 <b>{formatKm(route.totalWalk)}</b>, <b>{formatMin(route.totalMinutes)}</b> 정도예요{route.real ? ' (실제 길 기준)' : ' (추정치)'}.
          <br />
          힘드시면 언제든 마을버스 {BUS}를 타면 돼요.
        </p>
        <p className="small muted">운영 시간과 휴무일은 방문 전에 다시 확인할게요.</p>
      </section>

      <div className="iv-bar">
        <button className="btn btn-kakao btn-lg btn-block" onClick={() => setReplyOpen(true)}>
          💬 답장 보내기{voteCount ? ` (${voteCount})` : ''}
        </button>
      </div>

      {walkFrom !== undefined && <RoadviewWalker route={route} startStopId={walkFrom} onClose={() => setWalkFrom(undefined)} />}
      {replyOpen && <ReplySheet ids={ids} inviteId={inviteId} votes={votes} extra={{ date, time, from }} onClose={() => setReplyOpen(false)} />}
    </div>
  )
}
