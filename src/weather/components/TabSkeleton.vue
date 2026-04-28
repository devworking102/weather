<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'today' | 'list' | 'chart' }>(), { variant: 'today' })
</script>

<template>
  <div>
    <!-- Today layout skeleton -->
    <div v-if="variant === 'today'" class="flex flex-col lg:flex-row gap-6 items-start">
      <div class="w-full lg:w-[65%] flex flex-col gap-6">
        <div class="bg-white border border-gray-200 rounded-2xl p-6 h-44">
          <div class="flex gap-6">
            <div class="w-24 h-24 rounded-full shimmer" />
            <div class="flex-1 space-y-3">
              <div class="h-12 shimmer rounded w-32" />
              <div class="h-5 shimmer rounded w-40" />
              <div class="h-4 shimmer rounded w-56" />
            </div>
          </div>
        </div>
        <div class="bg-white border border-gray-200 rounded-2xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div v-for="i in 8" :key="i" class="shimmer border border-gray-100 rounded-xl p-3 h-24" />
        </div>
        <div class="shimmer border border-gray-200 rounded-xl p-5 h-32" />
      </div>
      <div class="w-full lg:w-[35%] flex flex-col gap-6">
        <div class="shimmer border border-gray-200 rounded-2xl p-5 h-48" />
        <div class="shimmer border border-gray-200 rounded-2xl p-5 h-36" />
      </div>
    </div>

    <!-- Chart skeleton -->
    <div v-else-if="variant === 'chart'" class="flex flex-col gap-4">
      <div class="shimmer border border-gray-200 rounded-xl h-64 p-4" />
      <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <div v-for="i in 6" :key="i" class="h-12 shimmer rounded-lg" />
      </div>
    </div>

    <!-- List skeleton -->
    <div v-else class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
      <div v-for="i in 8" :key="i" class="h-16 shimmer rounded-lg" />
    </div>
  </div>
</template>
