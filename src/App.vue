<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, defineAsyncComponent } from 'vue'
import GlobalHeader from './components/GlobalHeader.vue'
import CalendarView from './components/CalendarView.vue'
import WidgetEmbed from './weather/components/WidgetEmbed.vue'
import SettingsMenu from './weather/components/SettingsMenu.vue'
import InstallButton from './weather/components/InstallButton.vue'
import TabSkeleton from './weather/components/TabSkeleton.vue'

// TodayTab is default (eager). Other tabs lazy-load on demand.
import TodayTab from './weather/components/tabs/TodayTab.vue'
import Recommendations from './weather/components/Recommendations.vue'

const HourlyTab     = defineAsyncComponent(() => import('./weather/components/tabs/HourlyTab.vue'))
const DailyTab      = defineAsyncComponent(() => import('./weather/components/tabs/DailyTab.vue'))
const AirQualityTab = defineAsyncComponent(() => import('./weather/components/tabs/AirQualityTab.vue'))
const HealthTab     = defineAsyncComponent(() => import('./weather/components/tabs/HealthTab.vue'))
const AlertsTab     = defineAsyncComponent(() => import('./weather/components/tabs/AlertsTab.vue'))
const NewsTab       = defineAsyncComponent(() => import('./weather/components/tabs/NewsTab.vue'))
const WindMapTab    = defineAsyncComponent(() => import('./weather/components/tabs/WindMapTab.vue'))
const WidgetTab     = defineAsyncComponent(() => import('./weather/components/tabs/WidgetTab.vue'))

// Import logic Geocoding (Tìm kiếm & Định vị)
import { useGeocoding } from './weather/composables/useGeocoding'
import { useWeather } from './weather/composables/useWeather'
import { useEarthquakes } from './weather/composables/useEarthquakes'
import { useHealth } from './weather/composables/useHealth'
import { useAlerts } from './weather/composables/useAlerts'
import { useFavorites } from './weather/composables/useFavorites'
import { useNotifications } from './weather/composables/useNotifications'
import { useHistorical } from './weather/composables/useHistorical'
import { useTyphoons } from './weather/composables/useTyphoons'
import { usePullToRefresh } from './weather/composables/usePullToRefresh'
import { detectDefaultLocation, upgradeLocationName } from './weather/composables/useDynamicLocations'
import type { GeoLocation } from './weather/types'

// State quản lý điều hướng Website
const globalTab = ref<'weather' | 'map' | 'news' | 'calendar' | 'widget'>('weather')
const activeWeatherTab = ref<string>('today')

// State dữ liệu người dùng
const currentLocation = ref<GeoLocation | null>(null)
const locating = ref(false)
const { q, sugs, showS, busy: searchBusy, onInput, setLabel, getUserLocation } = useGeocoding()
const { favorites, isFavorite, toggleFavorite } = useFavorites()

// Khởi tạo các Composable tải dữ liệu thời tiết
const { wx, aqd, busy: weatherBusy, err: weatherErr, load: loadWeather, curIdx, todayHourly, hourlyList } = useWeather()
const { quakes, busy: quakesBusy, err: quakesErr, load: loadQuakes } = useEarthquakes()
const alerts = useAlerts(wx, aqd, quakes)
const { healthIndices } = useHealth(wx, aqd)
const notify = useNotifications()
const history = useHistorical()
const { typhoons, busy: typhoonsBusy, err: typhoonsErr, load: loadTyphoons } = useTyphoons()

async function selectLocation(loc: GeoLocation) {
  currentLocation.value = loc
  setLabel(loc)

  // Gọi song song API thời tiết, động đất, bão
  await Promise.all([
    loadWeather(loc.latitude, loc.longitude),
    loadQuakes(loc.latitude, loc.longitude),
    loadTyphoons(loc.latitude, loc.longitude),
  ])
  if (wx.value?.daily?.temperature_2m_max?.[0] != null) {
    history.load(loc.latitude, loc.longitude, wx.value.daily.temperature_2m_max[0])
  }
}

async function refreshAll() {
  if (!currentLocation.value) return
  await selectLocation(currentLocation.value)
}

const { pullDistance, refreshing } = usePullToRefresh(refreshAll)

// Notification check whenever data changes
function runNotifyCheck() {
  if (!currentLocation.value) return
  notify.check(wx.value, aqd.value, quakes.value, currentLocation.value.name)
}
watch([wx, aqd, quakes], runNotifyCheck, { deep: true })
watch(() => notify.enabled.value, v => { if (v) runNotifyCheck() })

// Auto-refresh every 15 min while tab is open
let refreshTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  refreshTimer = setInterval(() => { if (currentLocation.value) refreshAll() }, 15 * 60 * 1000)
})
onBeforeUnmount(() => { if (refreshTimer) clearInterval(refreshTimer) })

// Share link: auto-load ?lat&lon&name on mount
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const lat = Number(params.get('lat'))
  const lon = Number(params.get('lon'))
  const name = params.get('name')
  if (Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0) {
    selectLocation({
      id: Date.now(),
      name: name || 'Vị trí',
      latitude: lat,
      longitude: lon,
      country: '',
    })
  }
})

async function locateUser() {
  try {
    const loc = await getUserLocation()
    await selectLocation(loc)
  } catch (e) {
    alert('Không thể lấy vị trí. Vui lòng cấp quyền truy cập vị trí trong trình duyệt.')
  }
}

// Tự dò vị trí người dùng qua geolocation (4s timeout) + IP song song, sau đó
// upgrade tên chính xác (tiếng Việt) trong nền qua reverse geocode.
onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  if (params.get('lat') && params.get('lon')) return
  if (currentLocation.value) return
  locating.value = true
  try {
    const loc = await detectDefaultLocation()
    // Bắt đầu fetch thời tiết + upgrade tên song song
    const upgrade = upgradeLocationName(loc.latitude, loc.longitude).catch(() => null)
    await selectLocation(loc)
    const rev = await upgrade
    const cur = currentLocation.value as GeoLocation | null
    if (rev && cur && cur.latitude === loc.latitude) {
      const upgraded: GeoLocation = {
        ...cur,
        name: rev.city || cur.name,
        country: rev.country || cur.country,
        admin1: rev.admin1 ?? cur.admin1,
      }
      currentLocation.value = upgraded
      setLabel(upgraded)
    }
  } catch {
    // Không định vị được: người dùng có thể tìm kiếm / bấm nút định vị
  } finally {
    locating.value = false
  }
})

// Kiểm tra xem ứng dụng có đang bị nhúng dạng iframe không
const urlParams = new URLSearchParams(window.location.search)
const isEmbed = urlParams.get('embed') === 'true'
</script>

<template>
  <!-- Chế độ nhúng (Widget Iframe) -->
  <div v-if="isEmbed" class="h-screen">
    <WidgetEmbed />
  </div>
  <!-- Chế độ Website đầy đủ -->
  <div v-else class="min-h-screen bg-gray-50 text-gray-900 font-sans font-medium relative">
    <!-- Pull-to-refresh indicator -->
    <div
      v-if="pullDistance > 0 || refreshing"
      class="absolute left-0 right-0 top-0 flex items-center justify-center text-blue-600 text-xs pointer-events-none z-[60] bg-blue-50/80 backdrop-blur-sm"
      :style="{ height: Math.min(pullDistance, 80) + 'px', opacity: Math.min(pullDistance / 80, 1) }"
    >
      <span v-if="refreshing" class="animate-spin text-xl">🔄</span>
      <span v-else class="font-semibold">{{ pullDistance >= 80 ? '↻ Thả để làm mới' : '↓ Kéo xuống để làm mới' }}</span>
    </div>

    <!-- Thanh Menu Website Cố định -->
    <GlobalHeader
      :active-tab="globalTab"
      :active-weather-tab="activeWeatherTab"
      @change="t => globalTab = t"
      @change-weather-tab="t => activeWeatherTab = t"
    >
      <template #actions>
        <InstallButton />
        <button
          v-if="wx"
          @click="refreshAll"
          :disabled="weatherBusy"
          class="h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
          title="Làm mới dữ liệu"
        >
          <span :class="weatherBusy ? 'animate-spin' : ''">🔄</span>
        </button>
        <SettingsMenu />
      </template>
    </GlobalHeader>

    <!-- Nội dung chính của Website -->
    <main class="max-w-6xl mx-auto p-4 md:p-6 transition-all">
      
      <!-- TRANG 1: THỜI TIẾT TỔNG HỢP -->
      <div v-show="globalTab === 'weather'">
        
        <!-- Thanh Tìm Kiếm Vị Trí (Chỉ hiện ở trang Thời tiết) -->
        <div class="relative mx-auto mb-6 z-40">
          <div class="relative flex items-center shadow-sm rounded-full bg-white border border-gray-200">
            <span class="absolute left-5 text-2xl text-gray-400">🔍</span>
            <input 
              v-model="q" 
              @input="onInput"
              type="text" 
              placeholder="Tìm kiếm thành phố, quốc gia..." 
              class="w-full bg-transparent py-4 pl-14 pr-24 text-base sm:text-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full transition-all"
            />
            <div class="absolute right-2 flex items-center gap-1">
              <div v-if="searchBusy" class="mr-2">
                <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
              <button @click="locateUser" class="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Lấy vị trí của tôi">
                <span class="text-xl leading-none">📍</span>
              </button>
            </div>
          </div>
          
          <!-- Gợi ý Tìm kiếm -->
          <div v-if="showS" class="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <button 
              v-for="s in sugs" 
              :key="s.id"
              @click="selectLocation(s)"
              class="w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex flex-col"
            >
              <span class="font-bold text-lg text-gray-800">{{ s.name }}</span>
              <span class="text-sm text-gray-500 mt-0.5">{{ s.admin1 ? s.admin1 + ', ' : '' }}{{ s.country }}</span>
            </button>
          </div>

          <!-- Địa điểm yêu thích -->
          <div v-if="favorites.length > 0 && !showS" class="mt-4 flex flex-wrap items-center gap-2.5">
            <span class="text-sm font-bold text-gray-500">Yêu thích:</span>
            <button
              v-for="fav in favorites"
              :key="fav.id"
              @click="selectLocation(fav)"
              class="px-4 py-1.5 border border-gray-200 rounded-full bg-white text-sm font-medium text-gray-700 transition-all hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transform hover:scale-105"
            >
              {{ fav.name }}
            </button>
          </div>
        </div>

        <!-- Skeleton trong lúc đang tự động định vị (chưa có currentLocation) -->
        <div v-if="!currentLocation && locating" class="animate-fade-in">
          <div class="mb-6 flex flex-col sm:flex-row items-center justify-between p-5 sm:p-6 rounded-2xl shadow-lg gap-4 bg-gradient-to-r from-blue-600 to-sky-500">
            <div class="flex items-center gap-4 w-full">
              <div class="w-14 h-14 rounded-full shimmer hidden sm:block" />
              <div class="flex-1 space-y-3">
                <div class="h-8 shimmer rounded w-48" />
                <div class="h-4 shimmer rounded w-32" />
              </div>
            </div>
          </div>
          <TabSkeleton variant="today" />
          <p class="text-center text-sm text-gray-500 mt-4">Đang xác định vị trí của bạn…</p>
        </div>

        <!-- Trạng thái không định vị được -->
        <div v-else-if="!currentLocation && !locating" class="py-12 px-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-center">
          <div class="text-5xl mb-4">🌍</div>
          <p class="text-lg font-medium text-gray-800 mb-2">Chưa xác định được vị trí</p>
          <p class="text-sm text-gray-500 mb-4">Vui lòng tìm kiếm thành phố ở thanh trên, hoặc bấm nút định vị.</p>
          <button @click="locateUser" class="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95">
            <span>📍</span> Thử lại
          </button>
        </div>

        <!-- Cụm Dữ Liệu Thời Tiết -->
        <div v-if="currentLocation" class="animate-fade-in">
          <!-- Header Vị Trí Đang Xem -->
          <div class="mb-6 flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-600 to-sky-500 text-white p-5 sm:p-6 rounded-2xl shadow-lg gap-4">
            <div class="flex items-center gap-4 text-center sm:text-left">
              <div class="text-5xl sm:text-6xl drop-shadow-md hidden sm:block">📍</div>
              <div>
                <h2 class="text-3xl sm:text-4xl font-black">{{ currentLocation.name }}</h2>
                <p class="text-blue-100 mt-1.5 text-base font-medium">{{ currentLocation.admin1 ? currentLocation.admin1 + ', ' : '' }}{{ currentLocation.country }}</p>
              </div>
            </div>
            <button @click="toggleFavorite(currentLocation!)" class="p-3 rounded-full transition-colors shrink-0" :class="isFavorite(currentLocation) ? 'bg-yellow-400/20 text-yellow-300' : 'bg-white/10 hover:bg-white/20 text-white'" :title="isFavorite(currentLocation) ? 'Bỏ lưu' : 'Lưu địa điểm'">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>

          <!-- Trạng thái Đang tải -->
          <TabSkeleton v-if="weatherBusy && !wx" variant="today" />

          <!-- Retry UI khi lỗi -->
          <div v-else-if="weatherErr && !wx" class="py-6 px-4 bg-red-50 text-red-600 border border-red-200 rounded-xl mb-4 flex items-center justify-between gap-3 flex-wrap">
            <span class="font-medium">⚠️ Lỗi: {{ weatherErr }}</span>
            <button @click="refreshAll" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold shadow-sm">Thử lại</button>
          </div>

          <!-- Vị trí cắm các component Thời tiết thực tế (Chỉ hiện khi đã có wx) -->
          <div v-else-if="wx" class="mt-4">
            <Suspense>
              <template #default>
                <div>
                  <div v-if="activeWeatherTab === 'today'" class="animate-fade-in">
                    <TodayTab
                      :wx="wx"
                      :today-hourly="todayHourly"
                      :history="history.data.value"
                      :history-busy="history.busy.value"
                    />
                    <Recommendations :wx="wx" :loc="currentLocation" />
                  </div>

                  <div v-else-if="activeWeatherTab === 'hourly'" class="animate-fade-in">
                    <HourlyTab :wx="wx" :hourly-list="hourlyList" :cur-idx="curIdx" />
                  </div>

                  <div v-else-if="activeWeatherTab === 'week'" class="animate-fade-in">
                    <DailyTab :wx="wx" :days="7" />
                  </div>

                  <div v-else-if="activeWeatherTab === 'daily'" class="animate-fade-in">
                    <DailyTab :wx="wx" :days="16" />
                  </div>

                  <div v-else-if="activeWeatherTab === 'month'" class="animate-fade-in">
                    <DailyTab :wx="wx" :days="30" />
                  </div>

                  <div v-else-if="activeWeatherTab === 'aqi'" class="animate-fade-in">
                    <AirQualityTab :aqd="aqd" />
                  </div>

                  <div v-else-if="activeWeatherTab === 'alerts'" class="animate-fade-in">
                    <AlertsTab
                      :alerts="alerts"
                      :quakes="quakes"
                      :quakes-busy="quakesBusy"
                      :quakes-err="quakesErr"
                      :typhoons="typhoons"
                      :typhoons-busy="typhoonsBusy"
                      :typhoons-err="typhoonsErr"
                    />
                  </div>

                  <div v-else-if="activeWeatherTab === 'health'" class="animate-fade-in">
                    <HealthTab :indices="healthIndices" />
                  </div>
                </div>
              </template>
              <template #fallback>
                <TabSkeleton variant="chart" />
              </template>
            </Suspense>
          </div>
        </div>
      </div>

      <!-- TRANG 2: BẢN ĐỒ GIÓ & RADAR -->
      <div v-if="globalTab === 'map'" class="animate-fade-in">
        <WindMapTab :lat="currentLocation?.latitude" :lon="currentLocation?.longitude" />
      </div>

      <!-- TRANG 3: TIN TỨC THIÊN TAI TOÀN CẦU -->
      <div v-if="globalTab === 'news'" class="animate-fade-in max-w-4xl mx-auto">
        <NewsTab />
      </div>

      <!-- TRANG 4: LỊCH ÂM & SỰ KIỆN -->
      <div v-if="globalTab === 'calendar'" class="animate-fade-in">
        <CalendarView />
      </div>

      <!-- TRANG 5: CÔNG CỤ TẠO MÃ NHÚNG -->
      <div v-if="globalTab === 'widget'" class="animate-fade-in">
        <WidgetTab />
      </div>

    </main>
  </div>
</template>