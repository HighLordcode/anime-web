'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Episodio } from '@/lib/types'

interface EpisodesListProps {
  episodes: Episodio[]
  animeId: string
  loading?: boolean
}

export default function EpisodesList({
  episodes,
  animeId,
  loading = false
}: EpisodesListProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedEpisodes = [...episodes].sort((a, b) => {
    const numA = a.numero
    const numB = b.numero
    return sortOrder === 'asc' ? numA - numB : numB - numA
  })

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-bg3 border border-border rounded animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (episodes.length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-video text-4xl text-border-2 mb-4 block" />
        <p className="text-muted">No hay episodios disponibles</p>
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <h2 className="text-xl font-bold text-text">Episodios ({episodes.length})</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Ordenar:</span>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-1 rounded bg-bg3 border border-border2 text-xs font-semibold text-muted hover:text-primary hover:border-primary transition"
          >
            {sortOrder === 'asc' ? (
              <>
                <i className="fas fa-arrow-up text-xs mr-1" />
                Antiguo
              </>
            ) : (
              <>
                <i className="fas fa-arrow-down text-xs mr-1" />
                Nuevo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedEpisodes.map(episode => (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            animeId={animeId}
          />
        ))}
      </div>
    </div>
  )
}

interface EpisodeCardProps {
  episode: Episodio
  animeId: string
}

function EpisodeCard({ episode, animeId }: EpisodeCardProps) {
  return (
    <Link href={`/anime/${animeId}/ep/${episode.numero}`}>
      <div className="rounded overflow-hidden bg-bg2 border border-border hover:border-primary-dark hover:shadow-lg hover:shadow-primary-dark/20 transition-all group cursor-pointer h-full">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-black/50 overflow-hidden">
          {episode.imagen_url ? (
            <Image
              src={episode.imagen_url}
              alt={episode.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-border-2">
              <i className="fas fa-image text-3xl" />
            </div>
          )}

          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <i className="fas fa-play text-3xl text-white" />
          </div>

          {/* Episode badge */}
          <div className="absolute bottom-2 left-2 bg-gradient-primary text-white px-2.5 py-1 rounded-sm text-xs font-bold uppercase tracking-wider">
            Ep. {episode.numero}
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="text-sm font-semibold text-text truncate mb-1">
            {episode.titulo || `Episodio ${episode.numero}`}
          </h3>
          <p className="text-xs text-muted">
            {new Date(episode.fecha_estreno).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </Link>
  )
}
