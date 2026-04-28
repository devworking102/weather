<script setup lang="ts">
import { TABS } from '../weather/constants'

import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/swiper-bundle.css'

defineProps<{
  activeTab: 'weather' | 'map' | 'news' | 'calendar' | 'widget'
  activeWeatherTab?: string
}>()

defineEmits<{
  (e: 'change', tab: 'weather' | 'map' | 'news' | 'calendar' | 'widget'): void
  (e: 'changeWeatherTab', tab: string): void
}>()
</script>

<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-2 cursor-pointer shrink-0 mr-4" @click="$emit('change', 'weather')">
        <span class="text-4xl drop-shadow-sm">🌤️</span>
        <h1 class="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 tracking-tight">
          Weather<span class="text-gray-800">VN</span>
        </h1>
      </div>

      <!-- Action slot (install, refresh, settings) -->
      <div class="flex items-center gap-2 shrink-0 order-3 ml-auto lg:ml-2">
        <slot name="actions" />
      </div>

      <!-- Global Tabs -->
      <nav class="min-w-0 bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
        <swiper
          :slides-per-view="'auto'"
          :space-between="4"
          class="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <swiper-slide class="!w-auto">
            <button 
              @click="$emit('change', 'weather')"
              class="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-base font-semibold transition-all duration-200"
              :class="activeTab === 'weather' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'"
            >
              <span class="text-2xl">🌦️</span> <span class="hidden sm:inline">Thời tiết</span>
            </button>
          </swiper-slide>
          <swiper-slide class="!w-auto">
            <button 
              @click="$emit('change', 'map')"
              class="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-base font-semibold transition-all duration-200 whitespace-nowrap"
              :class="activeTab === 'map' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'"
            >
              <span class="text-2xl">🗺️</span> <span class="hidden lg:inline">Bản đồ Gió</span>
            </button>
          </swiper-slide>
          <swiper-slide class="!w-auto">
            <button 
              @click="$emit('change', 'news')"
              class="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-base font-semibold transition-all duration-200"
              :class="activeTab === 'news' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'"
            >
              <span class="text-2xl">📰</span> <span class="hidden lg:inline">Tin tức</span>
            </button>
          </swiper-slide>
          <swiper-slide class="!w-auto">
            <button 
              @click="$emit('change', 'calendar')"
              class="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-base font-semibold transition-all duration-200"
              :class="activeTab === 'calendar' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'"
            >
              <span class="text-2xl">📅</span> <span class="hidden sm:inline">Lịch Âm</span>
            </button>
          </swiper-slide>
          <swiper-slide class="!w-auto">
            <button 
              @click="$emit('change', 'widget')"
              class="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg text-base font-semibold transition-all duration-200"
              :class="activeTab === 'widget' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'"
            >
              <span class="text-2xl">⚙️</span> <span class="hidden lg:inline">Tiện ích (Widget)</span>
            </button>
          </swiper-slide>
        </swiper>
      </nav>
    </div>

    <!-- Weather Sub-Tabs (Chỉ hiện khi ở trang Thời tiết) -->
    <div v-if="activeTab === 'weather'" class="bg-gray-50/80 border-t border-gray-200/60 backdrop-blur-md">
      <swiper
        :slides-per-view="'auto'"
        :space-between="12"
        class="max-w-6xl mx-auto !px-4 !py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <swiper-slide
            v-for="t in TABS"
            :key="t.id"
            class="!w-auto"
          >
          <button
            @click="$emit('changeWeatherTab', t.id)"
            class="px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 whitespace-nowrap"
            :class="activeWeatherTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-900'"
          >
            {{ t.label }}
          </button>
        </swiper-slide>
      </swiper>
    </div>
  </header>
</template>