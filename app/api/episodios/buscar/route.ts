import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const ANIME1V_API_URL = process.env.ANIME1V_API_URL || 'http://localhost:3000/api/v1/anime'
const ANIME1V_API_KEY = process.env.ANIME1V_API_KEY || 'default-key'

const anime1vClient = axios.create({
  baseURL: ANIME1V_API_URL,
  timeout: 30000,
  headers: {
    'X-API-Key': ANIME1V_API_KEY
  }
})

interface Provider {
  id: string
  label: string
  domain: string
}

interface EpisodeResult {
  number: number
  title: string
  url: string
  provider: string
  aired?: string
}

const PROVIDERS: Provider[] = [
  { id: 'animeav1', label: 'AnimeAV1', domain: 'animeav1.com' },
  { id: 'tioanime', label: 'TioAnime', domain: 'tioanime.com' },
  { id: 'animeflv', label: 'AnimeFLV', domain: 'animeflv.net' },
  { id: 'jkanime', label: 'JKAnime', domain: 'jkanime.net' },
  { id: 'monoschinos', label: 'MonosChinos', domain: 'monoschinos2.com' },
  { id: 'hentaila', label: 'HentaiLA', domain: 'hentaila.com' }
]

/**
 * Busca un anime en anime1v-api y obtiene sus episodios
 */
async function searchAnimeEpisodes(query: string, providerIds?: string[]) {
  const targetProviders = providerIds
    ? PROVIDERS.filter(p => providerIds.includes(p.id))
    : PROVIDERS

  const results: Array<{
    provider: Provider
    episodes?: EpisodeResult[]
    error?: string
  }> = []

  for (const provider of targetProviders) {
    try {
      // Buscar anime en el proveedor
      const searchResponse = await anime1vClient.get('/search', {
        params: {
          q: query,
          domain: provider.domain
        }
      })

      if (!searchResponse.data?.data?.results || searchResponse.data.data.results.length === 0) {
        results.push({
          provider,
          error: 'No encontrado'
        })
        continue
      }

      // Obtener el primer resultado
      const firstResult = searchResponse.data.data.results[0]

      // Obtener información del anime (incluyendo episodios)
      const infoResponse = await anime1vClient.get('/info', {
        params: {
          url: firstResult.url
        }
      })

      const episodes = infoResponse.data?.data?.episodes || []

      // Transformar episodios
      const transformedEpisodes: EpisodeResult[] = episodes.map(
        (ep: any, index: number) => ({
          number: index + 1,
          title: ep.title || `Episodio ${index + 1}`,
          url: ep.url,
          provider: provider.id,
          aired: ep.aired
        })
      )

      results.push({
        provider,
        episodes: transformedEpisodes
      })
    } catch (error) {
      console.error(`Error searching in ${provider.label}:`, error)
      results.push({
        provider,
        error: (error as Error).message
      })
    }
  }

  return results
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const providers = searchParams.get('providers')?.split(',')

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'El parámetro "q" es requerido'
        },
        { status: 400 }
      )
    }

    const results = await searchAnimeEpisodes(query.trim(), providers)

    // Compilar episodios de todos los proveedores
    const allEpisodes: Array<EpisodeResult & { sources: string[] }> = {}

    for (const result of results) {
      if (result.episodes) {
        for (const ep of result.episodes) {
          const key = ep.number.toString()
          if (!allEpisodes[key as any]) {
            allEpisodes[key as any] = {
              ...ep,
              sources: [result.provider.id]
            }
          } else {
            allEpisodes[key as any].sources.push(result.provider.id)
          }
        }
      }
    }

    // Ordenar episodios por número
    const sortedEpisodes = Object.values(allEpisodes).sort(
      (a, b) => a.number - b.number
    )

    return NextResponse.json({
      success: true,
      query,
      totalEpisodes: sortedEpisodes.length,
      providers: results.map(r => ({
        id: r.provider.id,
        label: r.provider.label,
        found: r.episodes ? r.episodes.length : 0,
        error: r.error
      })),
      episodes: sortedEpisodes,
      message: `Se encontraron ${sortedEpisodes.length} episodios en ${results.filter(r => r.episodes).length} proveedores`
    })
  } catch (error) {
    console.error('Error searching episodes:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}
