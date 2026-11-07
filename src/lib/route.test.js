import { describe, it, expect } from 'vitest'
import { sortDownhill, buildRoute, difficultyOf, alternativesFor, walkSteps, formatKm } from './route.js'
import { PLACES, PLACE_LIST } from '../data/places.js'
import { COURSES } from '../data/courses.js'

const P = (ids) => ids.map((id) => PLACES[id])

describe('sortDownhill', () => {
  it('높은 곳(alt 작은 값)부터 낮은 곳 순서로 정렬한다', () => {
    const sorted = sortDownhill(P(['napoleon', 'guk', 'gilsang', 'seonjam', 'simujang']))
    const alts = sorted.map((p) => p.alt)
    expect(alts).toEqual([...alts].sort((a, b) => a - b))
    expect(sorted[0].id).toBe('gilsang')
    expect(sorted.at(-1).id).toBe('napoleon')
  })

  it('같은 높이면 앞 장소에서 가까운 순', () => {
    // alt 3: guk(서쪽) / suyeon, sbmuseum(동쪽 가까이 붙어 있음)
    const sorted = sortDownhill(P(['sbmuseum', 'guk', 'suyeon']))
    // 첫 장소는 역에서 가장 먼 guk, 다음은 guk에서 가까운 순
    expect(sorted.map((p) => p.id)).toEqual(['guk', 'sbmuseum', 'suyeon'])
  })

  it('장소를 잃어버리지 않는다', () => {
    expect(sortDownhill(PLACE_LIST)).toHaveLength(PLACE_LIST.length)
  })
})

describe('difficultyOf', () => {
  it('거리 기준', () => {
    expect(difficultyOf(1200, false)).toBe('하')
    expect(difficultyOf(1201, false)).toBe('중')
    expect(difficultyOf(1800, false)).toBe('중')
    expect(difficultyOf(1801, false)).toBe('상')
  })
  it('hill 장소가 있으면 최소 중', () => {
    expect(difficultyOf(300, true)).toBe('중')
    expect(difficultyOf(2500, true)).toBe('상')
  })
})

describe('buildRoute', () => {
  it('추천 코스 4종의 요약을 계산한다', () => {
    for (const c of COURSES) {
      const r = buildRoute(P(c.stops))
      expect(r.segments).toHaveLength(c.stops.length - 1)
      expect(r.totalWalk).toBeGreaterThan(0)
      console.log(c.title, formatKm(r.totalWalk), r.totalMinutes + '분', r.difficulty, '오르막', r.uphillCount, '역까지 도보', r.finalLeg.walkable)
    }
  })

  it('미술관 코스는 오르막 구간이 있고 마지막에 걸어서 역으로 가지 않는다', () => {
    const r = buildRoute(P(COURSES[1].stops))
    expect(r.uphillCount).toBeGreaterThan(0)
    expect(r.finalLeg.walkable).toBe(false)
  })

  it('나폴레옹과자점에서 끝나면 역까지 걸어간다', () => {
    const r = buildRoute(P(COURSES[0].stops))
    expect(r.finalLeg.walkable).toBe(true)
  })

  it('산책 코스는 hill 포함이라 최소 중', () => {
    expect(buildRoute(P(COURSES[3].stops)).difficulty).not.toBe('하')
  })
})

describe('alternativesFor', () => {
  it('같은 종류, 코스에 없는 곳만, 경사 없는 곳 먼저', () => {
    const alts = alternativesFor('simujang', ['simujang', 'seonjam'])
    expect(alts.every((a) => a.place.cat === 'fun')).toBe(true)
    expect(alts.find((a) => a.place.id === 'seonjam')).toBeUndefined()
    expect(alts[0].place.hill).toBe(false)
  })
})

describe('walkSteps', () => {
  it('장소마다 stop 단계가 있고, 다음 지점을 가리킨다', () => {
    const steps = walkSteps(buildRoute(P(COURSES[0].stops)))
    expect(steps.filter((s) => s.kind === 'stop')).toHaveLength(5)
    expect(steps.at(-1).kind).toBe('end')
    expect(steps.at(-1).next).toBeNull()
    expect(steps[0].next).not.toBeNull()
  })
})
