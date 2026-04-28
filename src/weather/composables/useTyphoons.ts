import { ref } from 'vue'
import { haversineKm } from '../helpers'

export interface Typhoon {
  id: string
  name: string
  nameJa?: string
  lat: number
  lon: number
  pressure?: number // hPa
  windKmh?: number
  category: string
  distanceKm: number
  time: number
}

// JMA tropical cyclone list (Western Pacific). Public, CORS-enabled.
const JMA_URL = 'https://www.jma.go.jp/bosai/typhoon/data/typhoon_list.json'

export function useTyphoons() {
  const typhoons = ref<Typhoon[]>([])
  const busy = ref(false)
  const err = ref('')

  async function load(userLat: number, userLon: number) {
    busy.value = true
    err.value = ''
    try {
      const res = await fetch(JMA_URL)
      if (!res.ok) throw new Error('Không tải được dữ liệu bão')
      const data = await res.json()
      const list: Typhoon[] = []

      // JMA format: data.typhoons array of { id, name, nameJa, points[{lat,lon,time,pressure,windMax,category}] }
      const arr = Array.isArray(data) ? data : (data.typhoons ?? [])
      for (const t of arr) {
        const points = t.points || t.track || []
        const latest = points[points.length - 1] || {}
        const lat = Number(latest.lat ?? latest.latitude)
        const lon = Number(latest.lon ?? latest.longitude)
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
        const windMs = Number(latest.windMax ?? latest.wind ?? 0)
        const windKmh = windMs > 0 ? Math.round(windMs * 3.6) : undefined
        const distance = haversineKm([userLat, userLon], [lat, lon])
        list.push({
          id: String(t.id ?? t.number ?? `${t.name}_${latest.time ?? Date.now()}`),
          name: t.name ?? t.nameEn ?? 'Unknown',
          nameJa: t.nameJa,
          lat, lon,
          pressure: latest.pressure ? Number(latest.pressure) : undefined,
          windKmh,
          category: latest.category ?? t.category ?? 'TD',
          distanceKm: Math.round(distance),
          time: latest.time ? new Date(latest.time).getTime() : Date.now(),
        })
      }
      // Sort nearest first
      list.sort((a, b) => a.distanceKm - b.distanceKm)
      typhoons.value = list
    } catch (e: any) {
      err.value = e.message || 'Lỗi tải dữ liệu bão'
      typhoons.value = []
    } finally {
      busy.value = false
    }
  }

  return { typhoons, busy, err, load }
}
