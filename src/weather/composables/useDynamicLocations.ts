import { ref } from 'vue'
import type { GeoLocation } from '../types'

interface IpInfo {
  lat: number
  lon: number
  city: string
  country: string
  countryCode: string
  region?: string
}

async function fetchIpInfo(): Promise<IpInfo | null> {
  try {
    const r = await fetch('https://ipapi.co/json/')
    if (!r.ok) return null
    const d = await r.json()
    if (!Number.isFinite(d.latitude) || !Number.isFinite(d.longitude)) return null
    return {
      lat: d.latitude,
      lon: d.longitude,
      city: d.city,
      country: d.country_name,
      countryCode: d.country_code,
      region: d.region,
    }
  } catch {
    return null
  }
}

async function reverseGeocode(lat: number, lon: number) {
  try {
    const r = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`
    )
    if (!r.ok) return null
    const d = await r.json()
    return {
      city: d.city || d.locality || d.principalSubdivision || '',
      country: d.countryName || '',
      admin1: d.principalSubdivision as string | undefined,
      countryCode: d.countryCode as string | undefined,
    }
  } catch {
    return null
  }
}

function browserGeolocate(timeoutMs = 4000): Promise<GeolocationCoordinates | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      () => resolve(null),
      { timeout: timeoutMs, maximumAge: 60_000 }
    )
  })
}

export interface DetectedLocation extends GeoLocation {
  countryCode?: string
}

// Trả về location nhanh nhất có thể: chạy song song browser geolocation + IP lookup,
// cái nào xong trước thì dùng. Reverse geocode đặt thành background upgrade qua upgradeLocationName.
export async function detectDefaultLocation(): Promise<DetectedLocation> {
  const ipPromise = fetchIpInfo()
  const coords = await browserGeolocate(4000)
  if (coords) {
    // Nếu IP lookup đã xong thì dùng city/country từ đó (chính xác ngôn ngữ), nếu chưa thì bỏ qua
    const ipResolved = await Promise.race([
      ipPromise,
      new Promise<null>((r) => setTimeout(() => r(null), 300)),
    ])
    return {
      id: Date.now(),
      name: ipResolved?.city || 'Vị trí hiện tại',
      latitude: coords.latitude,
      longitude: coords.longitude,
      country: ipResolved?.country || '',
      admin1: ipResolved?.region,
      countryCode: ipResolved?.countryCode,
    }
  }
  const ip = await ipPromise
  if (ip) {
    return {
      id: Date.now(),
      name: ip.city || 'Vị trí',
      latitude: ip.lat,
      longitude: ip.lon,
      country: ip.country,
      admin1: ip.region,
      countryCode: ip.countryCode,
    }
  }
  throw new Error('Không xác định được vị trí')
}

// Background upgrade tên chính xác (tiếng Việt) qua reverse geocode.
export async function upgradeLocationName(lat: number, lon: number) {
  return reverseGeocode(lat, lon)
}

async function fetchCityNames(country: string): Promise<string[]> {
  try {
    const r = await fetch('https://countriesnow.space/api/v0.1/countries/cities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ country }),
    })
    if (!r.ok) return []
    const d = await r.json()
    return Array.isArray(d?.data) ? d.data : []
  } catch {
    return []
  }
}

async function geocodeCity(name: string): Promise<GeoLocation | null> {
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=vi&format=json`
    )
    const d = await r.json()
    const f = d.results?.[0]
    if (!f) return null
    return {
      id: f.id ?? Math.floor(Math.random() * 1e9),
      name: f.name,
      latitude: f.latitude,
      longitude: f.longitude,
      country: f.country,
      admin1: f.admin1,
    }
  } catch {
    return null
  }
}

export function usePopularCities() {
  const cities = ref<GeoLocation[]>([])
  const busy = ref(false)

  async function load(country: string, limit = 5) {
    if (!country) return
    busy.value = true
    try {
      const names = await fetchCityNames(country)
      const picks = names.slice(0, limit)
      const geo = await Promise.all(picks.map(geocodeCity))
      const uniq = new Map<string, GeoLocation>()
      for (const g of geo) {
        if (!g) continue
        const key = `${g.latitude.toFixed(2)}_${g.longitude.toFixed(2)}`
        if (!uniq.has(key)) uniq.set(key, g)
      }
      cities.value = Array.from(uniq.values())
    } finally {
      busy.value = false
    }
  }

  return { cities, busy, load }
}
