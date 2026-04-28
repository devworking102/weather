<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const deferredPrompt = ref<BIPEvent | null>(null)
const installed = ref(false)
const showHint = ref<'ios' | 'android' | null>(null)

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''
const isIos = computed(() => /iphone|ipad|ipod/i.test(ua))
const isAndroid = computed(() => /android/i.test(ua))
const isMobile = computed(() => isIos.value || isAndroid.value || /mobile/i.test(ua))

const isStandalone = computed(() =>
  window.matchMedia('(display-mode: standalone)').matches ||
  // @ts-ignore iOS
  window.navigator.standalone === true
)

function onPrompt(e: Event) {
  e.preventDefault()
  deferredPrompt.value = e as BIPEvent
}

function onInstalled() {
  installed.value = true
  deferredPrompt.value = null
}

async function install() {
  if (deferredPrompt.value) {
    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') installed.value = true
    deferredPrompt.value = null
    return
  }
  if (isIos.value) { showHint.value = 'ios'; return }
  if (isAndroid.value) { showHint.value = 'android'; return }
  showHint.value = 'android'
}

const canShow = computed(() => {
  if (isStandalone.value || installed.value) return false
  return !!deferredPrompt.value || isMobile.value
})

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onPrompt)
  window.addEventListener('appinstalled', onInstalled)
})
onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onPrompt)
  window.removeEventListener('appinstalled', onInstalled)
})
</script>

<template>
  <button
    v-if="canShow"
    @click="install"
    class="h-10 px-3 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm flex items-center gap-1.5 transition-colors text-sm font-semibold shrink-0"
    title="Cài app lên màn hình chính"
  >
    <span class="text-base">📲</span>
    <span class="hidden sm:inline">Cài app</span>
  </button>

  <div
    v-if="showHint"
    class="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
    @click.self="showHint = null"
  >
    <div class="bg-white text-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <template v-if="showHint === 'ios'">
        <h3 class="text-lg font-bold mb-3 flex items-center gap-2">📲 Cài trên iPhone / iPad</h3>
        <ol class="text-sm space-y-2 leading-relaxed list-decimal list-inside">
          <li>Mở menu <strong>Chia sẻ</strong> của Safari (nút ⬆️ ở thanh công cụ).</li>
          <li>Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính"</strong>.</li>
          <li>Chạm <strong>"Thêm"</strong> để hoàn tất.</li>
        </ol>
        <p class="text-xs text-gray-500 mt-3">Lưu ý: phải mở bằng Safari (không dùng Chrome trên iOS).</p>
      </template>

      <template v-else>
        <h3 class="text-lg font-bold mb-3 flex items-center gap-2">📲 Cài trên Android</h3>
        <ol class="text-sm space-y-2 leading-relaxed list-decimal list-inside">
          <li>Mở menu <strong>⋮</strong> ở góc trên bên phải trình duyệt.</li>
          <li>Chọn <strong>"Cài ứng dụng"</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.</li>
          <li>Xác nhận để cài.</li>
        </ol>
        <p class="text-xs text-gray-500 mt-3">
          Nếu không thấy tùy chọn này, hãy dùng <strong>Chrome</strong> hoặc <strong>Edge</strong> mới nhất và đảm bảo trang đang chạy qua HTTPS.
        </p>
      </template>

      <button
        @click="showHint = null"
        class="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700"
      >Đã hiểu</button>
    </div>
  </div>
</template>
