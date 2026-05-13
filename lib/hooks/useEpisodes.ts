'use client'

import { useState } from 'react'
import { Episodio, ApiResponse } from '@/lib/types'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useEpisodes(limit = 20) {
  const { data, error, isLoading } = useSWR(
    `/api/episodios?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  return {
    episodes: (data as ApiResponse<Episodio[]>)?.data || [],
    loading: isLoading,
    error
  }
}

export function useEpisodesByAnime(animeId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/episodios?anime_id=${animeId}`,
    fetcher
  )

  return {
    episodes: (data as ApiResponse<Episodio[]>)?.data || [],
    loading: isLoading,
    error,
    mutate
  }
}

export function useEpisode(episodeId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/episodios/${episodeId}`,
    fetcher
  )

  return {
    episode: (data as ApiResponse<Episodio>)?.data,
    loading: isLoading,
    error
  }
}

export function useWatchedEpisode(userId: string, episodeId: string) {
  const [watched, setWatched] = useState(false)
  const [loading, setLoading] = useState(false)

  const toggleWatched = async () => {
    setLoading(true)
    try {
      await fetch(`/api/usuarios/${userId}/historial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          episodio_id: episodeId,
          completado: !watched
        })
      })
      setWatched(!watched)
    } catch (error) {
      console.error('Error toggling watched:', error)
    } finally {
      setLoading(false)
    }
  }

  return { watched, loading, toggleWatched }
}
