import { computed } from 'vue'

// Helper để lấy đánh giá (1-5) và mức độ
// Giá trị đầu vào càng thấp thì đánh giá càng tốt
function getRating(value: number, thresholds: [number, number, number, number]): { value: number; level: string, color: string } {
  const levels = ['Rất tốt', 'Tốt', 'Trung bình', 'Kém', 'Rất kém'];
  const colors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'];
  if (value <= thresholds[0]) return { value: 5, level: levels[0], color: colors[0] }
  if (value <= thresholds[1]) return { value: 4, level: levels[1], color: colors[1] }
  if (value <= thresholds[2]) return { value: 3, level: levels[2], color: colors[2] }
  if (value <= thresholds[3]) return { value: 2, level: levels[3], color: colors[3] }
  return { value: 1, level: levels[4], color: colors[4] }
}

export function useHealth(wxRef: any, aqdRef: any) {
  const healthIndices = computed(() => {
    const wx = wxRef.value
    const aqd = aqdRef.value

    if (!wx || !wx.daily || !wx.current) return []

    const today = {
      tempMax: wx.daily.temperature_2m_max[0],
      precipProb: wx.daily.precipitation_probability_max[0],
      wind: wx.daily.wind_speed_10m_max[0],
      humidity: wx.current.relative_humidity_2m,
      cloudcover: wx.current.cloud_cover,
      aqi: aqd?.current?.european_aqi ?? 0,
    }

    const indices = [
      {
        id: 'running',
        title: 'Chạy bộ',
        icon: '🏃',
        rating: (() => {
          let score = 5;
          if (today.precipProb > 30) score--;
          if (today.precipProb > 60) score--;
          if (today.tempMax > 33 || today.tempMax < 15) score--;
          if (today.wind > 25) score--;
          if (today.aqi > 60) score--;
          if (today.aqi > 80) score--;
          const finalScore = Math.max(1, score);
          const levels = ['Rất kém', 'Kém', 'Trung bình', 'Tốt', 'Rất tốt'];
          const colors = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e'];
          return { value: finalScore, level: levels[finalScore - 1], color: colors[finalScore - 1] };
        })(),
        message: 'Nhiệt độ, gió và chất lượng không khí đều ảnh hưởng đến việc chạy bộ.'
      },
      {
        id: 'stargazing',
        title: 'Ngắm sao',
        icon: '🔭',
        rating: getRating(today.cloudcover, [15, 40, 70, 90]),
        message: 'Bầu trời quang đãng, ít mây là điều kiện tiên quyết để ngắm sao.'
      },
      {
        id: 'lawn_mowing',
        title: 'Làm vườn',
        icon: '🌱',
        rating: getRating(today.precipProb, [15, 30, 50, 75]),
        message: 'Trời khô ráo là tốt nhất để làm vườn và cắt cỏ.'
      },
      {
        id: 'sinus',
        title: 'Viêm xoang',
        icon: '🤧',
        rating: getRating(today.humidity, [60, 75, 85, 95]), // Lower humidity is better
        message: 'Độ ẩm cao có thể làm trầm trọng thêm các triệu chứng viêm xoang.'
      },
      {
        id: 'asthma',
        title: 'Hen suyễn',
        icon: '😮‍💨',
        rating: getRating(today.aqi, [20, 40, 60, 80]),
        message: 'Chất lượng không khí ảnh hưởng trực tiếp đến người bị hen suyễn.'
      },
      {
        id: 'arthritis',
        title: 'Đau khớp',
        icon: '🦴',
        rating: getRating(today.humidity, [65, 80, 90, 95]), // Lower humidity is better
        message: 'Độ ẩm cao và thay đổi áp suất có thể gây đau khớp.'
      },
      {
        id: 'outdoor_pests',
        title: 'Côn trùng',
        icon: '🦟',
        rating: (() => {
            let risk = 1;
            if (today.tempMax > 22 && today.tempMax < 32) risk++;
            if (today.humidity > 70) risk++;
            if (today.precipProb < 30) risk++;
            const finalRisk = Math.min(5, risk);
            const levels = ['Rất thấp', 'Thấp', 'Trung bình', 'Cao', 'Rất cao'];
            const colors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'];
            return { value: finalRisk, level: levels[finalRisk - 1], color: colors[finalRisk - 1] };
        })(),
        message: 'Côn trùng thường hoạt động mạnh hơn khi trời ấm và ẩm.'
      },
    ]

    return indices
  })

  return { healthIndices }
}