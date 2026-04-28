import type { TabId } from './types'

export const WMO: Record<number, { t: string; i: string; bg: string }> = {
  0:  { t: 'Trời quang đãng', i: '☀️', bg: '#ea580c' },
  1:  { t: 'Phần lớn quang', i: '🌤️', bg: '#f97316' },
  2:  { t: 'Nhiều mây', i: '⛅', bg: '#3b82f6' },
  3:  { t: 'Trời u ám', i: '☁️', bg: '#64748b' },
  45: { t: 'Sương mù', i: '🌫️', bg: '#94a3b8' },
  48: { t: 'Sương mù băng', i: '🌫️', bg: '#94a3b8' },
  51: { t: 'Mưa phùn nhẹ', i: '🌦️', bg: '#0ea5e9' },
  53: { t: 'Mưa phùn', i: '🌦️', bg: '#0284c7' },
  55: { t: 'Mưa phùn nặng', i: '🌧️', bg: '#0369a1' },
  61: { t: 'Mưa nhẹ', i: '🌧️', bg: '#0369a1' },
  63: { t: 'Mưa vừa', i: '🌧️', bg: '#075985' },
  65: { t: 'Mưa to', i: '🌧️', bg: '#0c4a6e' },
  71: { t: 'Tuyết nhẹ', i: '🌨️', bg: '#7dd3fc' },
  73: { t: 'Tuyết', i: '❄️', bg: '#93c5fd' },
  75: { t: 'Bão tuyết', i: '❄️', bg: '#bfdbfe' },
  80: { t: 'Mưa rào nhẹ', i: '🌦️', bg: '#0284c7' },
  81: { t: 'Mưa rào', i: '🌧️', bg: '#075985' },
  82: { t: 'Mưa rào mạnh', i: '⛈️', bg: '#0c4a6e' },
  95: { t: 'Giông bão', i: '⛈️', bg: '#4338ca' },
  96: { t: 'Giông + mưa đá', i: '⛈️', bg: '#3730a3' },
  99: { t: 'Giông + mưa đá lớn', i: '⛈️', bg: '#312e81' },
}

export const DIRS = ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc']
export const DNAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export const TABS: { id: TabId; label: string }[] = [
  { id: 'today',  label: '🌡 Hôm nay' },
  { id: 'hourly', label: '⏱ Theo giờ' },
  { id: 'week',   label: '📅 7 Ngày' },
  { id: 'daily',  label: '📅 16 Ngày' },
  { id: 'month',  label: '🗓️ 30 Ngày' },
  { id: 'aqi',    label: '💨 Không khí' },
  { id: 'health', label: '❤️ Sức khỏe' },
  // { id: 'wind',   label: '🗺️ Bản đồ gió' },
  { id: 'alerts', label: '⚠️ Cảnh báo' },
  { id: 'news',   label: '📰 Tin tức' },
  // { id: 'widget', label: '🔗 Nhúng' },
]

/** 12 Earthly Branches (Địa chi) - Vietnamese zodiac hour names. */
export const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi']

/**
 * Auspicious (hoàng đạo) Earthly Branch hours indexed by lunar month (1–12).
 * Traditional Vietnamese calendar: months pair (1&7, 2&8, 3&9, 4&10, 5&11, 6&12).
 * Each entry lists the 6 lucky hour indices (0=Tý, 11=Hợi).
 */
export const HOANG_DAO_BY_MONTH: Record<number, number[]> = {
  1:  [0, 1, 3, 6, 8, 9],   // Tý Sửu Mão Ngọ Thân Dậu
  7:  [0, 1, 3, 6, 8, 9],
  2:  [2, 3, 5, 8, 10, 11], // Dần Mão Tỵ Thân Tuất Hợi
  8:  [2, 3, 5, 8, 10, 11],
  3:  [4, 5, 7, 10, 0, 1],  // Thìn Tỵ Mùi Tuất Tý Sửu
  9:  [4, 5, 7, 10, 0, 1],
  4:  [6, 7, 9, 0, 2, 3],   // Ngọ Mùi Dậu Tý Dần Mão
  10: [6, 7, 9, 0, 2, 3],
  5:  [8, 9, 11, 2, 4, 5],  // Thân Dậu Hợi Dần Thìn Tỵ
  11: [8, 9, 11, 2, 4, 5],
  6:  [10, 11, 1, 4, 6, 7], // Tuất Hợi Sửu Thìn Ngọ Mùi
  12: [10, 11, 1, 4, 6, 7],
}
