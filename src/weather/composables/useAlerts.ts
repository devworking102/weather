import { computed } from 'vue'
import type { WeatherAlert } from '../types'

export function useAlerts(wx: any, aqd: any, _quakes: any) {
  return computed(() => {
    const alerts: WeatherAlert[] = []
    
    if (wx.value?.current?.weather_code >= 95) {
      alerts.push({
        level: 'danger',
        icon: '⛈️',
        title: 'Cảnh báo Giông bão',
        message: 'Có giông bão mạnh tại khu vực của bạn. Vui lòng tìm nơi trú ẩn an toàn và hạn chế ra ngoài.'
      })
    }
    
    if (aqd.value?.current?.european_aqi > 100) {
      alerts.push({
        level: 'warning',
        icon: '😷',
        title: 'Chất lượng không khí kém',
        message: 'Chỉ số AQI đang ở mức cao. Nên hạn chế các hoạt động ngoài trời để bảo vệ sức khỏe.'
      })
    }

    return alerts
  })
}