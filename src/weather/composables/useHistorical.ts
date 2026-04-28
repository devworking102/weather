import { ref } from 'vue'

export interface HistoricalCompare {
  yesterdayMax: number | null
  yesterdayMin: number | null
  lastYearMax: number | null
  lastYearMin: number | null
  deltaMax: number | null  // today - yesterday
  deltaYearMax: number | null  // today - same day last year
}

function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function useHistorical() {
  const data = ref<HistoricalCompare | null>(null)
  const busy = ref(false)

  async function load(lat: number, lon: number, todayMax: number) {
    busy.value = true
    try {
      const today = new Date()
      const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
      const lastYear = new Date(today); lastYear.setFullYear(today.getFullYear() - 1)

      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
        `&start_date=${ymd(lastYear)}&end_date=${ymd(yesterday)}` +
        `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`

      const res = await fetch(url)
      if (!res.ok) throw new Error('history')
      const json = await res.json()

      const times: string[] = json.daily.time
      const maxes: number[] = json.daily.temperature_2m_max
      const mins: number[] = json.daily.temperature_2m_min

      const yIdx = times.indexOf(ymd(yesterday))
      const lyIdx = times.indexOf(ymd(lastYear))

      const yMax = yIdx >= 0 ? maxes[yIdx] : null
      const yMin = yIdx >= 0 ? mins[yIdx] : null
      const lyMax = lyIdx >= 0 ? maxes[lyIdx] : null
      const lyMin = lyIdx >= 0 ? mins[lyIdx] : null

      data.value = {
        yesterdayMax: yMax,
        yesterdayMin: yMin,
        lastYearMax: lyMax,
        lastYearMin: lyMin,
        deltaMax: yMax != null ? todayMax - yMax : null,
        deltaYearMax: lyMax != null ? todayMax - lyMax : null,
      }
    } catch {
      data.value = null
    } finally {
      busy.value = false
    }
  }

  return { data, busy, load }
}
