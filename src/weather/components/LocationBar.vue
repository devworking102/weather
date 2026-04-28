<script setup lang="ts">
import type { GeoLocation } from '../types'
import { useFavorites } from '../composables/useFavorites'

const props = defineProps<{ loc: GeoLocation; timezone: string }>()
const { isFavorite, toggleFavorite } = useFavorites()

function share() {
  const url = new URL(window.location.href)
  url.searchParams.set('lat', String(props.loc.latitude))
  url.searchParams.set('lon', String(props.loc.longitude))
  url.searchParams.set('name', props.loc.name)
  navigator.clipboard.writeText(url.toString())
    .then(() => alert('Đã sao chép link chia sẻ địa điểm!'))
    .catch(() => prompt('Sao chép link:', url.toString()))
}
</script>

<template>
  <div class="flex justify-between items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 mb-3 text-sm gap-2">
    <span class="truncate">
      📍 <strong>{{ loc.name }}</strong><span v-if="loc.admin1">, {{ loc.admin1 }}</span><span v-if="loc.country">, {{ loc.country }}</span>
    </span>
    <div class="flex items-center gap-2 shrink-0">
      <button
        @click="toggleFavorite(loc)"
        :title="isFavorite(loc) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'"
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors"
      >
        <span class="text-base">{{ isFavorite(loc) ? '⭐' : '☆' }}</span>
      </button>
      <button
        @click="share"
        title="Chia sẻ link địa điểm"
        class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-colors"
      >
        <span class="text-sm">🔗</span>
      </button>
      <span class="text-xs opacity-65 ml-1">{{ timezone }}</span>
    </div>
  </div>
</template>
