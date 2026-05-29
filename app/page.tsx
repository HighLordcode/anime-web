'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import EpisodeGrid from '@/components/sections/EpisodeGrid'
import AnimeSeasonGrid from '@/components/sections/AnimeSeasonGrid'
import { useEpisodes } from '@/lib/hooks/useEpisodes'
import { useAnimes } from '@/lib/hooks/useAnimes'
import { useSeasonAnimes } from '@/lib/hooks/useSeasons'

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if ([12, 1, 2].includes(month)) return 'invierno'
  if ([3, 4, 5].includes(month)) return 'primavera'
  if ([6, 7, 8].includes(month)) return 'verano'
  return 'otono'
}

const SEASON_LABELS: Record<string, string> = {
  invierno: '❄️ Invierno',
  primavera: '🌸 Primavera',
  verano: '☀️ Verano',
  otono: '🍂 Otoño'
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const { episodes, loading: episodesLoading } = useEpisodes()
  const currentSeason = getCurrentSeason()
  const { animes: seasonAnimes, loading: seasonLoading } = useSeasonAnimes(currentSeason)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="w-full max-w-6xl mx-auto px-4">
          {/* Sección: Últimos Episodios */}
          <section className="py-7">
            <div className="section-head">
              <h2 className="section-title">
                <i className="fas fa-fire" />
                Últimos Episodios
              </h2>
              <span className="badge-primary">HOY</span>
            </div>
            {episodesLoading ? (
              <EpisodeGridSkeleton />
            ) : episodes.length > 0 ? (
              <EpisodeGrid episodes={episodes} />
            ) : (
              <EmptyState message="Sin episodios recientes" />
            )}
          </section>

          {/* Sección: Animes de Temporada */}
          <section className="py-7 border-t border-border">
            <div className="section-head">
              <h2 className="section-title">
                <i className="fas fa-calendar-days" />
                {SEASON_LABELS[currentSeason]} {new Date().getFullYear()}
              </h2>
              <Link
                href="/temporada"
                className="text-xs font-semibold text-primary hover:text-primary-dark transition"
              >
                Ver todas <i className="fas fa-arrow-right ml-1" />
              </Link>
            </div>
            {seasonLoading ? (
              <AnimeGridSkeleton />
            ) : seasonAnimes.length > 0 ? (
              <AnimeSeasonGrid animes={seasonAnimes} />
            ) : (
              <EmptyState message="No hay animes en temporada" />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Skeletons
function EpisodeGridSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-2.5 md:grid-cols-3 sm:grid-cols-2">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="skeleton-loading rounded h-40" />
      ))}
    </div>
  )
}

function AnimeGridSkeleton() {
  return (
    <div className="grid grid-cols-auto-fill gap-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="skeleton-loading rounded h-48" />
      ))}
    </div>
  )
}

// Empty State
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <i className="fas fa-inbox text-4xl text-border-2 mb-4 block" />
      <p className="text-muted">{message}</p>
    </div>
  )
}
