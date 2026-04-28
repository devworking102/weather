<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { useSettings } from '../composables/useSettings'
import { useNotifications } from '../composables/useNotifications'

const { settings, setTheme, setTempUnit, setWindUnit } = useSettings()
const { enabled: notifyEnabled, permission, request, disable } = useNotifications()
const open = ref(false)
const panel = ref<HTMLElement | null>(null)

function toggle() { open.value = !open.value }
function close(e: MouseEvent) {
  if (panel.value && !panel.value.contains(e.target as Node)) open.value = false
}

async function toggleNotify() {
  if (notifyEnabled.value) {
    disable()
    return
  }
  if (permission.value === 'granted') {
    notifyEnabled.value = true
  } else {
    await request()
  }
}

onMounted(() => document.addEventListener('click', close))
onBeforeUnmount(() => document.removeEventListener('click', close))
</script>

<template>
  <div ref="panel" class="relative">
    <button
      @click.stop="toggle"
      class="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm flex items-center justify-center transition-colors"
      aria-label="Cài đặt"
    >
      <span class="text-lg">⚙️</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 top-12 w-64 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-4 z-40"
    >
      <div class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Giao diện</div>
      <div class="grid grid-cols-3 gap-1.5 mb-4">
        <button
          v-for="t in (['light','dark','auto'] as const)"
          :key="t"
          @click="setTheme(t)"
          class="px-2 py-1.5 text-xs rounded-lg border transition-colors"
          :class="settings.theme === t
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'"
        >
          {{ t === 'light' ? '☀️ Sáng' : t === 'dark' ? '🌙 Tối' : '🖥️ Tự động' }}
        </button>
      </div>

      <div class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Nhiệt độ</div>
      <div class="grid grid-cols-2 gap-1.5 mb-4">
        <button
          v-for="u in (['celsius','fahrenheit'] as const)"
          :key="u"
          @click="setTempUnit(u)"
          class="px-2 py-1.5 text-xs rounded-lg border transition-colors"
          :class="settings.tempUnit === u
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'"
        >
          {{ u === 'celsius' ? '°C' : '°F' }}
        </button>
      </div>

      <div class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Tốc độ gió</div>
      <div class="grid grid-cols-3 gap-1.5 mb-4">
        <button
          v-for="u in (['kmh','mph','ms'] as const)"
          :key="u"
          @click="setWindUnit(u)"
          class="px-2 py-1.5 text-xs rounded-lg border transition-colors"
          :class="settings.windUnit === u
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600'"
        >
          {{ u === 'kmh' ? 'km/h' : u === 'mph' ? 'mph' : 'm/s' }}
        </button>
      </div>

      <div class="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">Thông báo cảnh báo</div>
      <button
        @click="toggleNotify"
        :disabled="permission === 'unsupported' || permission === 'denied'"
        class="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs transition-colors"
        :class="notifyEnabled
          ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
          : 'bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed'"
      >
        <span class="flex items-center gap-2 font-semibold">
          <span>{{ notifyEnabled ? '🔔' : '🔕' }}</span>
          <span>{{ notifyEnabled ? 'Đang bật' : 'Bật cảnh báo' }}</span>
        </span>
        <span class="text-[10px] opacity-70">
          {{ permission === 'unsupported' ? 'Không hỗ trợ' : permission === 'denied' ? 'Đã chặn' : '' }}
        </span>
      </button>
      <p v-if="notifyEnabled" class="text-[10px] text-gray-500 dark:text-gray-400 mt-2 leading-snug">
        Cảnh báo mưa, giông, gió mạnh, AQI xấu, UV cao, động đất. Chỉ hoạt động khi app đang mở.
      </p>
      <p v-else-if="permission === 'denied'" class="text-[10px] text-red-500 mt-2 leading-snug">
        Bạn đã chặn thông báo. Vào cài đặt trình duyệt để bật lại.
      </p>
    </div>
  </div>
</template>
