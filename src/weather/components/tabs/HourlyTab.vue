<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { WeatherData } from '../../types'
import { fTime, uvInfo } from '../../helpers'
import { BASE_PLUGIN_OPTIONS, scale } from '../../chart-config'
import { useSettings, windLabel } from '../../composables/useSettings'

const { settings } = useSettings()

Chart.register(...registerables)

const props = defineProps<{
  wx: WeatherData
  hourlyList: Array<{
    time: string; temp: number; feels: number; icon: string; desc: string
    pp: number; wind: number; hum: number; uv: number
  }>
  curIdx: number
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

async function rebuild() {
  await nextTick()
  if (!canvas.value) return
  chart?.destroy()
  const s = props.curIdx
  const h = props.wx.hourly
  const idxs = Array.from({ length: 48 }, (_, i) => s + i).filter(j => j < h.time.length)
  chart = new Chart(canvas.value, {
    data: {
      labels: idxs.map(j => fTime(h.time[j])),
      datasets: [
        {
          type: 'line',
          label: 'Nhiệt độ (°C)',
          data: idxs.map(j => Math.round(h.temperature_2m[j] ?? 0)),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,.12)',
          fill: true, tension: 0.4, pointRadius: 3, pointHoverRadius: 6,
          yAxisID: 'y',
        },
        {
          type: 'bar',
          label: 'Xác suất mưa (%)',
          data: idxs.map(j => h.precipitation_probability[j] ?? 0),
          backgroundColor: 'rgba(56,189,248,.3)',
          borderColor: 'rgba(56,189,248,.6)',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: BASE_PLUGIN_OPTIONS,
      scales: {
        x: {
          ...scale(''),
          ticks: {
            ...scale('').ticks,
            maxRotation: 0,
            callback: function (this: any, value: any, index: number) {
              return index % 2 === 0 ? this.getLabelForValue(value as number) : ''
            },
          },
        },
        y:  { position: 'left', ...scale('°C') },
        y1: {
          position: 'right', min: 0, max: 100,
          ticks: { color: 'rgba(56,189,248,.7)', font: { size: 11 }, callback: (v: any) => `${v}%` },
          grid: { drawOnChartArea: false },
        },
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
        <span class="text-2xl">📈</span>
        <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Nhiệt độ & Xác suất mưa (48 giờ tới)</h3>
      </div>
      <div class="h-64 relative p-4"><canvas ref="canvas"></canvas></div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-2xl">🕐</span>
        <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Chi tiết theo giờ</h3>
      </div>
      <div class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="min-w-[720px] flex flex-col p-4">
        <div class="grid text-xs text-gray-500 font-bold border-b border-gray-200 pb-3 mb-2 uppercase tracking-wider px-2"
             style="grid-template-columns: 1fr 1fr 1.2fr 1.8fr 1.5fr 2fr 1.2fr 1.2fr; gap: 16px; align-items: center;">
          <span>Giờ</span><span>Trời</span><span>°C</span><span>Cảm giác</span>
          <span>Mưa%</span><span>Gió</span><span>Ẩm</span><span>UV</span>
        </div>
        <div
          v-for="h in hourlyList"
          :key="h.time"
          class="grid items-center text-sm py-3 px-2 rounded-lg transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-0"
          :class="h.pp >= 50 ? 'bg-blue-50/50' : ''"
          style="grid-template-columns: 1fr 1fr 1.2fr 1.8fr 1.5fr 2fr 1.2fr 1.2fr; gap: 16px;"
        >
          <span class="font-bold text-gray-800">{{ h.time }}</span>
          <span class="text-3xl drop-shadow-sm">{{ h.icon }}</span>
          <span class="text-orange-600 font-bold text-base">{{ h.temp }}°</span>
          <span class="text-gray-500 font-medium">{{ h.feels }}°</span>
          <span :class="h.pp >= 50 ? 'text-blue-600 font-bold' : 'text-gray-400'">{{ h.pp }}%</span>
          <span class="text-gray-700 font-medium">{{ h.wind }}<small class="text-xs text-gray-400 ml-1">{{ windLabel(settings.windUnit) }}</small></span>
          <span class="text-gray-700 font-medium">{{ h.hum }}<small class="text-xs text-gray-400 ml-1">%</small></span>
          <span class="font-bold" :style="{ color: uvInfo(h.uv).c }">{{ h.uv }}</span>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
