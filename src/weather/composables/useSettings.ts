import { ref, watchEffect } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'
export type TempUnit = 'celsius' | 'fahrenheit'
export type WindUnit = 'kmh' | 'mph' | 'ms'

const STORAGE_KEY = 'weather_vn_settings'

interface Settings {
  theme: Theme
  tempUnit: TempUnit
  windUnit: WindUnit
}

const defaults: Settings = { theme: 'auto', tempUnit: 'celsius', windUnit: 'kmh' }

function load(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

const state = ref<Settings>(load())

watchEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value))
})

function applyTheme(t: Theme) {
  const root = document.documentElement
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = t === 'dark' || (t === 'auto' && prefersDark)
  root.classList.toggle('dark', isDark)
}

watchEffect(() => applyTheme(state.value.theme))

if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.value.theme === 'auto') applyTheme('auto')
  })
}

export function useSettings() {
  return {
    settings: state,
    setTheme(t: Theme) { state.value = { ...state.value, theme: t } },
    setTempUnit(u: TempUnit) { state.value = { ...state.value, tempUnit: u } },
    setWindUnit(u: WindUnit) { state.value = { ...state.value, windUnit: u } },
  }
}

export function tempSymbol(u: TempUnit) {
  return u === 'fahrenheit' ? '°F' : '°C'
}

export function windLabel(u: WindUnit) {
  return u === 'mph' ? 'mph' : u === 'ms' ? 'm/s' : 'km/h'
}
