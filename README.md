# 딸, 아들 어디가

성북동 "부모님 모시고 오기 좋은 동네" 브랜딩 프로젝트 웹앱.
자녀(2030)가 걷기 편한 코스를 짜서 카카오톡 초대장으로 보내고, 부모님(4050)이 미리 걸어 보고 의견을 답장해요.

| 화면 | 주소 | 하는 일 |
|---|---|---|
| 자녀 | `/` | 장소 담기, 추천 코스 불러오기, 루트·거리·난이도 보기, 초대장 보내기, 답장 받고 장소 바꾸기 |
| 부모님 | `/invite/?r=guk,suyeon,…&i=초대장id` | 코스 지도, 장소 설명, 로드뷰로 미리 걸어보기, 좋아요/힘들 것 같아, 답장 보내기 |
| 답장 링크 | `/?r=…&swap=simujang&like=guk` | 자녀 화면이 열리면서 바꿀 장소가 표시됨 |

## 실행

```bash
npm install
cp .env.example .env   # VITE_KAKAO_JS_KEY 채우기
npm run dev            # http://localhost:5173
npm test               # 루트 규칙 테스트
```

## 루트 규칙 (`src/lib/route.js`)

- 직접 고른 코스: altitudeRank가 낮은 값(높은 곳)부터 정렬하고, 같으면 앞 장소에서 가까운 순으로 정렬해요. 첫 장소는 같은 높이 중 역에서 가장 먼 곳이에요.
- 추천 코스 4종은 정한 순서를 그대로 써요. 오르막 구간이 있으면 [내리막 순서로 정렬] 버튼이 나와요.
- 시작 지점까지는 성북02나 택시로 가기 때문에 거리 계산에서 빠져요.
- 도보 거리는 직선 × 1.3(추정치)이고, 시간은 분당 60m로 계산해요.
- 마지막 장소에서 한성대입구역까지 600m 이하면 걷는 거리에 넣고, 넘으면 버스로 안내해요.
- 난이도는 1.2km 이하 하, 1.8km 이하 중, 그 이상 상이에요. hill 장소가 있으면 최소 중이에요.

## 폴더

```
src/
  data/       places.js(장소) · courses.js(추천 코스) · transit.js(버스 안내, 정류장 TODO)
  lib/        route.js(정렬·거리·난이도) · geo.js · url.js · kakaoLoader.js · kakaoShare.js
  feedback/   index.js(공통) · localVotes.js · firestore.js(2차 자리)
  components/ map · route · place · roadview · ui
  child/      자녀 화면
  invite/     부모님 화면
public/
  places/     장소 사진 (id.jpg)
  share/      카톡 카드 이미지 (scripts/make_card.py로 다시 만들 수 있음)
```

## 2차: Firestore 의견 저장
`src/feedback/firestore.js` 맨 위 주석을 따라 하세요. 화면 코드는 `submitVote` / `subscribeVotes`만 쓰기 때문에 이 파일만 채우면 돼요.

## 배포
Vercel (비공개 GitHub 저장소 연결). 자세한 순서는 SETUP.md.

## 직접 해야 하는 설정
[SETUP.md](SETUP.md) 참고.
