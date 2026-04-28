import { ref, watch } from 'vue'
import type { WeatherData, AQIData, Earthquake } from '../types'

type Perm = 'default' | 'granted' | 'denied' | 'unsupported'

const ENABLED_KEY = 'weather_vn_notify_enabled'
const SEEN_KEY = 'weather_vn_notify_seen'
const COOLDOWN_MS = 3 * 60 * 60 * 1000 // 3h cooldown per alert type

interface SeenMap {
  [key: string]: number // timestamp
}

function loadSeen(): SeenMap {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}') } catch { return {} }
}
function saveSeen(m: SeenMap) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(m))
}

function currentPermission(): Perm {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission as Perm
}

export function useNotifications() {
  const enabled = ref(localStorage.getItem(ENABLED_KEY) === '1')
  const permission = ref<Perm>(currentPermission())

  watch(enabled, (v) => localStorage.setItem(ENABLED_KEY, v ? '1' : '0'))

  async function request() {
    if (typeof Notification === 'undefined') {
      permission.value = 'unsupported'
      return false
    }
    const res = await Notification.requestPermission()
    permission.value = res as Perm
    if (res === 'granted') enabled.value = true
    return res === 'granted'
  }

  function disable() { enabled.value = false }

  async function notify(tag: string, title: string, body: string, icon = '🌤️') {
    if (!enabled.value || permission.value !== 'granted') return
    const seen = loadSeen()
    const now = Date.now()
    if (seen[tag] && now - seen[tag] < COOLDOWN_MS) return
    seen[tag] = now
    saveSeen(seen)

    const payload: NotificationOptions = {
      body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag,
      data: { icon },
    }
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready
        reg.showNotification(title, payload)
      } else {
        new Notification(title, payload)
      }
    } catch {
      try { new Notification(title, payload) } catch {}
    }
  }

  function check(wx: WeatherData | null, aqd: AQIData | null, quakes: Earthquake[], locName: string) {
    if (!enabled.value || permission.value !== 'granted') return

    if (wx) {
      const h = wx.hourly
      const next6 = 6
      const next3 = 3
      const startIdx = Math.max(0, h.time.findIndex((t) => new Date(t).getTime() >= Date.now()))

      // Storm in next 6h
      for (let i = 0; i < next6 && startIdx + i < h.weather_code.length; i++) {
        if (h.weather_code[startIdx + i] >= 95) {
          notify('storm', '⛈️ Cảnh báo giông bão', `Sắp có giông bão tại ${locName} trong ${i === 0 ? 'giờ tới' : i + ' giờ tới'}. Tìm nơi trú ẩn an toàn.`)
          break
        }
      }

      // Heavy rain in next 3h
      for (let i = 0; i < next3 && startIdx + i < h.precipitation_probability.length; i++) {
        const pp = h.precipitation_probability[startIdx + i] ?? 0
        const mm = h.precipitation[startIdx + i] ?? 0
        if (pp >= 80 || mm >= 5) {
          notify('rain', '🌧️ Sắp mưa to', `${locName}: khả năng mưa ${pp}% (~${mm.toFixed(1)}mm) trong ${i === 0 ? 'giờ tới' : i + ' giờ tới'}.`)
          break
        }
      }

      // Strong wind in next 6h
      for (let i = 0; i < next6 && startIdx + i < h.wind_speed_10m.length; i++) {
        const w = h.wind_speed_10m[startIdx + i] ?? 0
        if (w >= 60) {
          notify('wind', '🌪️ Gió mạnh', `${locName}: sắp có gió mạnh ~${Math.round(w)} km/h trong ${i} giờ tới.`)
          break
        }
      }

      // Extreme temperature
      const tMax = wx.daily?.temperature_2m_max?.[0]
      const tMin = wx.daily?.temperature_2m_min?.[0]
      if (typeof tMax === 'number' && tMax >= 38) {
        notify('heat', '🥵 Nắng nóng gay gắt', `${locName}: nhiệt độ cao nhất hôm nay ${Math.round(tMax)}°. Hạn chế ra ngoài vào buổi trưa.`)
      }
      if (typeof tMin === 'number' && tMin <= 5) {
        notify('cold', '🥶 Rét đậm', `${locName}: nhiệt độ thấp nhất hôm nay ${Math.round(tMin)}°. Giữ ấm cẩn thận.`)
      }

      // High UV today
      const uv = wx.daily?.uv_index_max?.[0]
      if (typeof uv === 'number' && uv >= 9) {
        notify('uv', '☀️ Tia UV cực cao', `${locName}: UV hôm nay ${uv}. Che chắn kỹ khi ra ngoài.`)
      }
    }

    if (aqd?.current?.european_aqi != null && aqd.current.european_aqi >= 80) {
      const v = aqd.current.european_aqi
      notify('aqi', '😷 Chất lượng không khí kém', `${locName}: chỉ số AQI ${Math.round(v)}. Hạn chế hoạt động ngoài trời.`)
    }

    if (quakes?.length) {
      const recent = quakes.find(
        (q) => q.magnitude >= 4.5 && Date.now() - q.time < 24 * 60 * 60 * 1000
      )
      if (recent) {
        // Unique tag per quake id so each event shows once
        notify(`quake_${recent.id}`, '🌍 Cảnh báo động đất', `M${recent.magnitude.toFixed(1)} — ${recent.place}`)
      }
    }
  }

  return { enabled, permission, request, disable, notify, check }
}
