<script setup lang="ts">
import type { WeatherAlert } from '../types'

defineProps<{ alerts: WeatherAlert[] }>()

const palette = {
  danger:  'bg-red-500/15 border-red-500/45 text-red-200',
  warning: 'bg-amber-500/15 border-amber-500/45 text-amber-100',
  info:    'bg-sky-500/15 border-sky-500/45 text-sky-100',
}
</script>

<template>
  <div v-if="alerts.length" class="flex flex-col gap-2 mb-3">
    <div
      v-for="(a, i) in alerts"
      :key="i"
      class="flex items-start gap-3 border rounded-xl px-4 py-3"
      :class="palette[a.level]"
    >
      <span class="text-2xl leading-none shrink-0">{{ a.icon }}</span>
      <div class="flex-1">
        <div class="font-semibold text-sm">{{ a.title }}</div>
        <div class="text-xs opacity-90 mt-0.5">{{ a.message }}</div>
      </div>
    </div>
  </div>
</template>
