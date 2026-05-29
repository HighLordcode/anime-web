'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import { useSearchAnime } from '@/lib/hooks/useAnimes'
import { Anime } from '@/lib/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const { results, loading, error } = useSearchAnime(query)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-6">Búsqueda de Anime</h1>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar anime por nombre..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full px-4 py-3 bg-bg2 border border-border rounded text-text placeholder-muted focus:outline-none focus:border-primary transition"
                autoFocus
              />
              <i className="fas fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-muted" />
            </div>

            {query && (
              <p className="text-sm text-muted mt-3">
                Resultados para: <span className="text-primary font-semibold">"{query}"</span>
              </p>
            )}
          </div>

          {/* Results */}
          {!query ? (
            <div className="text-center py-20">
              <i className="fas fa-search text-6xl text-border-2 mb-4 block" />
              <p className="text-muted text-lg">Escribe algo para buscar animes</p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-auto-fill gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="skeleton-loading rounded h-48 animate-pulse bg-bg3" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <i className="fas fa-exclamation-triangle text-6xl text-error mb-4 block" />
              <p className="text-error text-lg">Error al buscar</p>
              <p className="text-muted text-sm mt-2">Intenta de nuevo más tarde</p>
            </div>
          ) : results.length > 0 ? (
            <div>
              <p className="text-sm text-muted mb-6">
                Se encontraron <span className="font-semibold text-text">{results.length}</span> animes
              </p>
              <div className="grid grid-cols-auto-fill gap-3 auto-cols-max">
                {results.map(anime => (
                  <AnimeSearchCard key={anime.id} anime={anime} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <i className="fas fa-inbox text-6xl text-border-2 mb-4 block" />
              <p className="text-muted text-lg">No se encontraron resultados</p>
              <p className="text-muted text-sm mt-2">Intenta con otro término de búsqueda</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

interface AnimeSearchCardProps {
  anime: Anime
}

function AnimeSearchCard({ anime }: AnimeSearchCardProps) {
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
            {anime.estado === 'EN_EMISION' ? (
              <span className="text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                En emisión
              </span>
            ) : (
              <span className="text-muted-2">Finalizado</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  )
}
