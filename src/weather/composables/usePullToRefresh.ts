import { onMounted, onBeforeUnmount, ref } from 'vue'

/**
 * Pull-to-refresh gesture for mobile. Triggers `onRefresh` when user pulls down
 * from the top of the page past the threshold. Disabled on non-touch devices.
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>, threshold = 80) {
  const pullDistance = ref(0)
  const refreshing = ref(false)

  let startY = 0
  let pulling = false

  function onStart(e: TouchEvent) {
    if (window.scrollY > 0 || refreshing.value) return
    startY = e.touches[0].clientY
    pulling = true
  }

  function onMove(e: TouchEvent) {
    if (!pulling) return
    const dy = e.touches[0].clientY - startY
    if (dy > 0) {
      pullDistance.value = Math.min(dy, threshold * 1.6)
      if (dy > 10) e.preventDefault()
    }
  }

  async function onEnd() {
    if (!pulling) return
    pulling = false
    if (pullDistance.value >= threshold) {
      refreshing.value = true
      try { await onRefresh() } finally {
        refreshing.value = false
      }
    }
    pullDistance.value = 0
  }

  onMounted(() => {
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
  })
  onBeforeUnmount(() => {
    window.removeEventListener('touchstart', onStart)
    window.removeEventListener('touchmove', onMove)
    window.removeEventListener('touchend', onEnd)
    window.removeEventListener('touchcancel', onEnd)
  })

  return { pullDistance, refreshing }
}
