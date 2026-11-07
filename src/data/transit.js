// 교통 안내 문구.
// TODO(팀): 성북02 실제 정류장 이름을 확인해서 BUS_STOP_NEAR 에 채워 주세요.
//           값이 있으면 "힘들면 여기서 버스" 안내에 정류장 이름이 함께 나옵니다.

export const BUS = '성북02'

export const START_GUIDE = (firstName) =>
  `한성대입구역 6번 출구에서 마을버스 ${BUS}나 택시로 ${firstName}까지 올라가세요. 오르막은 차로, 걷는 건 내리막만!`

export const BUS_STOP_NEAR = {
  // 예시) gilsang: '길상사 정류장',
}

export const busTip = (placeId) => {
  const stop = BUS_STOP_NEAR[placeId]
  return stop ? `힘들면 여기서 버스(${BUS}) · ${stop}` : `힘들면 여기서 버스(${BUS})`
}
