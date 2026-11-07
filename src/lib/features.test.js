import { describe, it, expect } from 'vitest'
import { PLACES, getPlace, registerPlaces } from '../data/places.js'
import { buildRoute, insertIndex, sortDownhill } from './route.js'
import { buildSchedule, scheduleWarnings, weekdayOf, formatWhen, fmtTime } from './schedule.js'
import { encodeCustom, decodeCustom } from './customCodec.js'
import { rankFromElevation, rankFromNeighbors } from './altitude.js'

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
