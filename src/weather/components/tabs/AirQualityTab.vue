<script setup lang="ts">
import { ref, watch, nextTick, onBeforeUnmount, computed } from 'vue'
import { Chart, registerables } from 'chart.js'
import type { AQIData } from '../../types'
import { aqiInfo, aqiAdvice, fTime } from '../../helpers'
import { BASE_PLUGIN_OPTIONS, scale } from '../../chart-config'

Chart.register(...registerables)

const props = defineProps<{ aqd: AQIData | null }>()

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const arcPath = computed(() => {
  if (!props.aqd) return ''
  const v = Math.min(props.aqd.current.european_aqi, 150)
  const theta = (v / 150) * Math.PI
  const ex = 80 - 70 * Math.cos(theta)
  const ey = 80 - 70 * Math.sin(theta)
  const large = theta > Math.PI / 2 ? 1 : 0
  return `M 10 80 A 70 70 0 ${large} 1 ${ex.toFixed(1)} ${ey.toFixed(1)}`
})

const scaleItems = [
  { label: '0–20',   name: 'Tốt',        c: '#4ade80' },
  { label: '20–40',  name: 'Khá tốt',    c: '#a3e635' },
  { label: '40–60',  name: 'Trung bình', c: '#facc15' },
  { label: '60–80',  name: 'Kém',        c: '#f97316' },
  { label: '80–100', name: 'Rất kém',    c: '#ef4444' },
  { label: '100+',   name: 'Nguy hại',   c: '#a855f7' },
]

async function rebuild() {
  await nextTick()
  if (!canvas.value || !props.aqd) return
  chart?.destroy()
  const h = props.aqd.hourly
  const pfx = new Date().toISOString().slice(0, 13)
  const s = Math.max(0, h.time.findIndex(t => t.startsWith(pfx)))
  const idxs = Array.from({ length: 24 }, (_, i) => s + i).filter(j => j < h.time.length)
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: idxs.map(j => fTime(h.time[j])),
      datasets: [
        {
          label: 'EU AQI',
          data: idxs.map(j => h.european_aqi[j] ?? 0),
          borderColor: '#f97316',
          backgroundColor: 'rgba(249,115,22,.12)',
          fill: true, tension: 0.4, pointRadius: 2, yAxisID: 'y',
        },
        {
          label: 'PM2.5 (μg/m³)',
          data: idxs.map(j => Math.round((h.pm2_5[j] ?? 0) * 10) / 10),
          borderColor: '#c084fc',
          backgroundColor: 'transparent',
          tension: 0.4, pointRadius: 2, yAxisID: 'y1',
        },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: BASE_PLUGIN_OPTIONS,
      scales: {
        x: { ...scale(''), ticks: { ...scale('').ticks, maxRotation: 0 } },
        y:  { position: 'left', ...scale('') },
        y1: {
          position: 'right',
          ticks: { color: 'rgba(192,132,252,.7)', font: { size: 11 }, callback: (v: any) => `${v}μg` },
          grid: { drawOnChartArea: false },
        },
      },
    },
  } as any)
}

watch(() => props.aqd, rebuild, { immediate: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <div v-if="!aqd" class="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
    <p>⚠️ Dữ liệu chất lượng không khí không khả dụng cho khu vực này.</p>
  </div>

  <div v-else class="flex flex-col gap-4">
    <div
      class="flex gap-6 items-center flex-col sm:flex-row border rounded-xl p-6 shadow-sm"
      :style="{ background: aqiInfo(aqd.current.european_aqi).bg, borderColor: aqiInfo(aqd.current.european_aqi).c + '55' }"
    >
      <div class="shrink-0">
        <svg width="160" height="92" viewBox="0 0 160 92">
          <path d="M 10 80 A 70 70 0 0 1 150 80"
                fill="none" stroke="rgba(0,0,0,0.05)" stroke-width="14" stroke-linecap="round"/>
          <path :d="arcPath"
                fill="none"
                :stroke="aqiInfo(aqd.current.european_aqi).c"
                stroke-width="14" stroke-linecap="round"/>
          <text x="80" y="72" text-anchor="middle" fill="#374151" font-size="28" font-weight="800">
            {{ aqd.current.european_aqi }}
          </text>
        </svg>
      </div>
      <div class="flex-1">
        <div class="text-2xl font-black" :style="{ color: aqiInfo(aqd.current.european_aqi).c }">
          {{ aqiInfo(aqd.current.european_aqi).t }}
        </div>
        <div class="text-sm text-gray-600 mt-0.5 mb-2 font-bold uppercase tracking-wider">Chỉ số AQI (EU)</div>
        <div class="text-base text-gray-700 mb-2">US AQI: <strong>{{ aqd.current.us_aqi }}</strong></div>
        <div class="text-base leading-relaxed text-gray-800 font-medium">{{ aqiAdvice(aqd.current.european_aqi) }}</div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-2xl">🔬</span>
        <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Các chất ô nhiễm hiện tại</h3>
      </div>
      <div class="grid gap-3 p-4" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));">
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <span class="text-sm text-gray-500 font-bold uppercase tracking-wide">PM2.5</span>
          <span class="text-3xl font-black text-gray-800 leading-none">{{ aqd.current.pm2_5.toFixed(1) }}</span>
          <span class="text-sm text-gray-400 font-medium">μg/m³</span>
          <div class="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
                 :style="{
                   width: Math.min(aqd.current.pm2_5 / 75 * 100, 100) + '%',
                   background: aqd.current.pm2_5 < 25 ? '#4ade80' : aqd.current.pm2_5 < 50 ? '#facc15' : '#ef4444'
                 }"></div>
          </div>
        </div>
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <span class="text-xs text-gray-500 font-bold uppercase tracking-wide">PM10</span>
          <span class="text-2xl font-black text-gray-800 leading-none">{{ aqd.current.pm10.toFixed(1) }}</span>
          <span class="text-xs text-gray-400 font-medium">μg/m³</span>
          <div class="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
                 :style="{
                   width: Math.min(aqd.current.pm10 / 150 * 100, 100) + '%',
                   background: aqd.current.pm10 < 50 ? '#4ade80' : aqd.current.pm10 < 100 ? '#facc15' : '#ef4444'
                 }"></div>
          </div>
        </div>
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <span class="text-xs text-gray-500 font-bold uppercase tracking-wide">NO₂</span>
          <span class="text-2xl font-black text-gray-800 leading-none">{{ aqd.current.nitrogen_dioxide.toFixed(1) }}</span>
          <span class="text-xs text-gray-400 font-medium">μg/m³</span>
          <div class="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full rounded-full bg-violet-400 transition-all duration-500"
                 :style="{ width: Math.min(aqd.current.nitrogen_dioxide / 200 * 100, 100) + '%' }"></div>
          </div>
        </div>
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <span class="text-xs text-gray-500 font-bold uppercase tracking-wide">O₃</span>
          <span class="text-2xl font-black text-gray-800 leading-none">{{ aqd.current.ozone.toFixed(1) }}</span>
          <span class="text-xs text-gray-400 font-medium">μg/m³</span>
          <div class="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full rounded-full bg-blue-400 transition-all duration-500"
                 :style="{ width: Math.min(aqd.current.ozone / 240 * 100, 100) + '%' }"></div>
          </div>
        </div>
        <div class="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-1 shadow-sm">
          <span class="text-xs text-gray-500 font-bold uppercase tracking-wide">CO</span>
          <span class="text-2xl font-black text-gray-800 leading-none">{{ (aqd.current.carbon_monoxide / 1000).toFixed(2) }}</span>
          <span class="text-xs text-gray-400 font-medium">mg/m³</span>
          <div class="h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full rounded-full bg-orange-400 transition-all duration-500"
                 :style="{ width: Math.min(aqd.current.carbon_monoxide / 10000 * 100, 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-xl">📈</span>
        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">AQI & PM2.5 trong 24 giờ tới</h3>
      </div>
      <div class="h-64 relative p-4"><canvas ref="canvas"></canvas></div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-xl">📖</span>
        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Thang đo EU AQI</h3>
      </div>
      <div class="flex gap-4 flex-wrap p-4 bg-gray-50">
        <div v-for="item in scaleItems" :key="item.label" class="flex items-center gap-1.5 text-sm">
          <div class="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" :style="{ background: item.c }"></div>
          <span class="text-gray-500 font-bold text-xs">{{ item.label }}</span>
          <span class="font-bold text-gray-800">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
