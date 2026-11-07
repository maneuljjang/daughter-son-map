# 직접 해야 하는 설정 체크리스트

## A. 카카오 (개발용) — 완료된 것 ✅
- [x] 카카오 디벨로퍼스 앱 만들기 ("딸, 아들 어디가?")
- [x] 플랫폼 키 → Default JS Key → JavaScript SDK 도메인에 `http://localhost:5173` 등록
- [x] 제품 설정 → 카카오맵 → 사용 설정 ON

## B. 내 컴퓨터
1. 프로젝트 폴더에 `.env` 파일을 만들고 아래 한 줄을 적기
   ```
   VITE_KAKAO_JS_KEY=플랫폼 키 화면에서 복사한 JavaScript 키
   ```
2. `npm run dev`를 실행하고 http://localhost:5173 열기
   - `.env`를 고친 뒤에는 dev 서버를 껐다가 다시 켜야 해요.

## C. GitHub Pages 배포
1. GitHub에서 새 저장소를 만들어요 (예: `daughter-son-map`).
2. 이 폴더를 그 저장소의 `main` 브랜치에 올려요.
3. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 바꿔요.
4. 저장소 **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `VITE_KAKAO_JS_KEY`
   - Secret: JavaScript 키
5. **Actions** 탭에서 "Deploy to GitHub Pages"가 초록색으로 끝나면 `https://<아이디>.github.io/<저장소>/`로 접속돼요.
6. 카카오 디벨로퍼스 → 플랫폼 키 → Default JS Key → JavaScript SDK 도메인에서 **+**를 누르고 `https://<아이디>.github.io`를 추가해요.
   - 경로(`/<저장소>/`)는 빼고 도메인만 넣어요.
   - 이 도메인이 없으면 배포한 사이트에서 지도와 카톡 공유가 모두 안 돼요.

## D. 자료 (성과공유회 11/19 전까지)
- [ ] 장소 사진: `public/places/<id>.jpg` (목록은 public/places/README.md). 직접 찍은 사진만 써 주세요.
- [ ] 한성대입구역 6번 출구 실제 좌표로 고치기 → `src/data/places.js`의 `STATION`
- [ ] 성북02 정류장 이름 → `src/data/transit.js`의 `BUS_STOP_NEAR`
- [ ] 휴무일, 예약제, 전시 기간 등 운영 정보 다시 확인하기 → `src/data/places.js`

## E. 시연 전 리허설 (휴대폰 2대)
1. 자녀 폰: 배포 주소 열기 → 추천 코스 불러오기 → [초대장 보내기] → 부모님 역할 친구에게 카톡 보내기
2. 부모님 폰: 카톡에서 [초대장 열기] → 미리 걸어보기 → 한 곳에 [여기는 힘들 것 같아] → [답장 보내기]
3. 자녀 폰: 답장 카드의 [코스 바꾸러 가기] → 빨간 점선 장소 [바꾸기] → 다시 보내기
4. 카톡 안 브라우저에서 지도와 로드뷰가 뜨는지, 글자 크기가 괜찮은지 확인하기
5. 현장 와이파이가 불안하면 휴대폰 데이터로 시연하기
