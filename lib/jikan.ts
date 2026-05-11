import axios from 'axios'
import { JikanAnime } from './types'

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4'

const jikanClient = axios.create({
  baseURL: JIKAN_BASE_URL,
  timeout: 10000
})

// Buscar anime por nombre
export async function searchAnime(query: string, page = 1) {
  try {
    const response = await jikanClient.get('/anime', {
      params: {
        query,
        page,
        limit: 25
      }
    })
    return response.data
  } catch (error) {
    console.error('Error searching anime:', error)
    throw error
  }
}

// Obtener detalles del anime por ID
export async function getAnimeDetails(malId: number) {
  try {
    const response = await jikanClient.get(`/anime/${malId}`)
    return response.data as { data: JikanAnime['data'] }
  } catch (error) {
    console.error('Error fetching anime details:', error)
    throw error
  }
}

// Obtener episodios de un anime
export async function getAnimeEpisodes(malId: number, page = 1) {
  try {
    const response = await jikanClient.get(`/anime/${malId}/episodes`, {
      params: {
        page
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching episodes:', error)
    throw error
  }
}

// Obtener animes de temporada actual
export async function getSeasonalAnime() {
  try {
    const now = new Date()
    const year = now.getFullYear()
    let season: 'winter' | 'spring' | 'summer' | 'fall'

    const month = now.getMonth() + 1
    if (month >= 1 && month <= 3) season = 'winter'
    else if (month >= 4 && month <= 6) season = 'spring'
    else if (month >= 7 && month <= 9) season = 'summer'
    else season = 'fall'

    const response = await jikanClient.get(`/seasons/${year}/${season}`, {
      params: {
        limit: 25
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching seasonal anime:', error)
    throw error
  }
}

// Obtener top animes
export async function getTopAnime(page = 1) {
  try {
    const response = await jikanClient.get('/top/anime', {
      params: {
        page,
        limit: 25
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching top anime:', error)
    throw error
  }
}

// Obtener personajes de anime
export async function getAnimeCharacters(malId: number) {
  try {
    const response = await jikanClient.get(`/anime/${malId}/characters`)
    return response.data
  } catch (error) {
    console.error('Error fetching characters:', error)
    throw error
  }
}

// Obtener información del usuario MAL
export async function getMALUserInfo(username: string) {
  try {
    const response = await jikanClient.get(`/users/${username}/full`)
    return response.data
  } catch (error) {
    console.error('Error fetching MAL user info:', error)
    throw error
  }
}

// Obtener lista del usuario en MAL
export async function getMALUserAnimelist(username: string) {
  try {
    const response = await jikanClient.get(`/users/${username}/animelist/all`)
    return response.data
  } catch (error) {
    console.error('Error fetching MAL user animelist:', error)
    throw error
  }
}
