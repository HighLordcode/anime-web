'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Episodio } from '@/lib/types'

interface EpisodeGridProps {
  episodes: Episodio[]
}

export default function EpisodeGrid({ episodes }: EpisodeGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 xs:grid-cols-1">
      {episodes.map(ep => (
        <EpisodeCard key={ep.id} episode={ep} />
      ))}
    </div>
  )
}

interface EpisodeCardProps {
  episode: Episodio
}

function EpisodeCard({ episode }: EpisodeCardProps) {
  return (
    <Link href={`/anime/${episode.anime_id}/ep/${episode.numero}`}>
      <div className="rounded overflow-hidden bg-bg2 border border-border hover:border-primary-dark hover:shadow-lg hover:shadow-primary-dark/20 transition-all group cursor-pointer">
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
        <div className="p-2.5">
          <h3 className="text-xs font-semibold text-text truncate">
            {episode.titulo}
          </h3>
          <p className="text-xs text-muted mt-1">
            {new Date(episode.fecha_estreno).toLocaleDateString('es-ES')}
          </p>
        </div>
      </div>
    </Link>
  )
}
