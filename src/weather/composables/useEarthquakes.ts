import { ref } from 'vue'
import type { Earthquake } from '../types'

export function useEarthquakes() {
  const quakes = ref<Earthquake[]>([])
  const busy = ref(false)
  const err = ref('')

  async function load(lat: number, lon: number) {
    busy.value = true
    err.value = ''
    try {
      const res = await fetch(`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=1500&minmagnitude=4&orderby=time&limit=20`)
      if (!res.ok) throw new Error('Lỗi dữ liệu địa chấn.')
      const data = await res.json()
      quakes.value = data.features.map((f: any) => ({
        id: f.id,
        magnitude: f.properties.mag,
        place: f.properties.place,
        time: f.properties.time,
        url: f.properties.url,
        tsunami: f.properties.tsunami,
        depth: f.geometry.coordinates[2],
        distanceKm: 0 // Tham khảo
      }))
    } catch (e: any) {
      err.value = e.message
    } finally {
      busy.value = false
    }
  }

  return { quakes, busy, err, load }
}