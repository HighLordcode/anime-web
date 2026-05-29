'use client'

import useSWR from 'swr'
import { Anime, ApiResponse } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useSeasonAnimes(season: string, year?: number) {
  const currentYear = year || new Date().getFullYear()
  const { data, error, isLoading } = useSWR(
    `/api/animes/temporada?season=${season}&year=${currentYear}&limit=50`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  return {
    animes: (data as any)?.data || [],
    season,
    total: (data as any)?.total || 0,
    loading: isLoading,
    error
  }
}

export function useSeasonCounts(year?: number) {
  const currentYear = year || new Date().getFullYear()
  const { data, error, isLoading } = useSWR(
    `/api/animes/temporada/count?year=${currentYear}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  return {
    counts: (data as any)?.counts || {},
    loading: isLoading,
    error
  }
}

export function useAllSeasons(year?: number) {
  const currentYear = year || new Date().getFullYear()
  const seasons = ['invierno', 'primavera', 'verano', 'otono']
  
  const results: Record<string, any> = {}
  
  seasons.forEach(season => {
    const { data, error, isLoading } = useSWR(
      `/api/animes/temporada?season=${season}&year=${currentYear}&limit=30`,
      fetcher
    )
    
    results[season] = {
      animes: (data as any)?.data || [],
      loading: isLoading,
      error
    }
  })

  return results
}
