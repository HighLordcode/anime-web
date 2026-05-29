import axios from 'axios'

// URL de anime1v-api (puede ser local o remoto)
const ANIME1V_API_URL = process.env.ANIME1V_API_URL || 'http://localhost:3001/api/v1/anime'
const ANIME1V_API_KEY = process.env.ANIME1V_API_KEY || 'default-key'

const anime1vClient = axios.create({
  baseURL: ANIME1V_API_URL,
  timeout: 30000,
  headers: {
    'x-api-key': ANIME1V_API_KEY
  }
})

interface SearchAnimeResult {
  id: string
  title: string
  url: string
  image?: string
  description?: string
  provider: string
}

interface AnimeInfo {
  title: string
  synopsis: string
  image: string
  episodes: Array<{
    number: number
    title: string
    url: string
  }>
}

interface EpisodeLink {
  server: string
  url: string
  type: 'direct' | 'embed' | 'download'
  quality?: string
}

/**
 * Busca animes en anime1v-api
 */
export async function searchAnime(query: string, provider?: string) {
  try {
    const response = await anime1vClient.get('/search', {
      params: {
        q: query,
        domain: provider
      }
    })
    return response.data
  } catch (error) {
    console.error('Error searching anime in anime1v:', error)
    throw error
  }
}

/**
 * Obtiene información detallada de un anime
 */
export async function getAnimeInfo(animeUrl: string) {
  try {
    const response = await anime1vClient.get('/info', {
      params: {
        url: animeUrl
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching anime info from anime1v:', error)
    throw error
  }
}

/**
 * Obtiene los enlaces de un episodio específico
 * @param episodeUrl URL del episodio
 * @param includeMega Incluir servidores Mega
 * @param excludeServers Excluir ciertos servidores (separados por coma)
 */
export async function getEpisodeLinks(
  episodeUrl: string,
  includeMega?: boolean,
  excludeServers?: string
) {
  try {
    const response = await anime1vClient.get('/episode', {
      params: {
        url: episodeUrl,
        includeMega,
        excludeServers
      }
    })
    return response.data
  } catch (error) {
    console.error('Error fetching episode links from anime1v:', error)
    throw error
  }
}

/**
 * Descarga un episodio
 */
export async function downloadEpisode(
  episodeUrl: string,
  quality: string = '720p',
  variant: string = 'SUB',
  preferredServer?: string,
  includeMega?: boolean
) {
  try {
    const response = await anime1vClient.post('/download', {
      url: episodeUrl,
      quality,
      variant,
      preferredServer,
      includeMega
    })
    return response.data
  } catch (error) {
    console.error('Error initiating download:', error)
    throw error
  }
}

/**
 * Obtiene el estado de una descarga
 */
export async function getDownloadStatus(downloadId: string) {
  try {
    const response = await anime1vClient.get(`/download/${downloadId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching download status:', error)
    throw error
  }
}

/**
 * Descarga múltiples episodios en lote
 */
export async function batchDownload(
  animeUrl: string,
  episodes: number[],
  variant: string = 'SUB',
  quality: string = '720p'
) {
  try {
    const response = await anime1vClient.post('/batch-download', {
      animeUrl,
      episodes,
      variant,
      quality
    })
    return response.data
  } catch (error) {
    console.error('Error initiating batch download:', error)
    throw error
  }
}

/**
 * Obtiene el estado de una descarga en lote
 */
export async function getBatchStatus(batchId: string) {
  try {
    const response = await anime1vClient.get(`/batch/${batchId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching batch status:', error)
    throw error
  }
}

export const PROVIDERS = [
  { id: 'animeav1', label: 'AnimeAV1', domain: 'animeav1.com' },
  { id: 'jkanime', label: 'JKAnime', domain: 'jkanime.net' },
  { id: 'animeflv', label: 'AnimeFLV', domain: 'animeflv.net' },
  { id: 'hentaila', label: 'HentaiLA', domain: 'hentaila.com' },
  { id: 'tioanime', label: 'TioAnime', domain: 'tioanime.com' },
  { id: 'monoschinos', label: 'MonosChinos', domain: 'monoschinos2.com' }
]

export const VIDEO_SERVERS = [
  { id: 'yourupload', label: 'YourUpload', type: 'direct' },
  { id: 'mega', label: 'Mega', type: 'direct' },
  { id: 'streamwish', label: 'StreamWish', type: 'embed' },
  { id: 'streamtape', label: 'StreamTape', type: 'embed' },
  { id: 'voe', label: 'VOE', type: 'redirect' },
  { id: 'filemoon', label: 'Filemoon', type: 'unpacker' },
  { id: 'doodstream', label: 'Doodstream', type: 'unpacker' },
  { id: 'mixdrop', label: 'Mixdrop', type: 'unpacker' }
]
