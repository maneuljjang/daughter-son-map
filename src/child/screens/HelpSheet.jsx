import BottomSheet from '../../components/ui/BottomSheet.jsx'

/** [도움말] 버튼을 누르면 열리는 사용법 */
export default function HelpSheet({ onClose }) {
  return (
    <BottomSheet title="이렇게 써요" onClose={onClose}>
      <ol className="help-steps">
        <li>
          <b>장소 고르기</b>
          <span>추천 장소를 담거나, 검색창에서 성북동 가게를 찾아 담거나, 추천 코스를 불러와요.</span>
        </li>
        <li>
          <b>순서는 앱이</b>
          <span>
            <b>높은 곳에서 낮은 곳으로</b> 걷는 순서를 짜 줘요. 시작 지점까지는 성북02 버스나 택시로 올라가요. ▲▼로 직접 바꿀 수도 있어요.
          </span>
        </li>
        <li>
          <b>날짜·시간 넣기</b>
          <span>장소별 도착 시각, 쉬는 날, 날씨를 알려 줘요.</span>
        </li>
        <li>
          <b>초대장 보내기</b>
          <span>카톡으로 부모님께 보내요. 부모님이 "힘들 것 같아"를 누르면 답장이 오고, 같은 종류의 다른 곳으로 바꿔 다시 보내요.</span>
        </li>
      </ol>
      <p className="small muted help-note">
        거리·시간은 실제 걷는 길로 계산하고, 길을 못 불러오면 직선 거리 × 1.3 추정치로 보여 줘요. 카카오맵에서 넣은 장소의 높이는 고도 데이터로 추정해요. 운영 정보는 방문 전에 꼭 확인해 주세요.
      </p>
      <button className="btn btn-primary btn-lg btn-block" onClick={onClose}>알겠어요</button>
    </BottomSheet>
  )
}
