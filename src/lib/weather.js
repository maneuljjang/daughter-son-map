// 정한 날짜의 성북동 날씨 예보 (Open-Meteo, 무료·키 없음, 약 16일 앞까지)
const LAT = 37.594
const LNG = 126.997
const FORECAST_DAYS = 15

/** WMO 날씨 코드 → 말·이모지 */
export function describeCode(code) {
  if (code === 0) return { icon: '☀️', text: '맑음' }
  if (code <= 2) return { icon: '🌤️', text: '구름 조금' }
  if (code === 3) return { icon: '☁️', text: '흐림' }
  if (code <= 48) return { icon: '🌫️', text: '안개' }
  if (code <= 57) return { icon: '🌦️', text: '이슬비' }
  if (code <= 67) return { icon: '🌧️', text: '비' }
  if (code <= 77) return { icon: '🌨️', text: '눈' }
  if (code <= 82) return { icon: '🌧️', text: '소나기' }
  if (code <= 86) return { icon: '🌨️', text: '눈' }
  return { icon: '⛈️', text: '뇌우' }
}

/** 예보 → 부모님께 드릴 한마디 */
export function adviceOf({ code, tMin, tMax, rain }) {
  const tips = []
  const snowy = code >= 71 && code <= 86 && !(code >= 80 && code <= 82)
  if (snowy) tips.push('눈 소식이 있어요. 미끄러운 언덕길은 버스로 가요.')
  else if (rain >= 60 || (code >= 51 && code <= 82) || code >= 95) tips.push('비 소식이 있어요. 우산 챙겨 오세요.')
  else if (rain >= 30) tips.push('비가 올 수도 있어요. 작은 우산 하나 챙기세요.')
  if (tMin <= 3) tips.push('아침저녁 많이 추워요. 두툼하게 입고 오세요.')
  else if (tMin <= 8) tips.push('쌀쌀해요. 겉옷 꼭 챙기세요.')
  if (tMax >= 30) tips.push('더워요. 물 자주 드시고 그늘에서 쉬어 가요.')
  if (!tips.length) tips.push('걷기 좋은 날씨예요.')
  return tips
}

/** 오늘부터 며칠 뒤인지 (한국 날짜 기준) */
export function daysFromToday(date, now = new Date()) {
  const today = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))
  const t = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const [y, m, d] = date.split('-').map(Number)
  return Math.round((Date.UTC(y, m - 1, d) - t) / 86400000)
}

const cache = new Map()

/**
 * 반환: { status: 'ok', icon, text, tMin, tMax, rain, advice[] }
 *     | { status: 'far', days }   (아직 예보가 없음)
 *     | { status: 'past' } | { status: 'error' }
 */
export async function fetchWeather(date, time) {
  if (!date) return null
  const days = daysFromToday(date)
  if (days < 0) return { status: 'past' }
  if (days > FORECAST_DAYS) return { status: 'far', days: days - FORECAST_DAYS }
  const key = `${date} ${time}`
  if (cache.has(key)) return cache.get(key)
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
      `&hourly=weather_code,precipitation_probability&timezone=Asia%2FSeoul&start_date=${date}&end_date=${date}`
    const j = await fetch(url).then((r) => r.json())
    if (j.error) return { status: 'error' }
    // 출발 시각을 정했으면 그 뒤 몇 시간(걷는 동안)의 날씨를, 아니면 하루 날씨를
    let code = j.daily.weather_code[0]
    let rain = j.daily.precipitation_probability_max[0] ?? 0
    if (time) {
      const h = Number(time.slice(0, 2))
      const hours = j.hourly.time.map((_, i) => i).filter((i) => i >= h && i < h + 5)
      if (hours.length) {
        code = Math.max(...hours.map((i) => j.hourly.weather_code[i]))
        rain = Math.max(...hours.map((i) => j.hourly.precipitation_probability[i] ?? 0))
      }
    }
    const result = {
      status: 'ok',
      ...describeCode(code),
      tMin: Math.round(j.daily.temperature_2m_min[0]),
      tMax: Math.round(j.daily.temperature_2m_max[0]),
      rain,
    }
    result.advice = adviceOf({ code, ...result })
    cache.set(key, result)
    return result
  } catch {
    return { status: 'error' }
  }
}
