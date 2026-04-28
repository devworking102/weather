<script setup lang="ts">
import type { DailyW } from '../../types'
import { uvInfo } from '../../helpers'
import { useSettings, tempSymbol, windLabel } from '../../composables/useSettings'

defineProps<{ daily: DailyW }>()
const { settings } = useSettings()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl shadow-sm mb-4 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <span class="text-2xl">🌡</span>
      <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Cao / Thấp hôm nay</h3>
    </div>
    <div class="p-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 items-start">
      <div class="flex flex-col">
        <span class="text-xs text-gray-500 font-semibold uppercase mb-1">Cao nhất</span>
        <span class="text-orange-600 font-black text-xl">▲ {{ Math.round(daily.temperature_2m_max[0]) }}{{ tempSymbol(settings.tempUnit) }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-xs text-gray-500 font-semibold uppercase mb-1">Thấp nhất</span>
        <span class="text-sky-600 font-black text-xl">▼ {{ Math.round(daily.temperature_2m_min[0]) }}{{ tempSymbol(settings.tempUnit) }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-xs text-gray-500 font-semibold uppercase mb-1">Lượng mưa</span>
        <span class="text-gray-800 font-bold text-lg">🌧 {{ daily.precipitation_sum[0] }}mm</span>
      </div>
      <div class="flex flex-col">
        <span class="text-xs text-gray-500 font-semibold uppercase mb-1">Khả năng mưa</span>
        <span class="text-gray-800 font-bold text-lg">💧 {{ daily.precipitation_probability_max[0] }}%</span>
      </div>
      <div class="flex flex-col">
        <span class="text-xs text-gray-500 font-semibold uppercase mb-1">Gió lớn nhất</span>
        <span class="text-gray-800 font-bold text-lg">💨 {{ Math.round(daily.wind_speed_10m_max[0]) }}{{ windLabel(settings.windUnit) }}</span>
      </div>
      <div class="flex flex-col">
        <span class="text-xs text-gray-500 font-semibold uppercase mb-1">Tia cực tím</span>
        <span class="font-bold text-lg" :style="{ color: uvInfo(daily.uv_index_max[0]).c }">☀️ UV {{ daily.uv_index_max[0] }}</span>
      </div>
    </div>
  </div>
</template>
