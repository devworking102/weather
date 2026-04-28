<script setup lang="ts">
import type { CurrentW } from '../../types'
import { windDir, uvInfo } from '../../helpers'
import { useSettings, tempSymbol, windLabel } from '../../composables/useSettings'

defineProps<{ current: CurrentW }>()
const { settings } = useSettings()
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">💧</span>
      <span class="text-lg font-bold text-gray-800">{{ current.relative_humidity_2m }}<small class="text-xs font-medium text-gray-500 ml-0.5">%</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Độ ẩm</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">💨</span>
      <span class="text-lg font-bold text-gray-800">{{ Math.round(current.wind_speed_10m) }}<small class="text-xs font-medium text-gray-500 ml-0.5">{{ windLabel(settings.windUnit) }}</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">{{ windDir(current.wind_direction_10m) }}</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">🌪</span>
      <span class="text-lg font-bold text-gray-800">{{ Math.round(current.wind_gusts_10m ?? current.wind_speed_10m) }}<small class="text-xs font-medium text-gray-500 ml-0.5">{{ windLabel(settings.windUnit) }}</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Gió giật</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">🌡</span>
      <span class="text-lg font-bold text-gray-800">{{ Math.round(current.dew_point_2m) }}<small class="text-xs font-medium text-gray-500 ml-0.5">{{ tempSymbol(settings.tempUnit) }}</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Điểm sương</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">📊</span>
      <span class="text-lg font-bold text-gray-800">{{ Math.round(current.surface_pressure) }}<small class="text-xs font-medium text-gray-500 ml-0.5">hPa</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Áp suất</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">👁</span>
      <span class="text-lg font-bold text-gray-800">{{ (current.visibility / 1000).toFixed(1) }}<small class="text-xs font-medium text-gray-500 ml-0.5">km</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Tầm nhìn</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">☀</span>
      <span class="text-lg font-bold" :style="{ color: uvInfo(current.uv_index).c }">
        {{ current.uv_index }}<small class="text-xs font-medium text-gray-500 ml-0.5"> UV</small>
      </span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">{{ uvInfo(current.uv_index).t }}</span>
    </div>
    <div class="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1 hover:bg-blue-50 transition-colors">
      <span class="text-2xl mb-1">🌧</span>
      <span class="text-lg font-bold text-gray-800">{{ current.precipitation }}<small class="text-xs font-medium text-gray-500 ml-0.5">mm</small></span>
      <span class="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mt-1">Lượng mưa</span>
    </div>
  </div>
</template>
