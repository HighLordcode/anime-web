'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Anime } from '@/lib/types'

interface SeasonGridProps {
  animes: Anime[]
  season: string
  loading?: boolean
}

export default function SeasonGrid({ animes, season, loading = false }: SeasonGridProps) {
  const getSeasonLabel = (s: string) => {
    const labels: Record<string, string> = {
      invierno: '❄️ Invierno',
      primavera: '🌸 Primavera',
      verano: '☀️ Verano',
      otono: '🍂 Otoño'
    }
    return labels[s] || s
  }

  if (loading) {
    return (
      <div>
        <h3 className="text-xl font-bold text-text mb-4">{getSeasonLabel(season)}</h3>
        <div className="grid grid-cols-auto-fill gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-loading rounded h-48 animate-pulse bg-bg3"
            />
          ))}
        </div>
      </div>
    )
  }

  if (animes.length === 0) {
    return null
  }

  return (
    <div>
      <h3 className="text-xl font-bold text-text mb-4">{getSeasonLabel(season)}</h3>
      <div className="grid grid-cols-auto-fill gap-3 auto-cols-max">
        {animes.map(anime => (
          <AnimeSeasonCard key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  )
}

interface AnimeSeasonCardProps {
  anime: Anime
}

function AnimeSeasonCard({ anime }: AnimeSeasonCardProps) {
  return (
    <Link href={`/anime/${anime.id}`}>
      <div className="rounded overflow-hidden bg-bg2 border border-border hover:border-primary-dark hover:shadow-lg hover:shadow-primary-dark/20 transition-all group cursor-pointer w-full max-w-xs">
        {/* Poster */}
        <div className="relative w-full aspect-3/4 bg-black/50 overflow-hidden">
          {anime.portada_url ? (
            <Image
              src={anime.portada_url}
              alt={anime.titulo}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-border-2">
              <i className="fas fa-image text-4xl" />
            </div>
          )}

          {/* Score badge */}
          {anime.puntuacion > 0 && (
            <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-sm text-yellow-400 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <i className="fas fa-star" />
              {anime.puntuacion.toFixed(1)}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Info */}
        <div className="p-2">
          <h3 className="text-xs font-semibold text-text line-clamp-2">
            {anime.titulo}
          </h3>
          <p className="text-xs text-muted mt-1">
            {anime.episodios_totales > 0 ? `${anime.episodios_totales} ep.` : 'TBD'}
          </p>
        </div>
      </div>
    </Link>
  )
}
