// 추천 코스 4종. 큐레이션한 순서를 그대로 씁니다 (자동 정렬하지 않음).
export const COURSES = [
  {
    id: 'meal',
    title: '밥·카페 코스',
    emoji: '🍚',
    summary: '한정식 → 한옥 찻집 → 미술관 → 빵 선물',
    stops: ['guk', 'suyeon', 'sbmuseum', 'seonjam', 'napoleon'],
  },
  {
    id: 'art',
    title: '미술관 코스',
    emoji: '🖼️',
    summary: '아래에서 위로 올라가며 보는 미술관 나들이',
    stops: ['choi', 'seonjam', 'seochon', 'kansong', 'sbmuseum', 'sbcafe'],
    uphill: true,
    note: '아래에서 위로 오르는 코스예요. 끝나면 버스(성북02)로 내려와 귀가하세요.',
  },
  {
    id: 'fun',
    title: '즐길거리 코스',
    emoji: '🏯',
    summary: '가구박물관 투어 → 길상사 숲길 → 영양밥',
    stops: ['furniture', 'gilsang', 'ihyang', 'fromcreek', 'chapeau'],
  },
  {
    id: 'walk',
    title: '산책 코스',
    emoji: '🌳',
    summary: '옛 골목과 성곽길, 그리고 루프탑 식사',
    stops: ['bukjeong', 'waryong', 'simujang', 'munhwa', 'seonjam', 'napoleon'],
  },
]

export const getCourse = (id) => COURSES.find((c) => c.id === id) || null
