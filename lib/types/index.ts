// Tipos para Animes
export interface Anime {
  id: string
  jikan_id: number
  titulo: string
  titulo_alternativo?: string
  portada_url: string
  sinopsis: string
  estado: 'EN_EMISION' | 'FINALIZADO'
  generos: string[]
  puntuacion: number
  episodios_totales: number
  url_jikan?: string
  tipo?: string
  temporada?: string
  anio?: number
  estudio?: string
  ranking?: number
  popularidad?: number
  total_miembros?: number
  blogger_page_id?: string
  created_at: string
  updated_at: string
}

// Tipos para Episodios
export interface Episodio {
  id: string
  anime_id: string
  numero: number
  titulo: string
  fecha_estreno: string
  sinopsis: string
  imagen_url: string
  duracion_minutos: number
  enlaces: Record<string, string>
  blogger_post_id?: string
  created_at: string
  updated_at: string
}

// Tipos para Usuarios
export interface Usuario {
  id: string
  username: string
  avatar_url?: string
  mal_username?: string
  simkl_token?: string
  created_at: string
}

// Tipos para Favoritos
export interface Favorito {
  id: string
  usuario_id: string
  anime_id: string
  created_at: string
}

// Tipos para Historial
export interface Historial {
  id: string
  usuario_id: string
  episodio_id: string
  progreso_segundos: number
  completado: boolean
  fecha_visto: string
}

// Respuesta API genérica
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

// Respuesta Jikan
export interface JikanAnime {
  data: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
        small_image_url: string
        large_image_url: string
      }
    }
    trailer: {
      youtube_id: string
      url: string
      embed_url: string
    }
    approved: boolean
    titles: Array<{
      type: string
      title: string
    }>
    title: string
    title_english?: string
    title_japanese?: string
    type: string
    source?: string
    episodes?: number
    status: string
    airing: boolean
    aired: {
      from: string
      to?: string
      prop: {
        from: {
          day: number
          month: number
          year: number
        }
        to?: {
          day: number
          month: number
          year: number
        }
      }
      string: string
    }
    duration: string
    rating?: string
    score?: number
    scored_by?: number
    rank?: number
    popularity?: number
    members?: number
    genres: Array<{
      mal_id: number
      type: string
      name: string
      url: string
    }>
    synopsis?: string
    background?: string
  }
}

// Respuesta TMDB
export interface TMDBMovie {
  id: number
  title: string
  poster_path: string
  backdrop_path: string
  overview: string
  release_date: string
  vote_average: number
  genre_ids: number[]
}

// Log de sincronización Blogger
export interface BloggerSyncLog {
  id: string
  episodio_id: string
  blogger_post_id: string
  estado: 'SUCCESS' | 'ERROR'
  mensaje: string
  timestamp: string
}
