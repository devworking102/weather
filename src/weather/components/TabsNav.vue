<script setup lang="ts">
import type { TabId } from '../types'
import { TABS } from '../constants'

defineProps<{ modelValue: TabId; alertCount?: number }>()
defineEmits<{ (e: 'update:modelValue', v: TabId): void }>()
</script>

<template>
  <nav class="flex gap-1.5 mb-4 flex-wrap">
    <button
      v-for="t in TABS"
      :key="t.id"
      class="relative px-4 py-2 rounded-full border text-sm font-medium backdrop-blur-sm transition-colors"
      :class="modelValue === t.id
        ? 'bg-white/25 text-white border-white/55 shadow'
        : 'bg-white/10 text-white/75 border-white/25 hover:bg-white/20 hover:text-white'"
      @click="$emit('update:modelValue', t.id)"
    >
      {{ t.label }}
      <span
        v-if="t.id === 'alerts' && alertCount"
        class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1"
      >{{ alertCount }}</span>
    </button>
  </nav>
</template>
