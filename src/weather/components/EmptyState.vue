<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { GeoLocation } from '../types'
import { useGeocoding } from '../composables/useGeocoding'
import { useFavorites } from '../composables/useFavorites'
import { usePopularCities, detectDefaultLocation } from '../composables/useDynamicLocations'

const emit = defineEmits<{ (e: 'pick', loc: GeoLocation): void }>()

const { getUserLocation } = useGeocoding()
const { favorites, toggleFavorite } = useFavorites()
const { cities: quickCities, load: loadQuickCities } = usePopularCities()
const autoLocating = ref(true)
const errorMsg = ref('')

onMounted(async () => {
  // Song song: tự định vị + tải danh sách gợi ý nhanh theo quốc gia của người dùng
  detectDefaultLocation()
    .then((d) => loadQuickCities(d.country))
    .catch(() => { /* fallback: không có gợi ý nhanh */ })
  await handleAutoLocate()
})

async function handleAutoLocate() {
  autoLocating.value = true
  errorMsg.value = ''
  try {
    const loc = await getUserLocation()
    emit('pick', loc)
  } catch (e) {
    autoLocating.value = false
    errorMsg.value = 'Không thể lấy vị trí. Vui lòng kiểm tra quyền truy cập hoặc chọn thủ công.'
  }
}
</script>

<template>
  <div class="text-center py-12 px-4 bg-white border border-gray-200 rounded-2xl shadow-sm my-8 mx-auto max-w-2xl">
    <div class="text-7xl mb-8">🌍</div>
    
    <div v-if="autoLocating" class="mb-6 flex flex-col items-center justify-center">
      <svg class="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="text-lg font-medium text-gray-800">Đang lấy vị trí hiện tại của bạn...</p>
      <p class="text-sm text-gray-500 mt-2">Vui lòng cấp quyền truy cập vị trí khi trình duyệt yêu cầu.</p>
    </div>

    <div v-else>
      <p class="text-lg mb-6 font-medium text-gray-800">Nhập tên thành phố để xem dự báo thời tiết</p>
      
      <button
        @click="handleAutoLocate"
        class="mb-6 inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95"
      >
        <span>📍</span> Sử dụng vị trí hiện tại
      </button>

      <div v-if="errorMsg" class="text-red-600 text-sm mb-6 bg-red-50 py-2 px-4 rounded-lg inline-block border border-red-100">
        {{ errorMsg }}
      </div>

      <div v-if="favorites.length" class="mb-6">
        <div class="text-sm text-gray-400 mb-3 uppercase tracking-wider font-bold">⭐ Địa điểm yêu thích</div>
        <div class="flex gap-2.5 justify-center flex-wrap">
          <div
            v-for="f in favorites"
            :key="f.id"
            class="group inline-flex items-center gap-1 border border-amber-200 rounded-xl bg-amber-50 text-sm font-medium text-amber-800 shadow-sm overflow-hidden"
          >
            <button
              class="pl-4 py-2 hover:bg-amber-100 transition-colors"
              @click="$emit('pick', f)"
            >{{ f.name }}</button>
            <button
              class="px-2 py-2 text-amber-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Bỏ khỏi yêu thích"
              @click="toggleFavorite(f)"
            >✕</button>
          </div>
        </div>
      </div>

      <div v-if="quickCities.length" class="text-sm text-gray-400 mb-4 uppercase tracking-wider font-bold">Hoặc chọn nhanh</div>
      <div v-if="quickCities.length" class="flex gap-2.5 justify-center flex-wrap">
        <button
          v-for="c in quickCities"
          :key="c.id"
          class="px-5 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm"
          @click="$emit('pick', c)"
        >{{ c.name }}</button>
      </div>
    </div>
  </div>
</template>
