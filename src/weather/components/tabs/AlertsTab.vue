<script setup lang="ts">
import type { Earthquake, WeatherAlert } from '../../types'
import type { Typhoon } from '../../composables/useTyphoons'
import { fDateTime } from '../../helpers'
import TyphoonCard from '../TyphoonCard.vue'

defineProps<{
  alerts: WeatherAlert[]
  quakes: Earthquake[]
  quakesBusy: boolean
  quakesErr: string
  typhoons?: Typhoon[]
  typhoonsBusy?: boolean
  typhoonsErr?: string
}>()

function magColor(m: number) {
  if (m >= 7) return 'text-red-700 border-red-200 bg-red-100'
  if (m >= 6) return 'text-orange-700 border-orange-200 bg-orange-100'
  if (m >= 5) return 'text-amber-700 border-amber-200 bg-amber-100'
  if (m >= 4) return 'text-yellow-700 border-yellow-200 bg-yellow-100'
  return 'text-gray-600 border-gray-200 bg-gray-100'
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Typhoon tracker -->
    <TyphoonCard
      :typhoons="typhoons ?? []"
      :busy="typhoonsBusy ?? false"
      :err="typhoonsErr ?? ''"
    />

    <!-- Weather-derived alerts -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-2xl">⚠️</span>
        <h3 class="text-base font-bold text-gray-800 uppercase tracking-wide">Cảnh báo thời tiết & không khí</h3>
      </div>

      <div class="p-4">
        <div v-if="!alerts.length" class="flex items-center gap-3 text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <span class="text-3xl">✅</span>
          <span class="text-base font-medium">Hiện không có cảnh báo thời tiết nguy hiểm nào cho khu vực này.</span>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="(a, i) in alerts"
            :key="i"
            class="relative flex items-start gap-4 rounded-lg p-4 border shadow-sm transition-colors"
            :class="{
              'bg-red-50 border-red-200 hover:bg-red-100': a.level === 'danger',
              'bg-amber-50 border-amber-200 hover:bg-amber-100': a.level === 'warning',
              'bg-blue-50 border-blue-200 hover:bg-blue-100': a.level === 'info',
            }"
          >
            <div class="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-lg" :class="{
              'bg-red-500': a.level === 'danger',
              'bg-amber-500': a.level === 'warning',
              'bg-blue-500': a.level === 'info',
            }"></div>

            <span class="text-4xl leading-none shrink-0 drop-shadow-sm pl-1">{{ a.icon }}</span>
            <div class="flex-1">
              <div class="font-bold text-base mb-1" :class="{
                'text-red-800': a.level === 'danger',
                'text-amber-800': a.level === 'warning',
                'text-blue-800': a.level === 'info',
              }">{{ a.title }}</div>
              <div class="text-sm leading-relaxed" :class="{
                'text-red-700': a.level === 'danger',
                'text-amber-700': a.level === 'warning',
                'text-blue-700': a.level === 'info',
              }">{{ a.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Earthquake feed -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div class="flex items-center gap-2">
          <span class="text-xl">🌋</span>
          <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Động đất gần đây</h3>
        </div>
        <span class="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-medium uppercase tracking-wider">USGS 1500km</span>
      </div>

      <div class="p-0">
        <!-- Skeleton Loading cho Động đất -->
        <div v-if="quakesBusy" class="divide-y divide-gray-100 animate-pulse">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 p-4">
            <div class="h-14 w-14 bg-gray-200 rounded-full shrink-0"></div>
            <div class="flex-1 min-w-0 py-1">
              <div class="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div class="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div class="h-6 w-16 bg-gray-200 rounded-md"></div>
          </div>
        </div>
        <div v-else-if="quakesErr" class="text-center py-6 text-red-500 text-sm">{{ quakesErr }}</div>
        <div v-else-if="!quakes.length" class="text-center py-6 text-gray-500 text-sm">
          Không có trận động đất nào được ghi nhận trong 7 ngày qua.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <a
            v-for="q in quakes"
            :key="q.id"
            :href="q.url"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors no-underline group"
          >
            <div class="flex flex-col items-center justify-center h-14 w-14 shrink-0 rounded-full border-2" :class="magColor(q.magnitude)">
              <span class="text-lg font-bold leading-none">{{ q.magnitude.toFixed(1) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{{ q.place }}</div>
              <div class="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-1 sm:gap-2">
                <span>🕒 {{ fDateTime(q.time) }}</span>
                <span class="hidden sm:inline">•</span>
                <span>Sâu {{ Math.round(q.depth) }}km</span>
                <span class="hidden sm:inline">•</span>
                <span>Cách ~{{ q.distanceKm }}km</span>
              </div>
            </div>
            <span
              v-if="q.tsunami === 1"
              class="text-xs bg-red-100 text-red-700 border border-red-200 rounded-md px-2 py-1 font-bold uppercase tracking-wider shrink-0"
            >🌊 Sóng thần</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
