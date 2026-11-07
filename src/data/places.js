// 성북동 장소 데이터
// - 좌표: [위도, 경도]
// - alt (altitudeRank): 1 = 가장 높음 … 5 = 가장 낮음 (대략값)
// - hill: true 면 경사·계단이 있어 난이도가 최소 '중'
// - 운영 정보는 2026년 11월 기준이며, 방문 전 다시 확인이 필요합니다.
// - rest: 앉아서 쉬는 곳 정보. 확인되지 않은 곳은 null 로 두고 화면에 "확인 중"으로 표시합니다.
// - short: 답장 문구처럼 짧게 부를 때 쓰는 이름 (없으면 name)
// - photo: public/places/<id>.jpg 가 있으면 자동으로 사진을 보여 줍니다. (팀이 직접 찍은 사진을 넣어 주세요)

export const CATEGORIES = {
  food: { label: '밥', short: '밥', color: 'var(--c-food)' },
  cafe: { label: '카페·디저트', short: '카페', color: 'var(--c-cafe)' },
  fun: { label: '즐길거리', short: '즐길', color: 'var(--c-fun)' },
  walk: { label: '산책', short: '산책', color: 'var(--c-walk)' },
}

export const CATEGORY_ORDER = ['food', 'cafe', 'fun', 'walk']

const list = [
  // ── 밥 ────────────────────────────────
  {
    id: 'guk', cat: 'food', name: '국화정원', addr: '성북로 154',
    lat: 37.5945261, lng: 126.9926888, alt: 3,
    desc: '한옥에서 먹는 한정식과 간장게장. 부모님 입맛에 잘 맞는 상차림이에요.',
    rest: '가족용 룸이 있어 편하게 앉아서 식사할 수 있어요.',
    tags: ['가족용 룸', '주차 가능'],
    notice: '휴무일은 방문 전에 확인해 주세요.',
  },
  {
    id: 'seochon', cat: 'food', name: '서촌누각', addr: '혜화로 88 1층',
    lat: 37.5927101, lng: 126.9981407, alt: 4,
    desc: '건강한 한식 한상. 창밖으로 성북동 풍경이 보여요.',
    rest: '실내 좌석에서 성북동 전망을 보며 쉴 수 있어요.',
    tags: ['점심만 11~15시', '전망'],
    notice: '점심(11~15시)에만 영업해요.',
  },
  {
    id: 'ihyang', cat: 'food', name: '이향', addr: '성북로26길 13',
    lat: 37.5949114, lng: 126.9942939, alt: 3,
    desc: '단호박 영양밥과 돌솥밥. 속이 편한 한 끼예요.',
    rest: null,
    tags: ['영양밥', '돌솥밥'],
    notice: '점심 시간에는 기다릴 수 있어요.',
  },
  {
    id: 'munhwa', short: '문화식당', cat: 'food', name: '문화식당 성북동', addr: '혜화로 88 2층',
    lat: 37.5926993, lng: 126.9981807, alt: 4,
    desc: '루프탑에서 전망을 보며 먹는 양식. 1인 17,000~45,000원.',
    rest: '루프탑 자리에서 전망을 보며 쉬어 갈 수 있어요.',
    tags: ['루프탑', '예약 권장'],
    notice: '예약을 권장해요.',
  },

  // ── 카페·디저트 ───────────────────────
  {
    id: 'suyeon', cat: 'cafe', name: '수연산방', addr: '성북로26길 8',
    lat: 37.5950949, lng: 126.9947997, alt: 3,
    desc: '소설가 이태준이 살던 옛 한옥을 찻집으로 쓰고 있어요.',
    rest: '실내 좌식 자리와 마당 의자가 있어요.',
    tags: ['한옥 찻집', '대기 10~15분'],
    notice: '월·화요일은 쉬어요. 10~15분 기다릴 수 있어요.',
  },
  {
    id: 'sbcafe', cat: 'cafe', name: '성북로 카페', addr: '성북로28길 10',
    lat: 37.5950536, lng: 126.9937971, alt: 3,
    desc: '건물 한 채를 통째로 쓰는 넓은 빈티지 카페예요.',
    rest: '자리가 넓어서 오래 앉아 쉬기 좋아요.',
    tags: ['넓은 자리', '빈티지'],
    notice: null,
  },
  {
    id: 'fromcreek', cat: 'cafe', name: '프럼크릭', addr: '성북동 232-7',
    lat: 37.5943857, lng: 126.9931211, alt: 3,
    desc: '통유리 건물의 카페. 창밖 풍경이 시원해요.',
    rest: '자리가 좁고 시끄러운 편이라 오래 쉬기엔 아쉬워요.',
    tags: ['유리 건물'],
    notice: null,
  },
  {
    id: 'napoleon', cat: 'cafe', name: '나폴레옹과자점', addr: '성북로 7',
    lat: 37.5889099, lng: 127.0051879, alt: 5,
    desc: '오래된 대형 빵집. 돌아가실 때 들고 갈 빵 선물을 사기 좋아요.',
    rest: null,
    tags: ['귀가 선물', '역 근처'],
    notice: null,
  },
  {
    id: 'chapeau', cat: 'cafe', name: '샤포블랑', addr: '성북로 60',
    lat: 37.5929138, lng: 127.0023223, alt: 5,
    desc: '동네 사람들이 다니는 작은 빵집이에요.',
    rest: null,
    tags: ['동네 빵집'],
    notice: '일요일은 쉬어요.',
  },

  // ── 즐길거리 ──────────────────────────
  {
    id: 'kansong', cat: 'fun', name: '간송미술관', addr: '성북로 102-11',
    lat: 37.5935339, lng: 126.9969149, alt: 4,
    desc: '우리나라 최초의 사립미술관. 귀한 옛 그림과 유물을 볼 수 있어요.',
    rest: null,
    tags: ['미술관'],
    notice: '전시 기간에만 관람할 수 있어요.',
  },
  {
    id: 'sbmuseum', cat: 'fun', name: '성북구립미술관', addr: '성북로 134',
    lat: 37.5948062, lng: 126.9948842, alt: 3,
    desc: '근현대 한국 미술을 볼 수 있는 동네 미술관이에요.',
    rest: null,
    tags: ['미술관'],
    notice: '월요일은 쉬어요.',
  },
  {
    id: 'choi', cat: 'fun', name: '최순우옛집', addr: '성북로15길 9',
    lat: 37.5928953, lng: 127.0003282, alt: 4,
    desc: '전 국립중앙박물관장 최순우 선생이 살던 아담한 한옥.',
    rest: null,
    tags: ['한옥'],
    notice: '일·월요일은 쉬어요.',
  },
  {
    id: 'seonjam', short: '선잠박물관', cat: 'fun', name: '성북선잠박물관·선잠단지', addr: '성북로 96',
    lat: 37.5931935, lng: 126.9982055, alt: 4,
    desc: '누에치기와 비단의 역사를 담은 작은 박물관과 옛 제사 터.',
    rest: '무료이고, 걷다가 잠깐 쉬어 가기 좋아요.',
    tags: ['무료', '쉬어 가기'],
    notice: null,
  },
  {
    id: 'furniture', short: '가구박물관', cat: 'fun', name: '한국가구박물관', addr: '대사관로 121',
    lat: 37.6000442, lng: 126.9930488, alt: 1, hill: true,
    desc: '옛 한옥과 전통 가구를 해설사와 함께 둘러보는 투어(약 1시간).',
    rest: null,
    tags: ['예약제 투어', '화~토'],
    notice: '예약제 해설 투어로만 관람해요 (화~토).',
  },
  {
    id: 'simujang', short: '심우장', cat: 'fun', name: '만해 한용운 심우장', addr: '성북로29길 24',
    lat: 37.5936472, lng: 126.9917756, alt: 2, hill: true,
    desc: '독립운동가이자 시인 한용운이 살던 집. 매일 열려 있어요.',
    rest: null,
    tags: ['매일 개방', '언덕'],
    notice: '언덕 골목 위에 있어요.',
  },

  // ── 산책 ──────────────────────────────
  {
    id: 'gilsang', cat: 'walk', name: '길상사', addr: '선잠로5길 68',
    lat: 37.5988548, lng: 126.9943511, alt: 1,
    desc: '조용한 숲길과 절 마당. 가을 단풍 사진이 예쁘게 나와요.',
    rest: '숲길 곳곳에 벤치가 있어요.',
    tags: ['숲길', '단풍 사진', '절 앞 버스'],
    notice: '절 앞에 버스 정류장이 있어요.',
  },
  {
    id: 'bukjeong', cat: 'walk', name: '북정마을', addr: '성북동 217 일대',
    lat: 37.5925039, lng: 126.992438, alt: 2, hill: true,
    desc: '1970년대 풍경이 남아 있는 골목 마을.',
    rest: null,
    tags: ['옛 골목', '경사·계단'],
    notice: '경사와 계단이 있어요.',
  },
  {
    id: 'waryong', short: '성곽길', cat: 'walk', name: '와룡공원 성곽길', addr: '북정마을 옆',
    lat: 37.5919742, lng: 126.9923541, alt: 2, hill: true,
    desc: '한양도성 성곽을 따라 걸으며 서울 시내를 내려다봐요.',
    rest: null,
    tags: ['성곽', '서울 전망'],
    notice: '전망 지점까지만 걷는 걸 추천해요.',
  },
]

export const PLACES = Object.fromEntries(list.map((p) => [p.id, { hill: false, ...p }]))
export const PLACE_LIST = list.map((p) => PLACES[p.id])

// 출발·도착 지점 (좌표는 대략값 — 실제 좌표로 보정 필요)
export const STATION = {
  id: 'station',
  name: '한성대입구역 6번 출구',
  lat: 37.5886,
  lng: 127.0063,
  alt: 5,
  approx: true,
}

export const getPlace = (id) => PLACES[id] || null
