<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  wx: any
  loc?: any
}>()

const recommendations = ref<{ title: string; food: string[]; activity: string[]; clothes: string[] } | null>(null)
const isLoading = ref(false)

// Cache danh sách quốc gia theo subregion để không gọi lại REST Countries mỗi lần
const subregionCache = new Map<string, string[]>()
async function fetchSubregionCountries(subregion: string): Promise<string[]> {
  if (subregionCache.has(subregion)) return subregionCache.get(subregion)!
  try {
    const r = await fetch(`https://restcountries.com/v3.1/subregion/${encodeURIComponent(subregion)}?fields=name`)
    if (!r.ok) return []
    const list = await r.json()
    const names: string[] = []
    for (const c of list) {
      if (c?.name?.common) names.push(c.name.common)
      if (c?.name?.official) names.push(c.name.official)
    }
    subregionCache.set(subregion, names)
    return names
  } catch {
    return []
  }
}

// API Key Gemini lấy từ biến môi trường (VITE_GEMINI_API_KEY trong file .env).
// Nếu không có, component sẽ dùng dữ liệu fallback cục bộ.
const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) || ''

// --- START: Dữ liệu dự phòng cho Châu Á ---
const fallbackData = {
  hot: {
    sea: {
      title: "Nóng ẩm đặc trưng Đông Nam Á ☀️",
      food: ["Nước dừa/Nước mía mát lạnh 🥥", "Chè thái/Chè bưởi 🍧", "Bún thịt nướng/Gỏi cuốn 🥗", "Hải sản tươi sống 🦐", "Trái cây nhiệt đới 🥭", "Kem xôi dừa 🥥", "Trà chanh/Trà đào giã tay 🍹", "Gỏi đu đủ Som Tum 🥗", "Bún riêu cua đồng 🍜", "Phở cuốn mát mẻ 🌯"],
      activity: ["Đi bơi hoặc đi biển 🏊", "Trú ẩn trong TTTM/siêu thị 🛍️", "Cà phê máy lạnh ☕", "Dạo phố/chợ đêm khi tắt nắng 🌃", "Đi chơi công viên nước 💦", "Uống bia hơi vỉa hè 🍻", "Tham quan thủy cung 🐠", "Trượt băng trong nhà ⛸️"],
      clothes: ["Quần áo cotton/lanh thấm mồ hôi 👕", "Dép lê/sandal xỏ ngón 🩴", "Mũ rộng vành, kính râm 🕶️", "Áo khoác mỏng chống nắng 🧥", "Quần short/áo cộc tay 🩳", "Váy đầm mỏng nhẹ 👗", "Đừng quên bôi kem chống nắng 🧴"]
    },
    ea: {
      title: "Mùa hè oi ả ở Đông Á ☀️",
      food: ["Mì lạnh (Naengmyeon/Somen) 🍜", "Bingsu/Kakigori 🍧", "Trà sữa trân châu 🧋", "Dimsum hấp 🥟", "Sushi/Sashimi tươi mát 🍣", "Đậu hũ hạnh nhân 🍮", "Thịt lươn/cá nướng (Unagi) 🍱"],
      activity: ["Tham gia lễ hội mùa hè (Matsuri) 🏮", "Đi dạo công viên/bờ sông 🌳", "Khám phá các khu chợ đêm 🌃", "Thăm bảo tàng/triển lãm 🏛️", "Xem bắn pháo hoa 🎆", "Đi dạo phố mua sắm ngầm 🚇"],
      clothes: ["Áo phông và quần shorts 👕", "Váy liền thoáng mát 👗", "Giày sneaker nhẹ 👟", "Mang theo quạt tay/quạt mini 🌬️", "Mặc Yukata/Hanbok mùa hè 👘", "Ô che nắng/Mũ rộng vành 👒"]
    },
    sa: {
      title: "Cái nóng của Nam Á ☀️",
      food: ["Lassi (sữa chua uống) 🥛", "Kulfi (kem Ấn Độ) 🍦", "Pani Puri (bánh rỗng nhân) 🥟", "Salad dưa chuột và bạc hà 🥗", "Nước chanh Nimbu Pani 🍋", "Trái cây cắt lát rắc gia vị 🍉"],
      activity: ["Xem phim Bollywood trong rạp 🎬", "Thư giãn ở các đồi trạm (hill station) ⛰️", "Tham quan đền đài vào sáng sớm 🕌", "Mua sắm ở chợ có mái che 🛍️", "Nghỉ ngơi tránh nắng trưa 🧘"],
      clothes: ["Quần áo Kurta/Salwar Kameez mỏng 👘", "Vải lanh, cotton sáng màu 👕", "Khăn choàng mỏng che nắng 🧣", "Sandal thoáng khí 👡", "Trang phục rộng rãi thoải mái 🥻"]
    }
  },
  cold: {
    sea: {
      title: "Se lạnh ở vùng cao Đông Nam Á ❄️",
      food: ["Lẩu Thái/Lẩu nấm chua cay 🍲", "Thịt nướng xiên que xèo xèo 🍢", "Ngô/khoai lang nướng 🍠", "Sữa đậu nành/Sữa ngô nóng 🥛", "Bò nướng tảng 🥩", "Phở/Bún bò nóng hổi 🍜", "Bánh trôi tàu/Bánh chưng rán 🥟", "Cháo sườn sụn quẩy giòn 🥣"],
      activity: ["Đi bộ trekking/hiking 🏞️", "Đốt lửa trại 🏕️", "Ngồi quán cà phê view núi ☕", "Săn mây buổi sáng sớm ☁️", "Tắm lá thuốc/suối khoáng nóng ♨️", "Cắm trại Glamping 🏕️", "Dạo phố đón gió mùa 🧣"],
      clothes: ["Áo khoác gió/len mỏng 🧥", "Quần dài, quần kaki 👖", "Giày thể thao/boots 👟", "Khăn choàng cổ 🧣", "Áo giữ nhiệt bên trong 👕", "Mũ len/găng tay mỏng 🧤", "Áo phao lông vũ (nếu lên đỉnh núi) 🧥"]
    },
    ea: {
      title: "Mùa đông lạnh giá ở Đông Á ❄️",
      food: ["Lẩu cay (Mala/Kimchi Jjigae) 🥘", "Khoai lang nướng/Hạt dẻ nóng 🌰", "Mì ramen/udon nóng hổi 🍜", "Bánh gạo cay (Tteokbokki) 🌶️", "Lẩu Shabu-shabu/Sukiyaki 🍲", "Bánh bao nướng 🥟", "Rượu Sake/Soju hâm nóng 🍶"],
      activity: ["Tắm suối nước nóng (Onsen) ♨️", "Trượt tuyết/làm người tuyết 🏂", "Dạo phố ngắm đèn trang trí 🎄", "Tụ tập ở quán nhậu trong nhà (Izakaya) 🍶", "Câu cá trên băng 🎣", "Thưởng thức trà đạo 🍵"],
      clothes: ["Áo phao/áo khoác dạ dày 🧥", "Áo giữ nhiệt, áo len cổ lọ 👕", "Mũ len, găng tay, bịt tai 🧤", "Giày boots lót lông chống nước 👢", "Dán miếng giữ nhiệt 🔥", "Quần tất/quần lót nỉ 👖"]
    },
    sa: {
      title: "Mùa đông sương mù ở Nam Á ❄️",
      food: ["Trà Masala Chai nóng ☕", "Súp đậu lăng (Dal) 🥣", "Bánh Samosa nóng giòn 🥟", "Gajar ka Halwa (cà rốt hầm sữa) 🥕", "Thukpa (Mì nước Tây Tạng) 🍜", "Bánh Momos nóng hổi 🥟"],
      activity: ["Sưởi ấm bên đống lửa 🔥", "Tham dự các lễ hội mùa đông 🎊", "Đi dạo trong vườn hoa buổi trưa 🌼", "Đọc sách trong quán cà phê ấm cúng 📖", "Ghé thăm sườn núi Himalaya ⛰️"],
      clothes: ["Áo khoác len/dạ 🧥", "Khăn choàng Pashmina cao cấp 🧣", "Mặc nhiều lớp (layering) 👕", "Giày boots/kín mũi 👞", "Mũ trùm đầu bằng len 🧢"]
    }
  },
  rain: {
    sea: {
      title: "Mùa mưa nhiệt đới 🌧️",
      food: ["Lẩu Thái chua cay 🍲", "Bánh xèo/bánh khọt giòn rụm 🌮", "Cháo trắng hột vịt muối 🥣", "Đồ nướng BBQ trong nhà 🥩", "Mì tôm trứng xúc xích 🍜", "Cơm tấm sườn bì chả 🍛", "Bánh mì chảo nóng hổi 🍳", "Ốc luộc/xào xả ốc 🐌"],
      activity: ["Cày phim Netflix ở nhà 🎬", "Đi massage/spa thư giãn 💆", "Cafe boardgame với bạn bè 🎲", "Học một lớp nấu ăn/làm bánh 🧑‍🍳", "Đọc sách/Nghe podcast 🎧", "Ngủ một giấc thật ngon 😴", "Lượn lờ trung tâm thương mại 🛍️", "Làm việc nhà/Dọn dẹp phòng 🧹"],
      clothes: ["Áo mưa/ô (dù) ☔", "Dép nhựa/giày chống nước 🩴", "Quần short/quần lửng 🩳", "Túi/balo chống nước 🎒", "Trang phục màu tối dễ giặt 👕", "Quần áo chất liệu mau khô 👖", "Mang theo áo khoác mỏng 🧥"]
    },
    ea: {
      title: "Mùa mưa ở Đông Á 🌧️",
      food: ["Bánh hành chiên (Pajeon/Okonomiyaki) 🥞", "Rượu gạo (Makgeolli) 🍶", "Lẩu Shabu-shabu 🍲", "Mì hoành thánh nóng 🍜", "Cơm cà ri Nhật nóng 🍛", "Súp miso 🥣"],
      activity: ["Đi hát karaoke 🎤", "Tham quan thủy cung/bảo tàng 🐠", "Mua sắm dưới các khu phố ngầm 🚇", "Đọc truyện tranh ở Manga cafe 📚", "Ghé tiệm cà phê thú cưng 🐈"],
      clothes: ["Ô (dù) trong suốt kiểu Nhật/Hàn ☔", "Ủng đi mưa thời trang 👢", "Áo khoác gió chống thấm 🧥", "Quần áo nhanh khô 👕", "Mang theo khăn giấy khô 🧻"]
    },
    sa: {
      title: "Mùa mưa Monsoon 🌧️",
      food: ["Trà Masala và bánh Pakora ☕", "Bắp (ngô) nướng 🌽", "Súp nóng các loại 🥣", "Cà ri cá cay nồng 🍛", "Gà Tikka Masala 🥘", "Bánh xèo Dosa 🌮"],
      activity: ["Ngắm mưa từ ban công/hiên nhà 🧘", "Chơi các trò trong nhà (cờ vua, carrom) 🎲", "Xem các điệu múa cổ điển 💃", "Thưởng thức ẩm thực đường phố trong nhà 🍲", "Vẽ tranh/nghệ thuật Henna 🎨"],
      clothes: ["Áo mưa chắc chắn ☔", "Sandal/dép nhựa 🩴", "Quần áo vải tổng hợp mau khô 👖", "Tránh mặc quần jeans 🚫", "Mang theo túi nilon bọc đồ 🛍️"]
    }
  }
}

// Hàm lấy ngẫu nhiên N phần tử trong mảng
const pickRandom = (arr: string[], count: number) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count)

async function useFallbackRecommendations() {
  console.log('AI Error/Not configured. Using fallback data.')
  if (!props.wx?.current || !props.loc) return

  const temp = props.wx.current.temperature_2m
  const code = props.wx.current.weather_code
  const country = props.loc.country

  const isRaining = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95
  const isHot = temp >= 28
  const isCold = temp <= 18

  let weatherKey: 'hot' | 'cold' | 'rain' | 'nice' = 'nice'
  if (isRaining) weatherKey = 'rain'
  else if (isCold) weatherKey = 'cold'
  else if (isHot) weatherKey = 'hot'

  // Phân vùng Châu Á theo REST Countries (Eastern Asia / Southern Asia / còn lại coi như Đông Nam Á)
  const [eaCountries, saCountries] = await Promise.all([
    fetchSubregionCountries('Eastern Asia'),
    fetchSubregionCountries('Southern Asia'),
  ])

  let regionKey: 'sea' | 'ea' | 'sa' = 'sea'
  if (eaCountries.includes(country)) regionKey = 'ea'
  else if (saCountries.includes(country)) regionKey = 'sa'

  if (weatherKey === 'nice') {
    recommendations.value = {
      title: "Thời tiết thật tuyệt vời! 🌤️",
      food: pickRandom(["Bữa ăn ngoài trời (BBQ/Picnic) 🍖", "Cơm nhà làm 🍚", "Món ăn đường phố yêu thích 🍢", "Thử một nhà hàng mới 🍽️", "Gà nướng/Pizza 🍕", "Bún chả/Phở 🍜", "Bánh mì Việt Nam 🥖", "Salad tươi mát 🥗", "Sushi/Sashimi 🍣"], 4),
      activity: pickRandom(["Dã ngoại (picnic) 🧺", "Đạp xe dạo phố 🚴", "Chụp ảnh ngoài trời 📸", "Cà phê vỉa hè ☕", "Chơi thể thao 🏃‍♂️", "Dạo quanh công viên 🌳", "Cắm trại cuối tuần 🏕️", "Tản bộ bờ hồ 🚶", "Lượn lờ phố phường bằng xe máy 🛵"], 4),
      clothes: pickRandom(["Trang phục thoải mái nhất 👟", "Giày thể thao năng động 👟", "Áo phông và quần jeans 👖", "Váy hoa/Sơ mi 👗", "Áo khoác mỏng cho buổi tối 🧥", "Trang phục năng động, trẻ trung 👕", "Phụ kiện kính râm/mũ lưỡi trai 🧢", "Quần short ống rộng 🩳"], 4)
    }
  } else {
    const fallback = fallbackData[weatherKey][regionKey]
    if (fallback) {
      recommendations.value = {
        title: fallback.title,
        food: pickRandom(fallback.food, 4),
        activity: pickRandom(fallback.activity, 4),
        clothes: pickRandom(fallback.clothes, 4)
      }
    }
  }
}

async function fetchAIRecommendations() {
  if (!props.wx?.current || !props.loc) return

  // Nếu không có API Key, dùng fallback luôn và không hiển thị loading
  if (!GEMINI_API_KEY) {
    await useFallbackRecommendations()
    return
  }

  isLoading.value = true
  recommendations.value = null // Xóa gợi ý cũ khi tải mới
  const temp = props.wx.current.temperature_2m
  const locName = `${props.loc.name}${props.loc.admin1 ? ', ' + props.loc.admin1 : ''}, ${props.loc.country}`

  const prompt = `Tôi đang ở ${locName}. Nhiệt độ hiện tại là ${temp}°C. Hãy đóng vai một trợ lý du lịch địa phương, gợi ý cho tôi chính xác 4 món ăn đặc sản/phổ biến nhất tại khu vực này hợp với thời tiết này (kèm emoji), 4 hoạt động vui chơi hợp lý (kèm emoji), và 4 trang phục nên mặc.
  Trả về DUY NHẤT một chuỗi JSON chuẩn có cấu trúc:
  {"title": "1 câu nhận xét thời tiết ngắn gọn", "food": ["..."], "activity": ["..."], "clothes": ["..."]}`

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { response_mime_type: 'application/json' } // Ép AI trả về JSON
      })
    })
    
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`)

    const data = await res.json()
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      recommendations.value = JSON.parse(data.candidates[0].content.parts[0].text)
    } else {
      // Nếu AI trả về cấu trúc không mong muốn, dùng fallback
      throw new Error("Invalid AI response structure.")
    }
  } catch (error) {
    console.error('Lỗi khi gọi AI, chuyển sang dữ liệu dự phòng:', error)
    await useFallbackRecommendations() // Sử dụng fallback khi có lỗi
  } finally {
    isLoading.value = false
  }
}

// Gọi AI mỗi khi người dùng đổi địa điểm hoặc dữ liệu thời tiết thay đổi
watch(() => props.loc, fetchAIRecommendations, { immediate: true })
</script>

<template>
  <!-- Skeleton Loading cho Gợi ý -->
  <div v-if="isLoading" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
    <div v-for="i in 3" :key="i" class="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div class="flex-1">
          <div class="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
          <div class="h-3 bg-gray-100 rounded w-1/2"></div>
        </div>
      </div>
      <div class="space-y-2">
        <div class="h-8 bg-gray-50 border border-gray-100 rounded-lg w-full"></div>
        <div class="h-8 bg-gray-50 border border-gray-100 rounded-lg w-11/12"></div>
        <div class="h-8 bg-gray-50 border border-gray-100 rounded-lg w-full"></div>
        <div class="h-8 bg-gray-50 border border-gray-100 rounded-lg w-4/5"></div>
      </div>
    </div>
  </div>

  <div v-else-if="recommendations" class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
    
    <!-- Cột Mặc gì -->
    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm transition-transform hover:-translate-y-1">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl drop-shadow-sm">👕</span>
        <div>
          <h3 class="text-sm font-bold text-blue-900 uppercase tracking-wide">Mặc gì hôm nay?</h3>
          <p class="text-xs text-blue-700 font-medium">{{ recommendations.title }}</p>
        </div>
      </div>
      <ul class="space-y-2">
        <li v-for="(item, i) in recommendations.clothes" :key="i" class="flex items-center gap-2 text-sm text-blue-800 font-medium bg-white/60 px-3 py-2 rounded-lg border border-blue-200/50 shadow-sm"><span class="text-blue-500 font-bold">✓</span> {{ item }}</li>
      </ul>
    </div>

    <!-- Cột Ăn gì -->
    <div class="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-xl p-5 shadow-sm transition-transform hover:-translate-y-1">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl drop-shadow-sm">🍲</span>
        <div>
          <h3 class="text-sm font-bold text-orange-900 uppercase tracking-wide">Ăn gì hợp lý?</h3>
          <p class="text-xs text-orange-700 font-medium">{{ recommendations.title }}</p>
        </div>
      </div>
      <ul class="space-y-2">
        <li v-for="(item, i) in recommendations.food" :key="i" class="flex items-center gap-2 text-sm text-orange-800 font-medium bg-white/60 px-3 py-2 rounded-lg border border-orange-200/50 shadow-sm"><span class="text-orange-500 font-bold">✓</span> {{ item }}</li>
      </ul>
    </div>

    <!-- Cột Đi chơi -->
    <div class="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-5 shadow-sm transition-transform hover:-translate-y-1">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl drop-shadow-sm">🎒</span>
        <div>
          <h3 class="text-sm font-bold text-emerald-900 uppercase tracking-wide">Đi đâu chơi?</h3>
          <p class="text-xs text-emerald-700 font-medium">{{ recommendations.title }}</p>
        </div>
      </div>
      <ul class="space-y-2">
        <li v-for="(item, i) in recommendations.activity" :key="i" class="flex items-center gap-2 text-sm text-emerald-800 font-medium bg-white/60 px-3 py-2 rounded-lg border border-emerald-200/50 shadow-sm"><span class="text-emerald-500 font-bold">★</span> {{ item }}</li>
      </ul>
    </div>

  </div>
</template>