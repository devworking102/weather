import { WMO, DIRS, DNAMES } from './constants'

export function wmo(code: number) {
  return WMO[code] ?? { t: 'Không rõ', i: '🌡️', bg: '#475569' }
}

export function windDir(deg: number) {
  return DIRS[Math.round(deg / 45) % 8]
}

export function dayLabel(s: string, i: number) {
  if (i === 0) return 'Hôm nay'
  if (i === 1) return 'Ngày mai'
  return DNAMES[new Date(s).getDay()]
}

export function fTime(s: string) {
  return (s ?? '').split('T')[1]?.slice(0, 5) ?? ''
}

export function fDate(s: string) {
  const d = new Date(s)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function fDateTime(ms: number) {
  const d = new Date(ms)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function uvInfo(uv: number) {
  if (uv <= 2)  return { t: 'Thấp',     c: '#4ade80' }
  if (uv <= 5)  return { t: 'TB',       c: '#facc15' }
  if (uv <= 7)  return { t: 'Cao',      c: '#f97316' }
  if (uv <= 10) return { t: 'Rất cao',  c: '#ef4444' }
  return              { t: 'Cực cao',   c: '#a855f7' }
}

export function aqiInfo(v: number) {
  if (v <= 20)  return { t: 'Tốt',        c: '#4ade80', bg: 'rgba(74,222,128,.15)' }
  if (v <= 40)  return { t: 'Khá tốt',    c: '#a3e635', bg: 'rgba(163,230,53,.15)' }
  if (v <= 60)  return { t: 'Trung bình', c: '#facc15', bg: 'rgba(250,204,21,.15)' }
  if (v <= 80)  return { t: 'Kém',        c: '#f97316', bg: 'rgba(249,115,22,.15)' }
  if (v <= 100) return { t: 'Rất kém',    c: '#ef4444', bg: 'rgba(239,68,68,.15)' }
  return              { t: 'Nguy hại',    c: '#a855f7', bg: 'rgba(168,85,247,.15)' }
}

export function aqiAdvice(v: number) {
  if (v <= 20)  return 'Chất lượng tốt. Có thể hoạt động ngoài trời bình thường.'
  if (v <= 40)  return 'Khá tốt. Người nhạy cảm nên theo dõi sức khỏe.'
  if (v <= 60)  return 'Trung bình. Người nhạy cảm hạn chế thời gian ngoài trời.'
  if (v <= 80)  return 'Kém. Hạn chế hoạt động ngoài trời, đặc biệt với trẻ em & người già.'
  if (v <= 100) return 'Rất kém. Mọi người nên hạn chế ra ngoài, đóng cửa sổ.'
  return 'Nguy hại! Tránh ra ngoài hoàn toàn, đeo khẩu trang N95 nếu bắt buộc.'
}

/** Haversine distance in km between two lat/lon points. */
export function haversineKm(a: [number, number], b: [number, number]) {
  const toRad = (x: number) => (x * Math.PI) / 180
  const [lat1, lon1] = a
  const [lat2, lon2] = b
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
