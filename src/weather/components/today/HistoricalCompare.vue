<script setup lang="ts">
import type { HistoricalCompare } from '../../composables/useHistorical'
import { useSettings, tempSymbol } from '../../composables/useSettings'

defineProps<{ data: HistoricalCompare | null; busy: boolean }>()
const { settings } = useSettings()

function arrow(d: number | null) {
  if (d == null) return ''
  if (d > 0.5) return '▲'
  if (d < -0.5) return '▼'
  return '≈'
}
function colorClass(d: number | null) {
  if (d == null) return 'text-gray-400'
  if (d > 0.5) return 'text-red-600'
  if (d < -0.5) return 'text-blue-600'
  return 'text-gray-500'
}
function label(d: number | null) {
  if (d == null) return 'Không có dữ liệu'
  const rounded = Math.round(d * 10) / 10
  if (Math.abs(rounded) < 0.5) return 'xấp xỉ'
  return `${rounded > 0 ? '+' : ''}${rounded}°`
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
    <div class="flex items-center gap-2 mb-4">
      <span class="text-xl">📊</span>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">So sánh lịch sử</h3>
    </div>
    <div v-if="busy && !data" class="grid grid-cols-2 gap-3">
      <div v-for="i in 2" :key="i" class="h-20 bg-gray-100 rounded-xl animate-pulse" />
    </div>
    <div v-else-if="data" class="grid grid-cols-2 gap-3">
      <div class="border rounded-xl p-3 bg-gray-50">
        <div class="text-xs text-gray-500 font-bold uppercase mb-1">So với hôm qua</div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black" :class="colorClass(data.deltaMax)">
            {{ arrow(data.deltaMax) }} {{ label(data.deltaMax) }}
          </span>
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Hôm qua: {{ data.yesterdayMax != null ? Math.round(data.yesterdayMax) + tempSymbol(settings.tempUnit) : '—' }}
        </div>
      </div>
      <div class="border rounded-xl p-3 bg-gray-50">
        <div class="text-xs text-gray-500 font-bold uppercase mb-1">Cùng ngày năm trước</div>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-black" :class="colorClass(data.deltaYearMax)">
            {{ arrow(data.deltaYearMax) }} {{ label(data.deltaYearMax) }}
          </span>
        </div>
        <div class="text-xs text-gray-400 mt-1">
          Năm trước: {{ data.lastYearMax != null ? Math.round(data.lastYearMax) + tempSymbol(settings.tempUnit) : '—' }}
        </div>
      </div>
    </div>
    <div v-else class="text-xs text-gray-400">Không tải được dữ liệu lịch sử.</div>
  </div>
</template>
