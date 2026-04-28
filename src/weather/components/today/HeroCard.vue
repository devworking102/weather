<script setup lang="ts">
import type { CurrentW } from '../../types'
import { wmo } from '../../helpers'
import { useSettings, tempSymbol } from '../../composables/useSettings'

defineProps<{ current: CurrentW }>()
const { settings } = useSettings()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
    <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
      <span class="text-[5rem] sm:text-[6rem] leading-none drop-shadow-md">{{ wmo(current.weather_code).i }}</span>
      <div class="flex flex-col justify-center h-full pt-1">
        <div class="text-[4rem] sm:text-[5.5rem] font-black text-gray-800 leading-none tracking-tighter">
          {{ Math.round(current.temperature_2m) }}<sup class="text-[2rem] sm:text-[2.5rem] align-super text-gray-500 font-bold">{{ tempSymbol(settings.tempUnit) }}</sup>
        </div>
        <div class="text-xl sm:text-2xl font-bold text-gray-700 mt-2">{{ wmo(current.weather_code).t }}</div>
        <div class="text-sm sm:text-base font-medium text-gray-500 mt-1">
          Cảm giác {{ Math.round(current.apparent_temperature) }}{{ tempSymbol(settings.tempUnit) }} &nbsp;·&nbsp; Mây {{ current.cloud_cover }}%
        </div>
      </div>
    </div>
  </div>
</template>
