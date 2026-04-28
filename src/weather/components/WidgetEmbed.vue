<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useWeather } from '../composables/useWeather'
import { wmo } from '../helpers'

const urlParams = new URLSearchParams(window.location.search)
const lat = Number(urlParams.get('lat')) || 21.0285
const lon = Number(urlParams.get('lon')) || 105.8542
const name = urlParams.get('name') || 'Hà Nội'
const theme = urlParams.get('theme') || 'light'

const { wx, busy, err, load } = useWeather()

onMounted(() => {
  load(lat, lon)
})

const isDark = theme === 'dark'

const currentTemp = computed(() => Math.round(wx.value?.current.temperature_2m || 0))
const weatherIcon = computed(() => wx.value ? wmo(wx.value.current.weather_code).i : '🌡️')
const weatherDesc = computed(() => wx.value ? wmo(wx.value.current.weather_code).t : 'Đang tải...')
const windSpeed = computed(() => Math.round(wx.value?.current.wind_speed_10m || 0))
const humidity = computed(() => Math.round(wx.value?.current.relative_humidity_2m || 0))
const feelsLike = computed(() => Math.round(wx.value?.current.apparent_temperature || 0))
const precip = computed(() => wx.value?.current.precipitation || 0)
const highTemp = computed(() => Math.round(wx.value?.daily.temperature_2m_max[0] || 0))
const lowTemp = computed(() => Math.round(wx.value?.daily.temperature_2m_min[0] || 0))
</script>

<template>
  <div class="w-full overflow-hidden font-sans flex flex-col p-4 sm:p-5 transition-colors" :class="isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'">
    <div v-if="busy" class="flex-1 flex items-center justify-center">
      <svg class="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
    </div>
    
    <div v-else-if="err" class="flex-1 flex items-center justify-center text-sm text-red-500 text-center">Lỗi dữ liệu</div>

    <div v-else-if="wx" class="flex flex-col h-full justify-between gap-2">
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-xl font-bold tracking-tight line-clamp-1" :class="isDark ? 'text-gray-100' : 'text-gray-800'">{{ name }}</h2>
          <p class="text-xs mt-0.5" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Thời tiết hiện tại</p>
        </div>
        <a href="#" target="_blank" class="text-[10px] font-bold px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white no-underline transition-colors">WeatherVN</a>
      </div>

      <div class="flex items-center gap-3 my-2">
        <span class="text-5xl drop-shadow-sm">{{ weatherIcon }}</span>
        <div class="flex flex-col">
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-black">{{ currentTemp }}°</span>
            <span class="text-sm font-semibold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Cảm giác {{ feelsLike }}°</span>
          </div>
          <div class="text-sm font-semibold mt-1 flex items-center gap-2" :class="isDark ? 'text-gray-300' : 'text-gray-600'">
            <span>{{ weatherDesc }}</span>
            <span class="text-xs font-bold" :class="isDark ? 'text-gray-500' : 'text-gray-400'">H:{{ highTemp }}° L:{{ lowTemp }}°</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-auto">
        <div class="flex items-center gap-2 p-2.5 rounded-xl" :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-100'">
          <span class="text-lg">💨</span>
          <div class="flex flex-col"><span class="text-[10px] uppercase font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Gió</span><span class="text-sm font-bold">{{ windSpeed }} km/h</span></div>
        </div>
        <div class="flex items-center gap-2 p-2.5 rounded-xl" :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-100'">
          <span class="text-lg">💧</span>
          <div class="flex flex-col"><span class="text-[10px] uppercase font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Độ ẩm</span><span class="text-sm font-bold">{{ humidity }}%</span></div>
        </div>
        <div class="flex items-center gap-2 p-2.5 rounded-xl" :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-100'">
          <span class="text-lg">🌧️</span>
          <div class="flex flex-col"><span class="text-[10px] uppercase font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">Mưa</span><span class="text-sm font-bold">{{ precip }} mm</span></div>
        </div>
        <div class="flex items-center gap-2 p-2.5 rounded-xl" :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-100'">
          <span class="text-lg">☀️</span>
          <div class="flex flex-col"><span class="text-[10px] uppercase font-bold" :class="isDark ? 'text-gray-400' : 'text-gray-500'">UV Max</span><span class="text-sm font-bold">{{ wx?.daily?.uv_index_max[0] || 0 }}</span></div>
        </div>
      </div>
    </div>
  </div>
</template>