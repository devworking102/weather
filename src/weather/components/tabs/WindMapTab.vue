<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  lat?: number
  lon?: number
}>()

const iframeSrc = computed(() => {
  // Mặc định hiển thị miền Trung Việt Nam nếu không có tọa độ
  const latitude = props.lat ?? 16.0544
  const longitude = props.lon ?? 108.2022
  
  return `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=6&overlay=wind&product=ecmwf&level=surface&lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&marker=true`
})
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-4">
    <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
      <span class="text-xl">🗺️</span>
      <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Bản đồ Gió & Thời tiết trực tiếp</h3>
    </div>
    
    <!-- Vùng chứa bản đồ Windy -->
    <div class="p-0 w-full h-[550px] sm:h-[650px] bg-gray-100">
      <iframe :src="iframeSrc" class="w-full h-full" frameborder="0" allowfullscreen></iframe>
    </div>
  </div>
</template>