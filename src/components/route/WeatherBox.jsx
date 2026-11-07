import { useEffect, useState } from 'react'
import { fetchWeather, FORECAST_DAYS } from '../../lib/weather.js'

/** 정한 날짜의 날씨 예보 (날짜가 없으면 아무것도 안 보여요) */
export default function WeatherBox({ date, time, large = false }) {
  const [w, setW] = useState(null)
  useEffect(() => {
    let alive = true
    setW(null)
    fetchWeather(date, time).then((r) => alive && setW(r))
    return () => {
      alive = false
    }
  }, [date, time])

  if (!date || !w || w.status === 'error' || w.status === 'past') return null
  if (w.status === 'far') {
    return <div className={`weather ${large ? 'weather-lg' : ''} muted`}>🌤️ 날씨 예보는 나들이 {FORECAST_DAYS}일 전부터 볼 수 있어요.</div>
  }
  return (
    <div className={`weather ${large ? 'weather-lg' : ''}`}>
      <div className="weather-main">
        <span className="weather-icon" aria-hidden="true">{w.icon}</span>
        <div>
          <b>
            {w.text} · {w.tMin}°~{w.tMax}°
          </b>
          <div className="weather-sub">비 올 확률 {w.rain}%</div>
        </div>
      </div>
      <ul className="weather-tips">
        {w.advice.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  )
}
