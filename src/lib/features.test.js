import { describe, it, expect } from 'vitest'
import { PLACES, getPlace, registerPlaces } from '../data/places.js'
import { buildRoute, insertIndex, sortDownhill } from './route.js'
import { buildSchedule, scheduleWarnings, weekdayOf, formatWhen, fmtTime } from './schedule.js'
import { encodeCustom, decodeCustom } from './customCodec.js'
import { rankFromElevation, rankFromNeighbors } from './altitude.js'
import { isSeongbukdong, legalDongOf } from './kakaoPlaces.js'

const P = (ids) => ids.map(getPlace)

describe('schedule', () => {
  it('요일 계산', () => {
    expect(weekdayOf('2026-11-23')).toBe(1) // 월
    expect(weekdayOf('2026-11-22')).toBe(0) // 일
  })
  it('날짜·시간 표시', () => {
    expect(formatWhen('2026-11-23', '12:00')).toBe('11월 23일 (월) 낮 12시')
    expect(formatWhen('', '15:30')).toBe('오후 3시 30분')
  })
  it('도착 시각 = 출발 + 머무는 시간 + 걷는 시간', () => {
    const route = buildRoute(P(['guk', 'suyeon', 'napoleon']))
    const s = buildSchedule(route, '12:00')
    expect(fmtTime(s[0].arrive)).toBe('12:00')
    expect(s[1].arrive).toBe(s[0].arrive + 70 + route.segments[0].minutes)
  })
  it('월요일에 수연산방이면 휴무 경고', () => {
    const route = buildRoute(P(['guk', 'suyeon']))
    const w = scheduleWarnings(route, '2026-11-23', buildSchedule(route, '12:00'))
    expect(w.map((x) => x.text).join()).toContain('수연산방은 월요일에 쉬어요')
  })
  it('서촌누각에 15시 이후 도착하면 영업시간 경고', () => {
    const route = buildRoute(P(['seochon']))
    const w = scheduleWarnings(route, '', buildSchedule(route, '15:20'))
    expect(w[0].text).toContain('11:00~15:00')
  })
})

describe('카카오맵 장소', () => {
  const custom = { id: 'k12345', name: '성북동 칼국수 & 만두', lat: 37.59412, lng: 126.99601, cat: 'food', alt: 3, addr: '성북로 1', desc: '한식 · 칼국수' }

  it('주소에 담았다 꺼내도 같다 (한글·특수문자 포함)', () => {
    const [back] = decodeCustom(encodeCustom([custom]))
    expect(back).toMatchObject(custom)
    expect(back.kakaoUrl).toBe('https://place.map.kakao.com/12345')
  })
  it('잘못된 값은 무시', () => {
    expect(decodeCustom('%%%')).toEqual([])
    expect(decodeCustom(encodeCustom([{ ...custom, id: 'guk' }]))).toEqual([])
  })
  it('등록하면 getPlace 로 찾고 정렬에 섞인다', () => {
    registerPlaces([custom])
    expect(getPlace('k12345').custom).toBe(true)
    const ids = sortDownhill(P(['napoleon', 'k12345', 'gilsang'])).map((p) => p.id)
    expect(ids).toEqual(['gilsang', 'k12345', 'napoleon'])
  })
})

describe('높이 추정', () => {
  it('고도(m) → 등급', () => {
    expect(rankFromElevation(154)).toBe(1)
    expect(rankFromElevation(111)).toBe(2)
    expect(rankFromElevation(85)).toBe(3)
    expect(rankFromElevation(64)).toBe(4)
    expect(rankFromElevation(46)).toBe(5)
  })
  it('기존 장소 바로 옆이면 그 장소 등급', () => {
    expect(rankFromNeighbors({ lat: PLACES.napoleon.lat + 0.0001, lng: PLACES.napoleon.lng })).toBe(5)
  })
})

describe('insertIndex', () => {
  it('내리막을 깨지 않는 자리에 끼운다', () => {
    const stops = P(['guk', 'seonjam', 'napoleon']) // 3, 4, 5
    expect(insertIndex(stops, PLACES.gilsang)).toBe(0) // 1 → 맨 앞
    expect(insertIndex(stops, PLACES.kansong)).toBe(2) // 4 → 5 앞
    expect(insertIndex(stops, PLACES.chapeau)).toBe(3) // 5 → 맨 뒤
  })
})

describe('성북동 범위', () => {
  const doc = (address_name) => ({ address_name })
  it('행정동 성북동의 법정동 4곳만 통과', () => {
    for (const a of ['서울 성북구 성북동 330-115', '서울 성북구 성북동1가 35-2', '서울 성북구 동소문동1가 20', '서울 성북구 동소문동4가 1-1']) {
      expect(isSeongbukdong(doc(a))).toBe(true)
    }
  })
  it('근처 다른 동은 빠짐', () => {
    for (const a of ['서울 성북구 동소문동2가 1', '서울 성북구 삼선동1가 3', '서울 성북구 동선동1가 9', '서울 종로구 명륜3가 1', '서울 종로구 혜화동 5', '서울 성북구 성북동2가 1', '']) {
      expect(isSeongbukdong(doc(a))).toBe(false)
    }
  })
  it('법정동 이름 뽑기', () => {
    expect(legalDongOf('서울 성북구 동소문동1가 20')).toBe('동소문동1가')
  })
})

import { adviceOf, describeCode, daysFromToday } from './weather.js'
import { parseTmap, fresh, MAX_AGE_MS } from './walkRoute.js'
import { legKey } from './walkRoute.js'
import { pointAlong } from './geo.js'
import { routePath, walkSteps } from './route.js'
import { STATION } from '../data/places.js'

describe('날씨', () => {
  it('코드 → 말', () => {
    expect(describeCode(0).text).toBe('맑음')
    expect(describeCode(63).text).toBe('비')
  })
  it('한마디', () => {
    expect(adviceOf({ code: 61, tMin: 10, tMax: 15, rain: 80 })[0]).toContain('우산')
    expect(adviceOf({ code: 0, tMin: 1, tMax: 8, rain: 0 }).join()).toContain('두툼')
    expect(adviceOf({ code: 1, tMin: 12, tMax: 20, rain: 10 })).toEqual(['걷기 좋은 날씨예요.'])
  })
  it('며칠 뒤', () => {
    expect(daysFromToday('2026-11-10', new Date('2026-11-08T12:00:00+09:00'))).toBe(2)
  })
})

describe('실제 걷는 길', () => {
  const tmap = {
    features: [
      { geometry: { type: 'Point', coordinates: [126.99, 37.59] }, properties: { totalDistance: 420, totalTime: 360 } },
      { geometry: { type: 'LineString', coordinates: [[126.99, 37.59], [126.991, 37.5905]] }, properties: {} },
      { geometry: { type: 'LineString', coordinates: [[126.991, 37.5905], [126.992, 37.591]] }, properties: {} },
    ],
  }
  it('TMAP 응답 읽기 (겹치는 점은 한 번만)', () => {
    const w = parseTmap(tmap)
    expect(w.meters).toBe(420)
    expect(w.coords).toHaveLength(3)
    expect(parseTmap({})).toBeNull()
  })
  it('저장한 경로는 24시간 안에만 다시 씀 (TMAP 약관)', () => {
    const now = Date.now()
    expect(fresh({ at: now - 60 * 60 * 1000 }, now)).toBe(true)
    expect(fresh({ at: now - MAX_AGE_MS - 1 }, now)).toBe(false)
    expect(fresh({ meters: 1 }, now)).toBe(false)
  })
  it('길 위의 지점', () => {
    const mid = pointAlong([{ lat: 0, lng: 0 }, { lat: 0, lng: 1 }, { lat: 0, lng: 2 }], 0.5)
    expect(mid.lng).toBeCloseTo(1, 5)
  })
  it('실제 길이 있으면 거리·선·라벨이 바뀐다', () => {
    const stops = P(['seonjam', 'napoleon'])
    const est = buildRoute(stops)
    expect(est.real).toBe(false)
    const coords = [{ lat: 37.592, lng: 127.0 }, { lat: 37.590, lng: 127.003 }]
    const paths = {
      [legKey(stops[0], stops[1])]: { meters: 999, coords },
      [legKey(stops[1], STATION)]: { meters: 150, coords: [{ lat: 37.5888, lng: 127.006 }] },
    }
    const real = buildRoute(stops, STATION, paths)
    expect(real.segments[0].walk).toBe(999)
    expect(real.real).toBe(true)
    expect(real.totalWalk).toBe(999 + 150)
    expect(routePath(real).length).toBe(1 + 2 + 1 + 1 + 1)
    const pathStep = walkSteps(real).find((s) => s.kind === 'path')
    expect(pathStep.pos.lat).toBeLessThan(37.5932) // 직선이 아니라 길 위 지점
  })
})
