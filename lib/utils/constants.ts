/**
 * Constantes globales del proyecto
 */

export const APP_NAME = 'Anime Online'
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export const APP_DESCRIPTION = 'Plataforma de streaming de anime con subtítulos en español'

// APIs
export const JIKAN_API_URL = process.env.NEXT_PUBLIC_JIKAN_API_URL || 'https://api.jikan.moe/v4'
export const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || ''
export const TMDB_API_URL = 'https://api.themoviedb.org/3'

// Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Blogger
export const BLOGGER_BLOG_ID = process.env.BLOGGER_BLOG_ID || ''

// Colores
export const COLORS = {
  bg: '#101010',
  bg2: '#181818',
  bg3: '#222222',
  border: '#2a2a2a',
  text: '#e0e0e0',
  muted: '#888888',
  primary: '#4FC3F7',
  primaryDark: '#1976D2',
  success: '#43a047',
  error: '#e53935',
  warning: '#fb8c00'
}

// Límites de paginación
export const PAGINATION = {
  EPISODES_PER_PAGE: 20,
  ANIMES_PER_PAGE: 25,
  SEARCH_RESULTS: 30
}

// Estado de anime
export const ANIME_STATUS = {
  AIRING: 'EN_EMISION',
  FINISHED: 'FINALIZADO'
} as const

// Rutas
export const ROUTES = {
  HOME: '/',
  DIRECTORIO: '/directorio',
  BUSCAR: '/buscar',
  TEMPORADA: '/temporada',
  ANIME: (id: string) => `/anime/${id}`,
  EPISODE: (animeId: string, episodeNum: number) => `/anime/${animeId}/ep/${episodeNum}`
}

// Duración de caché (en segundos)
export const CACHE_DURATION = {
  SHORT: 60, // 1 minuto
  MEDIUM: 300, // 5 minutos
  LONG: 3600, // 1 hora
  VERY_LONG: 86400 // 24 horas
}
