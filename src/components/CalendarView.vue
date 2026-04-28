<script setup lang="ts">
import { ref, computed } from 'vue'
import { toLunarDate } from '../weather/astronomy' // Tái sử dụng logic âm lịch

const today = new Date()
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))

// Xác định các ngày nghỉ lễ/sự kiện
function getHoliday(solarDate: Date, lunar: { day: number, month: number }) {
  const d = solarDate.getDate()
  const m = solarDate.getMonth() + 1
  const ld = lunar.day
  const lm = lunar.month

  // Lễ Dương Lịch
  if (d === 1 && m === 1) return 'Tết Dương lịch'
  if (d === 14 && m === 2) return 'Valentine'
  if (d === 8 && m === 3) return 'Quốc tế Phụ nữ'
  if (d === 30 && m === 4) return 'Giải phóng miền Nam'
  if (d === 1 && m === 5) return 'Quốc tế Lao động'
  if (d === 2 && m === 9) return 'Quốc khánh'
  if (d === 20 && m === 10) return 'Phụ nữ VN'
  if (d === 20 && m === 11) return 'Nhà giáo VN'
  if (d === 22 && m === 12) return 'QĐND VN'
  if (d === 24 && m === 12) return 'Giáng sinh'

  // Lễ Âm Lịch
  if (ld === 1 && lm === 1) return 'Tết Nguyên Đán'
  if (ld === 2 && lm === 1) return 'Mùng 2 Tết'
  if (ld === 3 && lm === 1) return 'Mùng 3 Tết'
  if (ld === 15 && lm === 1) return 'Tết Nguyên Tiêu'
  if (ld === 10 && lm === 3) return 'Giỗ tổ Hùng Vương'
  if (ld === 15 && lm === 4) return 'Lễ Phật Đản'
  if (ld === 5 && lm === 5) return 'Tết Đoan Ngọ'
  if (ld === 15 && lm === 7) return 'Lễ Vu Lan'
  if (ld === 15 && lm === 8) return 'Tết Trung Thu'
  if (ld === 23 && lm === 12) return 'Ông Công Ông Táo'
  
  // Logic Giao Thừa (Ngày cuối cùng của tháng Chạp)
  const tomorrow = new Date(solarDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomLunar = toLunarDate(tomorrow)
  if (tomLunar.day === 1 && tomLunar.month === 1) return 'Giao Thừa'

  return null
}

const calendarDays = computed(() => {
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const days = []
  
  // Tính toán khoảng lùi ngày để bắt đầu từ Thứ 2 (T2 -> CN)
  let startOffset = firstDay.getDay() - 1
  if (startOffset === -1) startOffset = 6 // Chủ nhật thành index 6
  
  const startDate = new Date(year, month, 1 - startOffset)
  
  // Vẽ lưới 42 ngày (6 tuần)
  for (let i = 0; i < 42; i++) { 
    const current = new Date(startDate)
    current.setDate(startDate.getDate() + i)
    
    const lunar = toLunarDate(current)
    
    days.push({
      date: current,
      solarDay: current.getDate(),
      lunarDay: lunar.day,
      lunarMonth: lunar.month,
      isToday: current.toDateString() === today.toDateString(),
      isCurrentMonth: current.getMonth() === month,
      holiday: getHoliday(current, lunar)
    })
  }
  return days
})

const prevMonth = () => viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
const nextMonth = () => viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
const goToday = () => viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1)

const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
</script>

<template>
  <div class="max-w-5xl mx-auto p-4 py-8">
    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <!-- Điều hướng Lịch -->
      <div class="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <div class="flex items-center gap-2 sm:gap-4">
          <button @click="prevMonth" class="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <h2 class="text-lg sm:text-xl font-bold text-gray-800 sm:w-48 text-center">Tháng {{ viewDate.getMonth() + 1 }} / {{ viewDate.getFullYear() }}</h2>
          <button @click="nextMonth" class="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>
        <button @click="goToday" class="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200 text-sm shadow-sm active:scale-95">
          Hôm nay
        </button>
      </div>

      <!-- Lưới Lịch -->
      <div class="p-2 sm:p-4 bg-white overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div class="min-w-[500px] grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
          <!-- Tiêu đề Thứ -->
          <div v-for="wd in weekDays" :key="wd" class="bg-gray-50 py-3 text-center text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">
            {{ wd }}
          </div>

          <!-- Các ô ngày -->
          <div 
            v-for="(day, idx) in calendarDays" :key="idx"
            class="bg-white min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 flex flex-col relative transition-colors hover:bg-gray-50 group"
            :class="{ 'opacity-40 bg-gray-50/50': !day.isCurrentMonth, 'bg-blue-50/30 ring-1 ring-inset ring-blue-200 z-10': day.isToday }"
          >
            <div class="flex justify-between items-start">
              <span class="text-sm sm:text-lg font-bold w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full" :class="day.isToday ? 'bg-blue-600 text-white shadow-md' : (idx % 7 === 6 ? 'text-red-600' : 'text-gray-800')">
                {{ day.solarDay }}
              </span>
              <span class="text-[10px] sm:text-xs font-medium" :class="day.lunarDay === 1 || day.lunarDay === 15 ? 'text-red-500 font-bold' : 'text-gray-400'">
                {{ day.lunarDay === 1 ? `${day.lunarDay}/${day.lunarMonth}` : day.lunarDay }}
              </span>
            </div>
            
            <!-- Huy hiệu Lễ Tết -->
            <div class="mt-auto pt-2 flex flex-col gap-1">
              <div v-if="day.holiday" class="text-[9px] sm:text-[10px] leading-tight font-semibold bg-red-50 text-red-600 border border-red-100 rounded px-1 sm:px-1.5 py-0.5 truncate shadow-sm" :title="day.holiday">
                {{ day.holiday }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>