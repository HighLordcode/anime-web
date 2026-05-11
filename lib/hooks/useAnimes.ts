'use client'

import { useState, useEffect } from 'react'
import { Anime, ApiResponse } from '@/lib/types'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useAnimes(limit = 25) {
  const { data, error, isLoading } = useSWR(
    `/api/animes?limit=${limit}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  )

  return {
    animes: (data as ApiResponse<Anime[]>)?.data || [],
    loading: isLoading,
    error
  }
}

export function useAnime(animeId: string) {
  const { data, error, isLoading } = useSWR(
    `/api/animes/${animeId}`,
    fetcher
  )

  return {
    anime: (data as ApiResponse<Anime>)?.data,
    loading: isLoading,
    error
  }
}

export function useSearchAnime(query: string) {
  const { data, error, isLoading } = useSWR(
    query ? `/api/animes/buscar?q=${encodeURIComponent(query)}` : null,
    fetcher
  )

  return {
    results: (data as ApiResponse<Anime[]>)?.data || [],
    loading: isLoading,
    error
  }
}

export function useSeasonalAnime() {
  const { data, error, isLoading } = useSWR(
    '/api/animes/temporada',
    fetcher,
    {
      revalidateOnFocus: false
    }
  )

  return {
    animes: (data as ApiResponse<Anime[]>)?.data || [],
    loading: isLoading,
    error
  }
}

export function useFavorites(userId: string) {
  const { data, error, isLoading, mutate } = useSWR(
    userId ? `/api/usuarios/${userId}/favoritos` : null,
    fetcher
  )

  const toggleFavorite = async (animeId: string, isFavorite: boolean) => {
    try {
      await fetch(`/api/usuarios/${userId}/favoritos`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anime_id: animeId })
      })
      mutate()
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return {
    favorites: (data as ApiResponse<Anime[]>)?.data || [],
    loading: isLoading,
    error,
    toggleFavorite
  }
}
