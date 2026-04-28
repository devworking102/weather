<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useGeocoding } from '../../composables/useGeocoding'
import type { GeoLocation } from '../../types'

const { q, sugs, showS, busy: searchBusy, onInput, setLabel } = useGeocoding()
const selectedLoc = ref<GeoLocation>({
  id: 1, name: 'Hà Nội', latitude: 21.0285, longitude: 105.8542, country: 'Việt Nam'
})

const width = ref(340)
const theme = ref<'light' | 'dark'>('light')
const iframeKey = ref(0)

function selectLocation(loc: GeoLocation) {
  selectedLoc.value = loc
  setLabel(loc)
}

const embedUrl = computed(() => {
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}?embed=true&lat=${selectedLoc.value.latitude}&lon=${selectedLoc.value.longitude}&name=${encodeURIComponent(selectedLoc.value.name)}&theme=${theme.value}`
})

const iframeCode = computed(() => {
  return `<iframe src="${embedUrl.value}" width="${width.value}" height="100%" frameborder="0" scrolling="no" style="border-radius: 16px; overflow: hidden;"></iframe>`
})

watch(embedUrl, () => { iframeKey.value++ }) // Tải lại Iframe khi đổi cấu hình

function copyCode() {
  navigator.clipboard.writeText(iframeCode.value)
  alert('Đã sao chép mã nhúng thành công! Hãy dán vào website của bạn.')
}
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Cột Cấu Hình -->
    <div class="w-full lg:w-1/2 flex flex-col gap-6">
      <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><span class="text-2xl">⚙️</span> Cấu hình mã nhúng</h2>
        
        <div class="flex flex-col gap-5">
          <div class="relative">
            <label class="block text-sm font-bold text-gray-700 mb-2">1. Tìm địa điểm</label>
            <div class="relative flex items-center shadow-sm rounded-xl bg-gray-50 border border-gray-200">
              <span class="absolute left-3 text-lg text-gray-400">🔍</span>
              <input v-model="q" @input="onInput" type="text" placeholder="Nhập tên thành phố..." class="w-full bg-transparent py-3 pl-10 pr-10 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl" />
              <div v-if="searchBusy" class="absolute right-3"><svg class="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>
            </div>
            <div v-if="showS" class="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <button v-for="s in sugs" :key="s.id" @click="selectLocation(s)" class="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex flex-col">
                <span class="font-bold text-gray-800">{{ s.name }}</span>
                <span class="text-xs text-gray-500">{{ s.admin1 ? s.admin1 + ', ' : '' }}{{ s.country }}</span>
              </button>
            </div>
            <p class="text-sm text-gray-500 mt-2">Vị trí hiện tại: <strong class="text-blue-600">{{ selectedLoc.name }}</strong></p>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">2. Chọn Giao diện</label>
            <div class="flex gap-3">
              <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer border px-4 py-2.5 rounded-xl transition-all" :class="theme === 'light' ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50'">
                <input type="radio" v-model="theme" value="light" class="hidden" /><span class="text-xl">☀️</span> <span class="font-semibold text-sm">Sáng</span>
              </label>
              <label class="flex-1 flex items-center justify-center gap-2 cursor-pointer border px-4 py-2.5 rounded-xl transition-all bg-gray-900 text-white" :class="theme === 'dark' ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-800 hover:bg-gray-800'">
                <input type="radio" v-model="theme" value="dark" class="hidden" /><span class="text-xl">🌙</span> <span class="font-semibold text-sm">Tối</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">3. Độ rộng Widget (px)</label>
            <input type="number" v-model="width" min="250" max="800" class="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm" />
          </div>
        </div>
      </div>

      <div class="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm">Mã HTML (Iframe)</h3>
          <button @click="copyCode" class="text-xs bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-bold transition-colors active:scale-95 shadow-md">📋 Copy Code</button>
        </div>
        <textarea readonly :value="iframeCode" class="w-full bg-black border border-slate-700 rounded-xl p-4 text-xs font-mono text-emerald-400 h-32 focus:outline-none resize-none leading-relaxed"></textarea>
      </div>
    </div>

    <!-- Cột Xem Trước (Preview) -->
    <div class="w-full lg:w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gray-100 border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-x-auto" style="min-h: 500px;">
      <h3 class="absolute top-5 left-6 text-sm font-bold text-gray-400 uppercase tracking-widest bg-white/80 px-3 py-1 rounded-md backdrop-blur-sm">Xem trước (Preview)</h3>
      <div class="shadow-2xl rounded-[16px] overflow-hidden transition-all duration-300 bg-white ring-1 ring-gray-900/5 mt-8" :style="{ width: width + 'px', height: '300px' }">
        <iframe :key="iframeKey" :src="embedUrl" class="w-full h-full bg-transparent" frameborder="0" scrolling="no"></iframe>
      </div>
    </div>
  </div>
</template>