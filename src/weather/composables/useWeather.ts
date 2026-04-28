import { ref, computed, watch } from 'vue'
import type { WeatherData, AQIData } from '../types'
import { wmo } from '../helpers'
import { useSettings } from './useSettings'

const CACHE_TTL = 10 * 60 * 1000 // 10 min
const CACHE_PREFIX = 'weather_vn_cache_v2_'

interface CacheEntry<T> { t: number; d: T }

function cacheKey(kind: 'wx' | 'aqd', lat: number, lon: number, tUnit: string, wUnit: string) {
  return `${CACHE_PREFIX}${kind}_${lat.toFixed(2)}_${lon.toFixed(2)}_${tUnit}_${wUnit}`
}

function readCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (Date.now() - entry.t > CACHE_TTL) return null
    return entry.d
  } catch { return null }
}

function writeCache<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data } satisfies CacheEntry<T>))
  } catch {}
}

export function useWeather() {
  const wx = ref<WeatherData | null>(null)
  const aqd = ref<AQIData | null>(null)
  const busy = ref(false)
  const err = ref('')
  const lastCoords = ref<{ lat: number; lon: number } | null>(null)
  const { settings } = useSettings()

  async function load(lat: number, lon: number) {
    lastCoords.value = { lat, lon }
    err.value = ''

    const tUnit = settings.value.tempUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius'
    const wUnit = settings.value.windUnit

    // Stale-while-revalidate: show cached data instantly, refresh in background
    const cachedWx = readCache<WeatherData>(cacheKey('wx', lat, lon, tUnit, wUnit))
    const cachedAqd = readCache<AQIData>(cacheKey('aqd', lat, lon, tUnit, wUnit))
    if (cachedWx) wx.value = cachedWx
    if (cachedAqd) aqd.value = cachedAqd

    // Only show loading spinner if we have nothing to show
    const hasCache = !!cachedWx
    if (!hasCache) busy.value = true

    const tParam = tUnit === 'fahrenheit' ? '&temperature_unit=fahrenheit' : ''
    const wParam = wUnit !== 'kmh' ? `&wind_speed_unit=${wUnit}` : ''

    const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,cloud_cover,dew_point_2m,visibility,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=16${tParam}${wParam}`
    const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone&hourly=pm10,pm2_5,european_aqi&timezone=auto`

    // Fire both in parallel; update UI as each resolves
    const wxPromise = fetch(wxUrl)
      .then(r => { if (!r.ok) throw new Error('Lỗi tải dữ liệu thời tiết'); return r.json() })
      .then(data => {
        wx.value = data
        writeCache(cacheKey('wx', lat, lon, tUnit, wUnit), data)
      })
      .catch(e => { if (!cachedWx) err.value = e.message })

    const aqPromise = fetch(aqUrl)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          aqd.value = data
          writeCache(cacheKey('aqd', lat, lon, tUnit, wUnit), data)
        }
      })
      .catch(() => {})

    // Clear spinner as soon as weather is ready (AQI can finish later)
    wxPromise.finally(() => { busy.value = false })

    await Promise.all([wxPromise, aqPromise])
  }

  watch(
    () => [settings.value.tempUnit, settings.value.windUnit],
    () => {
      if (lastCoords.value) load(lastCoords.value.lat, lastCoords.value.lon)
    }
  )

  const curIdx = computed(() => {
    if (!wx.value) return 0
    const now = new Date().toISOString().slice(0, 13) + ':00'
    return Math.max(0, wx.value.hourly.time.findIndex((t: string) => t >= now))
  })

  const todayHourly = computed(() => {
    if (!wx.value) return []
    const start = curIdx.value
    const h = wx.value.hourly
    return h.time.slice(start, start + 24).map((t: string, i: number) => ({
      time: t.slice(11, 16),
      temp: Math.round(h.temperature_2m[start + i]),
      icon: wmo(h.weather_code[start + i]).i,
      pp: h.precipitation_probability[start + i]
    }))
  })

  const bgGrad = computed(() => {
    if (!wx.value) return 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    const code = wx.value.current.weather_code
    const isDay = (wx.value.current as any).is_day !== 0
    const base = wmo(code).bg
    if (!isDay) return `linear-gradient(135deg, #0f172a 0%, #1e293b 50%, ${base} 100%)`
    return `linear-gradient(135deg, ${base} 0%, #1e3a8a 100%)`
  })

  const hourlyList = computed(() => {
    if (!wx.value) return []
    const start = curIdx.value
    const h = wx.value.hourly
    return h.time.slice(start, start + 48).map((t: string, i: number) => ({
      time: t.slice(11, 16),
      temp: Math.round(h.temperature_2m[start + i]),
      feels: Math.round(h.apparent_temperature[start + i]),
      icon: wmo(h.weather_code[start + i]).i,
      desc: wmo(h.weather_code[start + i]).t,
      pp: h.precipitation_probability[start + i],
      wind: Math.round(h.wind_speed_10m[start + i]),
      hum: Math.round(h.relative_humidity_2m[start + i]),
      uv: Math.round(h.uv_index[start + i])
    }))
  })

  return { wx, aqd, busy, err, load, bgGrad, curIdx, todayHourly, hourlyList }
}