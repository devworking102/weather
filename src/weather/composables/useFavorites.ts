import { ref, onMounted } from 'vue'
import type { GeoLocation } from '../types'

const FAVORITES_KEY = 'weather_vn_favorites'

export function useFavorites() {
  const favorites = ref<GeoLocation[]>([])

  onMounted(() => {
    loadFavorites()
  })

  function loadFavorites() {
    const stored = localStorage.getItem(FAVORITES_KEY)
    if (stored) {
      favorites.value = JSON.parse(stored)
    }
  }

  function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
  }

  function isFavorite(location: GeoLocation | null): boolean {
    if (!location) return false
    return favorites.value.some(fav => fav.id === location.id)
  }

  function toggleFavorite(location: GeoLocation) {
    if (isFavorite(location)) {
      favorites.value = favorites.value.filter(fav => fav.id !== location.id)
    } else {
      favorites.value.push(location)
    }
    saveFavorites()
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  }
}