<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface NewsItem {
  id: string
  title: string
  url: string
  date: string
  thumbnail: string
  description: string
}

const news = ref<NewsItem[]>([])
const busy = ref(true)
const err = ref('')

async function fetchAsianCountries(): Promise<string[]> {
  try {
    const r = await fetch('https://restcountries.com/v3.1/region/asia?fields=name,translations')
    if (!r.ok) return []
    const list = await r.json()
    const names = new Set<string>()
    for (const c of list) {
      if (c?.name?.common) names.add(c.name.common)
      if (c?.name?.official) names.add(c.name.official)
      const vi = c?.translations?.vie?.common
      if (vi) names.add(vi)
    }
    return Array.from(names)
  } catch {
    return []
  }
}

onMounted(async () => {
  try {
    const [res, asianCountries] = await Promise.all([
      fetch('https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.gdacs.org%2Fxml%2Frss.xml'),
      fetchAsianCountries(),
    ])
    if (!res.ok) throw new Error('Không thể tải dữ liệu tin tức.')

    const json = await res.json()
    if (json.status === 'ok' && json.items) {
      const allNews: NewsItem[] = json.items.map((item: any) => ({
        id: item.guid,
        title: item.title,
        url: item.link,
        date: item.pubDate,
        thumbnail: item.thumbnail,
        description: item.description.replace(/<[^>]*>?/gm, '').split('More information available at')[0].trim()
      }));

      const asianNews: NewsItem[] = [];
      const otherNews: NewsItem[] = [];

      allNews.forEach(item => {
        if (asianCountries.some(country => item.title.includes(country))) {
          asianNews.push(item);
        } else {
          otherNews.push(item);
        }
      });

      news.value = [...asianNews, ...otherNews].slice(0, 20);
    } else {
      throw new Error('Dữ liệu tin tức không hợp lệ.')
    }
  } catch (error: any) {
    err.value = error.message || 'Lỗi mạng khi tải tin tức.'
  } finally {
    busy.value = false
  }
})

function formatNewsDate(s: string) {
  if (!s) return ''
  const d = new Date(s)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div class="px-4 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
        <span class="text-xl">📰</span>
        <h3 class="text-sm font-bold text-gray-800 uppercase tracking-wide">Tin tức thời tiết & Thiên tai toàn cầu</h3>
      </div>

      <div class="p-0">
        <!-- Skeleton Loading cho Tin tức -->
        <div v-if="busy" class="divide-y divide-gray-100 animate-pulse">
          <div v-for="i in 5" :key="i" class="flex flex-col md:flex-row gap-4 p-4">
            <div class="w-full md:w-48 h-32 md:h-28 bg-gray-200 rounded-lg shrink-0"></div>
            <div class="flex flex-col flex-1 gap-2 py-1">
              <div class="h-5 bg-gray-200 rounded w-full"></div>
              <div class="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-gray-100 rounded w-full"></div>
              <div class="h-4 bg-gray-100 rounded w-5/6"></div>
              <div class="h-4 bg-gray-200 rounded w-24 mt-auto"></div>
            </div>
          </div>
        </div>
        <div v-else-if="err" class="text-center py-6 text-red-500 text-sm">{{ err }}</div>
        <div v-else-if="!news.length" class="text-center py-6 text-gray-500 text-sm">
          Không có tin tức nào mới trong thời gian qua.
        </div>

        <div v-else class="divide-y divide-gray-100">
          <a
            v-for="n in news"
            :key="n.id"
            :href="n.url"
            target="_blank"
            rel="noopener"
            class="flex flex-col md:flex-row gap-4 p-4 hover:bg-gray-50 transition-colors no-underline group"
          >
            <!-- Hình ảnh -->
            <div v-if="n.thumbnail" class="w-full md:w-48 h-32 md:h-auto shrink-0">
              <img :src="n.thumbnail" :alt="n.title" class="w-full h-full object-cover rounded-lg border border-gray-200" />
            </div>
            
            <!-- Nội dung tin -->
            <div class="flex flex-col flex-1 gap-1.5">
              <h4 class="text-base font-bold text-gray-800 leading-snug group-hover:text-blue-600 transition-colors">
                {{ n.title }}
              </h4>
              <p class="text-sm text-gray-600 leading-relaxed line-clamp-2">
                {{ n.description }}
              </p>
              <div class="text-xs text-gray-500 mt-auto pt-2 flex items-center gap-3">
                <span>🕒 {{ formatNewsDate(n.date) }}</span>
                <span class="text-xs bg-red-50 border border-red-100 text-red-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">GDACS</span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>