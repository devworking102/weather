export interface GeoLocation {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

export interface CurrentW {
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  precipitation: number
  wind_speed_10m: number
  wind_gusts_10m?: number
  wind_direction_10m: number
  weather_code: number
  surface_pressure: number
  visibility: number
  uv_index: number
  dew_point_2m: number
  cloud_cover: number
  time: string
}

export interface HourlyW {
  time: string[]
  temperature_2m: number[]
  weather_code: number[]
  precipitation_probability: number[]
  wind_speed_10m: number[]
  wind_gusts_10m?: number[]
  relative_humidity_2m: number[]
  uv_index: number[]
  apparent_temperature: number[]
  precipitation: number[]
}

export interface DailyW {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  weather_code: number[]
  precipitation_sum: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max: number[]
  wind_gusts_10m_max?: number[]
  sunrise: string[]
  sunset: string[]
  uv_index_max: number[]
}

export interface WeatherData {
  current: CurrentW
  hourly: HourlyW
  daily: DailyW
  timezone: string
}

export interface AQICurrent {
  pm2_5: number
  pm10: number
  carbon_monoxide: number
  nitrogen_dioxide: number
  ozone: number
  european_aqi: number
  us_aqi: number
}

export interface AQIHourly {
  time: string[]
  pm2_5: number[]
  pm10: number[]
  european_aqi: number[]
}

export interface AQIData {
  current: AQICurrent
  hourly: AQIHourly
}

export interface Earthquake {
  id: string
  magnitude: number
  place: string
  time: number
  tsunami: number
  coords: [number, number, number]
  url: string
  depth: number
  distanceKm: number
}

export interface WeatherAlert {
  level: 'info' | 'warning' | 'danger'
  icon: string
  title: string
  message: string
}

export type TabId = 'today' | 'hourly' | 'week' | 'daily' | 'month' | 'aqi' | 'health' | 'alerts' | 'news' | 'wind' | 'widget'
