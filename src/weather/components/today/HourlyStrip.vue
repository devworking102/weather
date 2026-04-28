<script setup lang="ts">
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'

defineProps<{
  items: Array<{ time: string; temp: number; icon: string; pp: number }>
}>()
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <span class="text-2xl">⏱</span>
      <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Dự báo hôm nay theo giờ</h3>
    </div>
    <swiper
      :slides-per-view="'auto'"
      :space-between="12"
      class="p-4"
    >
      <swiper-slide
        v-for="h in items"
        :key="h.time"
        class="!w-auto"
      >
        <div class="w-[110px] h-full flex flex-col items-center gap-2 rounded-xl px-4 py-4 transition-colors border"
        :class="h.pp >= 30 ? 'bg-blue-50 border-blue-100' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'"
        >
        <span class="text-sm font-medium text-gray-500">{{ h.time }}</span>
        <span class="text-4xl my-1 drop-shadow-sm">{{ h.icon }}</span>
        <span class="text-base font-bold text-gray-800">{{ h.temp }}°</span>
        <span
          v-if="h.pp >= 20"
          class="text-xs text-blue-600 font-bold bg-blue-100 rounded px-2 py-0.5 mt-0.5"
        >{{ h.pp }}%</span>
        <span v-else class="text-xs text-transparent px-2 py-0.5 mt-0.5 select-none">0%</span>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>
