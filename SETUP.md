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
- 저장소: https://github.com/maneuljjang/daughter-son-map (공개)
- 주소: https://maneuljjang.github.io/daughter-son-map/
- 고친 뒤 다시 배포하기: 이 폴더에서 `npm run deploy`
  (테스트 → 빌드 → `gh-pages` 브랜치로 올림. 1~2분 뒤 반영돼요)
- 카카오 키는 내 컴퓨터의 `.env`에서 읽어요. 다른 컴퓨터에서 배포하려면 그 컴퓨터에도 `.env`가 있어야 해요.
- 카카오에 `https://maneuljjang.github.io`를 등록해야 하는 곳 두 군데
  - 플랫폼 키 → Default JS Key → **JavaScript SDK 도메인**
  - **제품 링크 관리 → 웹 도메인**

(선택) 올릴 때마다 자동 배포하고 싶으면, `gh auth refresh -h github.com -s workflow`로 권한을 추가한 뒤
GitHub Actions 워크플로를 다시 넣으면 돼요 (git 기록의 첫 커밋에 `.github/workflows/deploy.yml`이 있어요).

## C-2. (선택) 실제 걷는 길 — TMAP 키
1. https://openapi.sk.com 가입 → 앱 만들기 → **TMAP** API 사용 신청 (무료 사용량 안에서)
2. 앱의 **appKey** 를 `.env` 의 `VITE_TMAP_KEY=` 뒤에 붙여 넣기
3. `npm run dev` 다시 켜기 → 코스 요약의 "추정치"가 "실제 길"로 바뀌면 성공
4. `npm run deploy` 로 배포
- 같은 구간은 기기마다 한 번만 불러오고 저장해 둬요. 키가 없거나 막히면 자동으로 추정치로 돌아가요.

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
