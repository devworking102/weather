<script setup lang="ts">
import type { Typhoon } from '../composables/useTyphoons'
import { fDateTime } from '../helpers'

defineProps<{ typhoons: Typhoon[]; busy: boolean; err: string }>()

function sevClass(cat: string) {
  const c = (cat || '').toUpperCase()
  if (c.includes('STS') || c.includes('TY') || c.includes('STY')) return 'bg-red-100 text-red-700 border-red-300'
  if (c.includes('TS')) return 'bg-orange-100 text-orange-700 border-orange-300'
  return 'bg-yellow-100 text-yellow-700 border-yellow-300'
}
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-xl">🌀</span>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Bão đang hoạt động (Tây Thái Bình Dương)</h3>
    </div>

    <div v-if="busy" class="space-y-2">
      <div v-for="i in 2" :key="i" class="h-20 bg-gray-100 rounded-xl animate-pulse" />
    </div>
    <div v-else-if="err" class="text-sm text-red-500">{{ err }}</div>
    <div v-else-if="!typhoons.length" class="text-sm text-gray-500 py-2">
      🌤️ Hiện không có bão hoạt động trong khu vực.
    </div>
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="t in typhoons"
        :key="t.id"
        class="border rounded-xl p-3 flex items-center gap-3"
        :class="sevClass(t.category)"
      >
        <div class="text-3xl">🌀</div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="font-bold text-sm">{{ t.name }}</span>
            <span v-if="t.nameJa" class="text-xs opacity-70">({{ t.nameJa }})</span>
            <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/60">{{ t.category }}</span>
          </div>
          <div class="text-xs space-y-0.5 opacity-90">
            <div>📍 {{ t.distanceKm.toLocaleString() }} km — {{ t.lat.toFixed(1) }}°, {{ t.lon.toFixed(1) }}°</div>
            <div v-if="t.windKmh || t.pressure" class="flex gap-3">
              <span v-if="t.windKmh">💨 {{ t.windKmh }} km/h</span>
              <span v-if="t.pressure">⏱ {{ t.pressure }} hPa</span>
            </div>
            <div class="opacity-60">🕐 {{ fDateTime(t.time) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
