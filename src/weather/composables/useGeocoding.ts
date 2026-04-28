import { ref } from 'vue'
import type { GeoLocation } from '../types'

export function useGeocoding() {
  const q = ref('')
  const sugs = ref<GeoLocation[]>([])
  const showS = ref(false)
  const busy = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  async function search() {
    if (q.value.trim().length < 2) { sugs.value = []; return }
    busy.value = true
    try {
      const r = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q.value)}&count=6&language=vi&format=json`
      )
      const d = await r.json()
      sugs.value = d.results ?? []
      showS.value = !!sugs.value.length
    } finally {
      busy.value = false
    }
  }

  function onInput() {
    showS.value = false
    if (timer) clearTimeout(timer)
    if (q.value.trim().length < 2) { sugs.value = []; return }
    timer = setTimeout(search, 380)
  }

  function hide() { setTimeout(() => { showS.value = false }, 180) }
  function reveal() { if (sugs.value.length) showS.value = true }

  function setLabel(loc: GeoLocation) {
    q.value = `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}, ${loc.country}`
    showS.value = false
    sugs.value = []
  }

  function getUserLocation(): Promise<GeoLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Trình duyệt không hỗ trợ định vị.'))
        return
      }
      
      busy.value = true
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          busy.value = false
          resolve({
            id: Date.now(), // Generate a fallback ID
            name: 'Vị trí hiện tại',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            country: '' // Open-Meteo doesn't strictly need this to fetch weather
          })
        },
        (err) => {
          busy.value = false
          reject(err)
        },
        { timeout: 10000, maximumAge: 60000 }
      )
    })
  }

  return { q, sugs, showS, busy, onInput, search, hide, reveal, setLabel, getUserLocation }
}
