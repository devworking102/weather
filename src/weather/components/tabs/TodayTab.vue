<script setup lang="ts">
import type { WeatherData, AQIData } from '../../types'
import type { HistoricalCompare } from '../../composables/useHistorical'
import HeroCard from '../today/HeroCard.vue'
import StatsGrid from '../today/StatsGrid.vue'
import SunMoonCard from '../today/SunMoonCard.vue'
import HourlyStrip from '../today/HourlyStrip.vue'
import TodaySummary from '../today/TodaySummary.vue'
import LunarHoursCard from '../today/LunarHoursCard.vue'
import HistoricalCompareCard from '../today/HistoricalCompare.vue'
import AirQualityTab from './AirQualityTab.vue'

defineProps<{
  wx: WeatherData
  aqd?: AQIData | null
  todayHourly: Array<{ time: string; temp: number; icon: string; pp: number }>
  history?: HistoricalCompare | null
  historyBusy?: boolean
}>()
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6 items-start">
    <!-- Cột Trái: Thông tin chính (Rộng hơn) -->
    <div class="w-full lg:w-[65%] flex flex-col gap-6">
      <HeroCard :current="wx.current" />
      <HistoricalCompareCard :data="history ?? null" :busy="historyBusy ?? false" />
      <StatsGrid :current="wx.current" />
      <HourlyStrip :items="todayHourly" />
      <TodaySummary :daily="wx.daily" />
    </div>

    <!-- Cột Phải: Widget bổ sung (Sidebar) -->
    <div class="w-full lg:w-[35%] flex flex-col gap-6 sticky top-24">
      <LunarHoursCard />
      <SunMoonCard :sunrise="wx.daily.sunrise[0]" :sunset="wx.daily.sunset[0]" />
      <!-- Nhúng Tab Không khí thu nhỏ vào Trang chủ -->
      <AirQualityTab v-if="aqd" :aqd="aqd" />
    </div>
  </div>
</template>
