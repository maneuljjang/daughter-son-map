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

## C. Vercel 배포 (비공개 GitHub 저장소)
1. 코드는 비공개 저장소 `maneuljjang/daughter-son-map`에 있어요.
2. Vercel → Add New → Project → GitHub 저장소 `daughter-son-map` → Import
3. Environment Variables에 `VITE_KAKAO_JS_KEY` 추가 (값은 `.env` 파일의 키) → Deploy
4. 배포 주소(예: `https://daughter-son-map.vercel.app`)를 카카오 두 곳에 등록
   - 플랫폼 키 → Default JS Key → **JavaScript SDK 도메인** (지도·공유가 동작하려면)
   - **제품 링크 관리 → 웹 도메인** (카톡 카드의 [초대장 열기] 링크가 열리려면)
5. 이후 `main`에 올리면 Vercel이 자동으로 다시 배포해요.
   - 키를 바꾸면 Vercel → Settings → Environment Variables에서 고친 뒤 Redeploy

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
