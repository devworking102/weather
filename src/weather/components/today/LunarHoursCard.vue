<script setup lang="ts">
import { computed } from 'vue'
import { toLunarDate, zodiacHours } from '../../astronomy'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'

const now = new Date()
const lunar = computed(() => toLunarDate(now))
const hours = computed(() => zodiacHours(lunar.value.month))

const currentHourIdx = computed(() => {
  const h = now.getHours()
  return Math.floor(((h + 1) % 24) / 2)
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <span class="text-xl">🏮</span>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Lịch âm & Giờ hoàng đạo</h3>
    </div>

    <div class="p-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-5 mb-5">
        <div class="flex items-center gap-4">
          <div class="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-3 text-center min-w-[80px]">
            <div class="text-xs font-semibold uppercase tracking-wider mb-1">Tháng {{ lunar.month }}</div>
            <div class="text-3xl font-black leading-none">{{ lunar.day }}</div>
          </div>
          <div>
            <div class="text-lg font-bold text-gray-800 flex items-center gap-2">
              Âm lịch năm {{ lunar.year }}
              <span v-if="lunar.leap" class="text-[10px] bg-amber-100 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-bold uppercase">Nhuận</span>
            </div>
            <div class="text-sm text-gray-500 mt-1 max-w-sm">
              Việc chọn giờ hoàng đạo giúp mang lại may mắn, thuận lợi cho các công việc quan trọng trong ngày.
            </div>
          </div>
        </div>
      </div>

      <swiper
        :slides-per-view="'auto'"
        :space-between="12"
        class="pb-2"
      >
        <swiper-slide
          v-for="h in hours"
          :key="h.index"
          class="!w-auto"
        >
          <div
            class="w-28 h-full relative rounded-xl p-3 text-center border transition-all duration-200"
          :class="[
            currentHourIdx === h.index
              ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200 scale-[1.03] z-10'
              : h.good
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : 'bg-gray-100 border-gray-200 hover:bg-gray-200/60',
          ]"
          >
          <div class="text-sm font-bold tracking-wide mb-1" :class="currentHourIdx === h.index ? 'text-white' : 'text-gray-800'">{{ h.name }}</div>
          <div class="text-xs font-mono mb-2" :class="currentHourIdx === h.index ? 'text-blue-100' : 'text-gray-500'">
            {{ String(h.start).padStart(2, '0') }}:00 – {{ String(h.end).padStart(2, '0') }}:00
          </div>
          <div class="text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md"
            :class="[
              currentHourIdx === h.index
                ? 'bg-blue-700 text-white'
                : h.good
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-600'
            ]"
          >
            {{ h.good ? 'Hoàng đạo' : 'Hắc đạo' }}
          </div>
          
          <div v-if="currentHourIdx === h.index" class="absolute -top-2 -right-2 flex h-4 w-4">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-300 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-4 w-4 bg-blue-400 border-2 border-white"></span>
          </div>
          </div>
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>
