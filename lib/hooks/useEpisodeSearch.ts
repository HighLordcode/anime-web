'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export interface EpisodeResult {
  number: number
  title: string
  url: string
  provider: string
  aired?: string
  sources?: string[]
}

export interface EpisodeSearchResponse {
  success: boolean
  query: string
  totalEpisodes: number
  episodes: EpisodeResult[]
  providers: Array<{
    id: string
    label: string
    found: number
    error?: string
  }>
  message: string
}

/**
 * Hook para buscar episodios de un anime
 */
export function useEpisodeSearch(query: string, providers?: string[]) {
  const providerParam = providers?.join(',') || ''
  const { data, error, isLoading, mutate } = useSWR(
    query
      ? `/api/episodios/buscar?q=${encodeURIComponent(query)}${
          providerParam ? `&providers=${providerParam}` : ''
        }`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000
    }
  )

  return {
    episodes: (data as EpisodeSearchResponse)?.episodes || [],
    providers: (data as EpisodeSearchResponse)?.providers || [],
    totalEpisodes: (data as EpisodeSearchResponse)?.totalEpisodes || 0,
    loading: isLoading,
    error,
    mutate
  }
}

export interface VideoServer {
  id: string
  label: string
  type: 'direct' | 'embed' | 'redirect' | 'unpacker' | 'download' | 'unknown'
  url?: string
  quality?: string
  isWorkingNow?: boolean
}

export interface EpisodeLinksResponse {
  success: boolean
  episodeUrl: string
  totalServers: number
  servers: VideoServer[]
  groupedByServer: Array<{
    server: string
    total: number
    links: VideoServer[]
  }>
  recommendations: string[]
  message: string
  error?: string
}

/**
 * Hook para obtener los enlaces de un episodio
 */
export function useEpisodeLinks(
  episodeUrl: string,
  excludeServers?: string,
  includeMega?: boolean
) {
  const params = new URLSearchParams()
  if (episodeUrl) params.append('url', episodeUrl)
  if (excludeServers) params.append('excludeServers', excludeServers)
  if (includeMega) params.append('includeMega', 'true')

  const { data, error, isLoading, mutate } = useSWR(
    episodeUrl ? `/api/episodios/enlaces?${params.toString()}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000 // Cache por 5 minutos
    }
  )

  return {
    servers: (data as EpisodeLinksResponse)?.servers || [],
    groupedServers: (data as EpisodeLinksResponse)?.groupedByServer || [],
    recommendations: (data as EpisodeLinksResponse)?.recommendations || [],
    totalServers: (data as EpisodeLinksResponse)?.totalServers || 0,
    loading: isLoading,
    error,
    mutate
  }
}

/**
 * Hook para combinar búsqueda de episodios e información del anime desde Jikan
 */
export function useAnimeWithEpisodes(animeTitle: string, jikanId?: number) {
  const { episodes, providers, loading: episodesLoading } =
    useEpisodeSearch(animeTitle)

  return {
    episodes,
    providers,
    episodesLoading,
    jikanId
  }
}
