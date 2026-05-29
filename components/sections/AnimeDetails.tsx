'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Anime } from '@/lib/types'

interface AnimeDetailsProps {
  anime: Anime
}

export default function AnimeDetails({ anime }: AnimeDetailsProps) {
  const getStatusBadge = (estado: string) => {
    if (estado === 'EN_EMISION') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/20 border border-success text-success text-xs font-semibold">
          <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
          En emisión
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/20 border border-muted text-muted text-xs font-semibold">
        Finalizado
      </span>
    )
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="relative w-full h-80 bg-black/50 overflow-hidden rounded-lg mb-8">
        {anime.portada_url ? (
          <Image
            src={anime.portada_url}
            alt={anime.titulo}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-border-2">
            <i className="fas fa-image text-6xl" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
      </div>

      {/* Metadata */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Poster */}
        <div className="flex-shrink-0">
          <div className="relative w-48 aspect-3/4 rounded overflow-hidden border border-border">
            {anime.portada_url ? (
              <Image
                src={anime.portada_url}
                alt={anime.titulo}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-bg3 text-border-2">
                <i className="fas fa-image text-4xl" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-text mb-2">{anime.titulo}</h1>

          {anime.titulo_alternativo && (
            <p className="text-sm text-muted mb-4">{anime.titulo_alternativo}</p>
          )}

          <div className="flex items-center gap-2 mb-6">
            {getStatusBadge(anime.estado)}
            {anime.puntuacion > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-semibold">
                <i className="fas fa-star text-xs" />
                {anime.puntuacion.toFixed(1)}/10
              </div>
            )}
          </div>

          {/* Grid de datos */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {anime.episodios_totales > 0 && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">
                  Episodios
                </p>
                <p className="text-lg font-semibold text-text">
                  {anime.episodios_totales}
                </p>
              </div>
            )}
            {anime.generos && anime.generos.length > 0 && (
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">
                  Géneros
                </p>
                <p className="text-sm text-text">
                  {anime.generos.slice(0, 2).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded font-semibold hover:opacity-90 transition">
              <i className="fas fa-play text-sm" />
              Ver Ahora
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition">
              <i className="fas fa-heart text-sm" />
              Favorito
            </button>
          </div>
        </div>
      </div>

      {/* Sinopsis */}
      {anime.sinopsis && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text mb-4">Sinopsis</h2>
          <p className="text-sm text-muted leading-relaxed line-clamp-4">
            {anime.sinopsis}
          </p>
        </div>
      )}

      {/* Géneros */}
      {anime.generos && anime.generos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-text mb-4">Géneros</h2>
          <div className="flex flex-wrap gap-2">
            {anime.generos.map(genero => (
              <Link
                key={genero}
                href={`/buscar?genero=${encodeURIComponent(genero)}`}
                className="px-3 py-1 rounded bg-bg3 border border-border2 text-xs font-semibold text-muted hover:text-primary hover:border-primary transition"
              >
                {genero}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
