<script setup lang="ts">
import { computed } from 'vue'
import { fTime } from '../../helpers'
import { moonPhase } from '../../astronomy'

const props = defineProps<{ sunrise: string; sunset: string }>()

const daylight = computed(() => {
  const rise = new Date('1970-01-01T' + fTime(props.sunrise))
  const set  = new Date('1970-01-01T' + fTime(props.sunset))
  return (Math.abs(set.getTime() - rise.getTime()) / 36e5).toFixed(1) + 'h'
})

const moon = computed(() => moonPhase(new Date()))
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <span class="text-2xl">🌅</span>
      <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Mặt trời & Mặt trăng</h3>
    </div>
    <div class="p-4 grid grid-cols-2 gap-4">
      <div class="flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-4 transition-colors hover:bg-blue-50">
        <span class="text-4xl mb-1 drop-shadow-sm">🌅</span>
        <span class="font-bold text-gray-800 text-lg">{{ fTime(sunrise) }}</span>
        <small class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Bình minh</small>
      </div>
      <div class="flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-4 transition-colors hover:bg-orange-50">
        <span class="text-4xl mb-1 drop-shadow-sm">🌇</span>
        <span class="font-bold text-gray-800 text-lg">{{ fTime(sunset) }}</span>
        <small class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Hoàng hôn</small>
      </div>
      <div class="flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-4 transition-colors hover:bg-amber-50">
        <span class="text-4xl mb-1 drop-shadow-sm">☀️</span>
        <span class="font-bold text-gray-800 text-lg">{{ daylight }}</span>
        <small class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Ban ngày</small>
      </div>
      <div class="flex flex-col items-center gap-1 bg-gray-50 border border-gray-100 rounded-xl p-4 text-center transition-colors hover:bg-slate-100">
        <span class="text-4xl mb-1 drop-shadow-sm">{{ moon.icon }}</span>
        <span class="font-bold text-gray-800 text-lg">{{ moon.illumination }}%</span>
        <small class="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider">{{ moon.name }}</small>
      </div>
    </div>
  </div>
</template>
