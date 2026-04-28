<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, defineAsyncComponent } from 'vue'
import type { GeoLocation, TabId } from '../weather/types'
import { useGeocoding } from '../weather/composables/useGeocoding'
import { useWeather } from '../weather/composables/useWeather'
import { useEarthquakes } from '../weather/composables/useEarthquakes'
import { useAlerts } from '../weather/composables/useAlerts'
import { useHealth } from '../weather/composables/useHealth'
import { useNotifications } from '../weather/composables/useNotifications'
import { useHistorical } from '../weather/composables/useHistorical'
import { useTyphoons } from '../weather/composables/useTyphoons'
import { usePullToRefresh } from '../weather/composables/usePullToRefresh'

import SearchBar from '../weather/components/SearchBar.vue'
import LocationBar from '../weather/components/LocationBar.vue'
import TabsNav from '../weather/components/TabsNav.vue'
import AlertsBanner from '../weather/components/AlertsBanner.vue'
import EmptyState from '../weather/components/EmptyState.vue'
import SettingsMenu from '../weather/components/SettingsMenu.vue'
import InstallButton from '../weather/components/InstallButton.vue'
import TabSkeleton from '../weather/components/TabSkeleton.vue'

// TodayTab is the default — loaded eagerly
import TodayTab from '../weather/components/tabs/TodayTab.vue'

// Other tabs are lazy-loaded on demand (chart.js, swiper, iframes are heavy)
const HourlyTab     = defineAsyncComponent(() => import('../weather/components/tabs/HourlyTab.vue'))
const DailyTab      = defineAsyncComponent(() => import('../weather/components/tabs/DailyTab.vue'))
const AirQualityTab = defineAsyncComponent(() => import('../weather/components/tabs/AirQualityTab.vue'))
const AlertsTab     = defineAsyncComponent(() => import('../weather/components/tabs/AlertsTab.vue'))
const HealthTab     = defineAsyncComponent(() => import('../weather/components/tabs/HealthTab.vue'))
const NewsTab       = defineAsyncComponent(() => import('../weather/components/tabs/NewsTab.vue'))
const WindMapTab    = defineAsyncComponent(() => import('../weather/components/tabs/WindMapTab.vue'))
const WidgetTab     = defineAsyncComponent(() => import('../weather/components/tabs/WidgetTab.vue'))

const sel = ref<GeoLocation | null>(null)
const tab = ref<TabId>('today')

const geo = useGeocoding()
const { wx, aqd, busy, err, load, bgGrad, curIdx, todayHourly, hourlyList } = useWeather()
const { quakes, busy: quakesBusy, err: quakesErr, load: loadQuakes } = useEarthquakes()
const alerts = useAlerts(wx, aqd, quakes)
const { healthIndices } = useHealth(wx, aqd)
const notify = useNotifications()
const history = useHistorical()
const { typhoons, busy: typhoonsBusy, err: typhoonsErr, load: loadTyphoons } = useTyphoons()

function runNotifyCheck() {
  if (!sel.value) return
  notify.check(wx.value, aqd.value, quakes.value, sel.value.name)
}

watch([wx, aqd, quakes], runNotifyCheck, { deep: true })
watch(() => notify.enabled.value, v => { if (v) runNotifyCheck() })

let refreshTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  refreshTimer = setInterval(() => {
    if (sel.value) {
      load(sel.value.latitude, sel.value.longitude)
      loadQuakes(sel.value.latitude, sel.value.longitude)
    }
  }, 15 * 60 * 1000)
})
onBeforeUnmount(() => { if (refreshTimer) clearInterval(refreshTimer) })

async function pick(loc: GeoLocation) {
  sel.value = loc
  geo.setLabel(loc)
  tab.value = 'today'
  await Promise.all([
    load(loc.latitude, loc.longitude),
    loadQuakes(loc.latitude, loc.longitude),
    loadTyphoons(loc.latitude, loc.longitude),
  ])
  // Fire historical comparison after weather is in
  if (wx.value?.daily?.temperature_2m_max?.[0] != null) {
    history.load(loc.latitude, loc.longitude, wx.value.daily.temperature_2m_max[0])
  }
}

async function refresh() {
  if (!sel.value) return
  await Promise.all([
    load(sel.value.latitude, sel.value.longitude),
    loadQuakes(sel.value.latitude, sel.value.longitude),
    loadTyphoons(sel.value.latitude, sel.value.longitude),
  ])
  if (wx.value?.daily?.temperature_2m_max?.[0] != null) {
    history.load(sel.value.latitude, sel.value.longitude, wx.value.daily.temperature_2m_max[0])
  }
}

const { pullDistance, refreshing } = usePullToRefresh(refresh)

// Refresh earthquakes silently when switching to the alerts tab after 5+ minutes.
let lastQuakeLoad = 0
watch(tab, t => {
  if (t === 'alerts' && sel.value && Date.now() - lastQuakeLoad > 5 * 60 * 1000) {
    lastQuakeLoad = Date.now()
    loadQuakes(sel.value.latitude, sel.value.longitude)
  }
})

// Share link: auto-load location from ?lat&lon&name URL params
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const lat = Number(params.get('lat'))
  const lon = Number(params.get('lon'))
  const name = params.get('name')
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0) {
    pick({
      id: Date.now(),
      name: name || 'Vị trí',
      latitude: lat,
      longitude: lon,
      country: '',
    })
  }
})
</script>

<template>
  <div
    class="min-h-screen px-4 py-5 pb-12 transition-[background] duration-700 text-white relative"
    :style="{ background: bgGrad }"
  >
    <!-- Pull-to-refresh indicator -->
    <div
      v-if="pullDistance > 0 || refreshing"
      class="absolute left-0 right-0 top-0 flex items-center justify-center text-white text-xs pointer-events-none z-40"
      :style="{ height: Math.min(pullDistance, 80) + 'px', opacity: Math.min(pullDistance / 80, 1) }"
    >
      <span v-if="refreshing" class="animate-spin">🔄</span>
      <span v-else>{{ pullDistance >= 80 ? '↻ Thả để làm mới' : '↓ Kéo xuống để làm mới' }}</span>
    </div>

    <div class="max-w-3xl mx-auto" :style="{ transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance, 80)}px)` : 'none', transition: pullDistance > 0 ? 'none' : 'transform 0.2s' }">
      <header class="flex items-center justify-between mb-6 gap-2">
        <InstallButton />
        <h1 class="text-xl sm:text-2xl md:text-3xl font-bold m-0 drop-shadow-lg text-center flex-1">🌤 Dự Báo Thời Tiết</h1>
        <button
          v-if="wx"
          @click="refresh"
          :disabled="busy"
          class="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm flex items-center justify-center transition-colors disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <span :class="busy ? 'animate-spin' : ''">🔄</span>
        </button>
        <SettingsMenu />
      </header>

      <SearchBar
        :q="geo.q.value"
        :sugs="geo.sugs.value"
        :show-s="geo.showS.value"
        :busy="geo.busy.value"
        @update:q="v => geo.q.value = v"
        @input="geo.onInput"
        @search="geo.search"
        @blur="geo.hide"
        @focus="geo.reveal"
        @pick="pick"
      />

      <div v-if="err" class="bg-red-500/15 border border-red-500/40 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm flex items-center justify-between gap-3">
        <span>⚠️ {{ err }}</span>
        <button @click="refresh" class="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-xs font-semibold">Thử lại</button>
      </div>

      <EmptyState v-if="!wx && !busy && !err" @pick="pick" />
      <TabSkeleton v-if="busy && !wx" variant="today" />

      <div v-if="wx && sel">
        <LocationBar :loc="sel" :timezone="wx.timezone" />
        <AlertsBanner :alerts="alerts.slice(0, 2)" />
        <TabsNav v-model="tab" :alert-count="alerts.length" />

        <Suspense>
          <template #default>
            <div>
              <TodayTab v-if="tab === 'today'" :wx="wx" :aqd="aqd" :today-hourly="todayHourly" :history="history.data.value" :history-busy="history.busy.value" />
              <HourlyTab      v-else-if="tab === 'hourly'" :wx="wx" :hourly-list="hourlyList" :cur-idx="curIdx" />
              <DailyTab       v-else-if="tab === 'week'"   :wx="wx" :days="7" />
              <DailyTab       v-else-if="tab === 'daily'"  :wx="wx" :days="16" />
              <DailyTab       v-else-if="tab === 'month'"  :wx="wx" :days="30" />
              <AirQualityTab  v-else-if="tab === 'aqi'"    :aqd="aqd" />
              <HealthTab      v-else-if="tab === 'health'" :indices="healthIndices" />
              <WindMapTab     v-else-if="tab === 'wind'"   :lat="sel.latitude" :lon="sel.longitude" />
              <AlertsTab
                v-else-if="tab === 'alerts'"
                :alerts="alerts"
                :quakes="quakes"
                :quakes-busy="quakesBusy"
                :quakes-err="quakesErr"
                :typhoons="typhoons"
                :typhoons-busy="typhoonsBusy"
                :typhoons-err="typhoonsErr"
              />
              <NewsTab        v-else-if="tab === 'news'" />
              <WidgetTab      v-else-if="tab === 'widget'" />
            </div>
          </template>
          <template #fallback>
            <TabSkeleton variant="chart" />
          </template>
        </Suspense>
      </div>
    </div>
  </div>
</template>
