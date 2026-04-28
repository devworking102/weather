<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { WeatherData } from '../../types'
import { wmo, dayLabel, fDate, fTime, uvInfo } from '../../helpers'
import { BASE_PLUGIN_OPTIONS, scale } from '../../chart-config'
import { useSettings, tempSymbol, windLabel } from '../../composables/useSettings'

const { settings } = useSettings()

Chart.register(...registerables)

const props = defineProps<{ 
  wx: WeatherData
  days?: number 
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

// Cắt dữ liệu theo số ngày được yêu cầu (7, 16 hoặc 30)
const slicedDaily = computed(() => {
  const d = props.wx.daily
  const limit = props.days || 16
  return {
    time: d.time.slice(0, limit),
    weather_code: d.weather_code.slice(0, limit),
    temperature_2m_max: d.temperature_2m_max.slice(0, limit),
    temperature_2m_min: d.temperature_2m_min.slice(0, limit),
    precipitation_sum: d.precipitation_sum.slice(0, limit),
    precipitation_probability_max: d.precipitation_probability_max.slice(0, limit),
    wind_speed_10m_max: d.wind_speed_10m_max.slice(0, limit),
    uv_index_max: d.uv_index_max.slice(0, limit),
    sunrise: d.sunrise.slice(0, limit),
    sunset: d.sunset.slice(0, limit),
  }
})

const bounds = computed(() => {
  const d = slicedDaily.value
  return {
    min: Math.min(...d.temperature_2m_min),
    max: Math.max(...d.temperature_2m_max),
  }
})

function barStyle(i: number) {
  const d = slicedDaily.value
  const { min, max } = bounds.value
  const range = max - min || 1
  return {
    left: ((d.temperature_2m_min[i] - min) / range * 100) + '%',
    width: ((d.temperature_2m_max[i] - d.temperature_2m_min[i]) / range * 100) + '%',
  }
}

async function rebuild() {
  await nextTick()
  if (!canvas.value) return
  chart?.destroy()
  const d = slicedDaily.value
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: d.time.map((t, i) => `${dayLabel(t, i)} ${fDate(t)}`),
      datasets: [
        {
          label: 'Cao nhất (°C)',
          data: d.temperature_2m_max.map(v => Math.round(v)),
          backgroundColor: 'rgba(249,115,22,.6)',
          borderColor: '#f97316',
          borderWidth: 1,
          borderRadius: 4,
        },
        {
          label: 'Thấp nhất (°C)',
          data: d.temperature_2m_min.map(v => Math.round(v)),
          backgroundColor: 'rgba(56,189,248,.45)',
          borderColor: '#38bdf8',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: BASE_PLUGIN_OPTIONS,
      scales: {
        x: { ...scale(''), ticks: { ...scale('').ticks, maxRotation: 30 } },
        y: scale('°C'),
      },
    },
  } as any)
}

watch(() => props.wx, rebuild, { immediate: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-2xl">📊</span>
        <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Biểu đồ nhiệt độ {{ days || 16 }} ngày</h3>
      </div>
      <div class="h-[280px] relative p-4"><canvas ref="canvas"></canvas></div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-2xl">📅</span>
        <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Chi tiết {{ days || 16 }} ngày</h3>
      </div>
      <div class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="min-w-[800px] flex flex-col p-4">
          <div
            v-for="(d, i) in slicedDaily.time"
            :key="d"
            class="grid items-center gap-4 px-4 py-4 rounded-xl transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-100 border-b-gray-100 last:border-b-transparent"
            :class="{ 'bg-blue-50/50 border-blue-100': i === 0 }"
            style="grid-template-columns: 100px 100px 1fr 180px 100px;"
          >
            <div class="flex flex-col gap-1">
              <span class="font-bold text-gray-800 text-base">{{ dayLabel(d, i) }}</span>
              <span class="text-sm text-gray-500 font-medium">{{ fDate(d) }}</span>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-4xl drop-shadow-sm">{{ wmo(wx.daily.weather_code[i]).i }}</span>
              <span class="text-xs text-gray-500 font-semibold mt-1 text-center truncate w-full">{{ wmo(wx.daily.weather_code[i]).t }}</span>
            </div>
            <div class="flex items-center gap-3 px-4">
              <span class="text-orange-600 font-bold text-base min-w-[44px] text-right">{{ Math.round(wx.daily.temperature_2m_max[i]) }}{{ tempSymbol(settings.tempUnit) }}</span>
              <div class="flex-1 h-2 bg-gray-200 rounded-full relative overflow-hidden">
                <div class="absolute h-full rounded-full min-w-[8px]"
                     style="background: linear-gradient(90deg, #38bdf8, #f97316);"
                     :style="barStyle(i)"></div>
              </div>
              <span class="text-sky-600 font-bold text-base min-w-[44px]">{{ Math.round(wx.daily.temperature_2m_min[i]) }}{{ tempSymbol(settings.tempUnit) }}</span>
            </div>
            <div class="flex flex-col gap-1.5 text-sm text-gray-600 font-medium">
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1 w-20"><span class="text-lg">🌧</span> {{ wx.daily.precipitation_sum[i] }}mm</span>
                <span class="flex items-center gap-1"><span class="text-lg">💧</span> {{ wx.daily.precipitation_probability_max[i] }}%</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="flex items-center gap-1 w-24"><span class="text-lg">💨</span> {{ Math.round(wx.daily.wind_speed_10m_max[i]) }}{{ windLabel(settings.windUnit) }}</span>
                <span class="font-bold px-1.5 py-0.5 rounded text-[10px] sm:text-xs" :style="{ color: uvInfo(wx.daily.uv_index_max[i]).c, backgroundColor: uvInfo(wx.daily.uv_index_max[i]).c + '15' }">UV {{ wx.daily.uv_index_max[i] }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-1.5 text-xs text-gray-500 font-medium border-l border-gray-100 pl-4">
              <span class="flex items-center gap-1.5"><span class="text-base">🌅</span> {{ fTime(wx.daily.sunrise[i]) }}</span>
              <span class="flex items-center gap-1.5"><span class="text-base">🌇</span> {{ fTime(wx.daily.sunset[i]) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
