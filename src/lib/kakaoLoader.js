// 카카오 SDK 로더. 키는 .env 의 VITE_KAKAO_JS_KEY 에서만 읽습니다.
export const KAKAO_KEY = import.meta.env.VITE_KAKAO_JS_KEY || ''
const SHARE_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'

let mapsPromise = null
let sdkPromise = null

function injectScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = src
    s.async = true
    s.onload = resolve
    s.onerror = () => reject(new Error(`스크립트를 불러오지 못했어요: ${src.split('?')[0]}`))
    document.head.appendChild(s)
  })
}

/** 카카오맵 (지도·마커·폴리라인·로드뷰) */
export function loadKakaoMaps() {
  if (mapsPromise) return mapsPromise
  if (!KAKAO_KEY) return Promise.reject(new Error('NO_KEY'))
  mapsPromise = injectScript(`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`)
    .then(
      () =>
        new Promise((resolve, reject) => {
          if (!window.kakao?.maps) return reject(new Error('카카오맵을 불러오지 못했어요. 도메인 등록과 카카오맵 사용 설정을 확인해 주세요.'))
          window.kakao.maps.load(() => resolve(window.kakao.maps))
        }),
    )
    .catch((e) => {
      mapsPromise = null
      throw e
    })
  return mapsPromise
}

/** 카카오톡 공유용 Kakao JavaScript SDK */
export function loadKakaoSdk() {
  if (sdkPromise) return sdkPromise
  if (!KAKAO_KEY) return Promise.reject(new Error('NO_KEY'))
  sdkPromise = (window.Kakao ? Promise.resolve() : injectScript(SHARE_SDK_URL))
    .then(() => {
      if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_KEY)
      return window.Kakao
    })
    .catch((e) => {
      sdkPromise = null
      throw e
    })
  return sdkPromise
}
