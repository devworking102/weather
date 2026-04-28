<script setup lang="ts">
defineProps<{
  indices: Array<{
    id: string;
    title: string;
    icon: string;
    rating: {
      value: number;
      level: string;
      color: string;
    };
    message: string;
  }>
}>()
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-xl">❤️‍🩹</span>
        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Sức khỏe & Hoạt động</h3>
      </div>

      <div v-if="!indices.length" class="p-6 text-center text-gray-500">
        Đang tải dữ liệu chỉ số...
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
        <div 
          v-for="item in indices" 
          :key="item.id"
          class="border rounded-xl p-4 flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-1"
          :style="{ borderColor: item.rating.color + '40', background: item.rating.color + '10' }"
        >
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold" :style="{ color: item.rating.color }">{{ item.title }}</span>
            <span class="text-3xl">{{ item.icon }}</span>
          </div>
          <div class="text-center my-2">
            <div class="text-2xl font-black" :style="{ color: item.rating.color }">{{ item.rating.level }}</div>
            <div class="flex justify-center gap-1.5 mt-2">
              <span v-for="i in 5" :key="i" class="h-2.5 w-2.5 rounded-full" :style="{ background: i <= item.rating.value ? item.rating.color : '#e5e7eb' }"></span>
            </div>
          </div>
          <p class="text-xs text-center mt-auto pt-2 font-medium" :style="{ color: item.rating.color + 'dd' }">
            {{ item.message }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>