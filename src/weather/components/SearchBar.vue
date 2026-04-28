<script setup lang="ts">
import type { GeoLocation } from '../types'

defineProps<{
  q: string
  sugs: GeoLocation[]
  showS: boolean
  busy: boolean
}>()

const emit = defineEmits<{
  (e: 'update:q', v: string): void
  (e: 'input'): void
  (e: 'search'): void
  (e: 'blur'): void
  (e: 'focus'): void
  (e: 'pick', loc: GeoLocation): void
}>()
</script>

<template>
  <div class="relative mb-4">
    <div class="flex gap-2">
      <input
        :value="q"
        type="text"
        placeholder="Tìm thành phố... (Hà Nội, Tokyo...)"
        class="flex-1 px-4 py-3 rounded-2xl bg-white/90 text-slate-800 text-base outline-none shadow-lg focus:bg-white focus:shadow-xl transition-shadow"
        @input="e => { emit('update:q', (e.target as HTMLInputElement).value); emit('input') }"
        @keyup.enter="emit('search')"
        @blur="emit('blur')"
        @focus="emit('focus')"
      />
      <button
        class="px-4 py-3 rounded-2xl bg-white/90 text-lg shadow-lg transition-transform hover:bg-white hover:scale-105 disabled:opacity-55 disabled:cursor-not-allowed"
        :disabled="busy"
        @click="emit('search')"
      >
        <span v-if="busy" class="inline-block animate-spin-slow">⏳</span>
        <span v-else>🔍</span>
      </button>
    </div>

    <transition name="fade">
      <ul
        v-if="showS && sugs.length"
        class="absolute top-[calc(100%+6px)] left-0 right-14 bg-white rounded-2xl shadow-2xl list-none m-0 py-1 z-50 overflow-hidden"
      >
        <li
          v-for="s in sugs"
          :key="s.id"
          class="px-4 py-2.5 cursor-pointer text-sm text-slate-800 hover:bg-slate-100 transition-colors"
          @mousedown.prevent="emit('pick', s)"
        >
          📍 <strong>{{ s.name }}</strong>
          <small v-if="s.admin1" class="text-slate-500">, {{ s.admin1 }}</small>
          <small class="text-slate-500">, {{ s.country }}</small>
        </li>
      </ul>
    </transition>
  </div>
</template>
