'use client'

import { useState } from 'react'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import SeasonGrid from '@/components/sections/SeasonGrid'
import { useSeasonAnimes, useSeasonCounts } from '@/lib/hooks/useSeasons'

const SEASONS = [
  { id: 'invierno', label: '❄️ Invierno', months: 'Dic - Feb' },
  { id: 'primavera', label: '🌸 Primavera', months: 'Mar - May' },
  { id: 'verano', label: '☀️ Verano', months: 'Jun - Ago' },
  { id: 'otono', label: '🍂 Otoño', months: 'Sep - Nov' }
]

export default function SeasonPage() {
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()
  const { counts, loading: countsLoading } = useSeasonCounts(currentYear)

  // Obtener todos los datos de temporadas
  const invierno = useSeasonAnimes('invierno', currentYear)
  const primavera = useSeasonAnimes('primavera', currentYear)
  const verano = useSeasonAnimes('verano', currentYear)
  const otono = useSeasonAnimes('otono', currentYear)

  const seasonsData = {
    invierno,
    primavera,
    verano,
    otono
  }

  const viewMode = selectedSeason ? 'detail' : 'grid'
  const currentSeasonData = selectedSeason ? seasonsData[selectedSeason as keyof typeof seasonsData] : null

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text mb-2">Temporadas de Anime</h1>
            <p className="text-muted">Año {currentYear} - Todos los estrenos</p>
          </div>

          {/* Season Selector */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
              {SEASONS.map(season => {
                const count = counts[season.id] || 0
                return (
                  <button
                    key={season.id}
                    onClick={() => setSelectedSeason(season.id)}
                    className="p-4 rounded border border-border hover:border-primary bg-bg2 hover:bg-bg3 transition cursor-pointer group"
                  >
                    <div className="text-2xl mb-2 group-hover:scale-125 transition">
                      {season.label.split(' ')[0]}
                    </div>
                    <h3 className="font-bold text-text mb-1">{season.label.split(' ').slice(1).join(' ')}</h3>
                    <p className="text-xs text-muted mb-3">{season.months}</p>
                    <p className="text-xs font-semibold text-primary">
                      {countsLoading ? '...' : `${count} animes`}
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Detail View */}
          {selectedSeason && currentSeasonData && (
            <div className="mb-12">
              <button
                onClick={() => setSelectedSeason(null)}
                className="mb-6 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition"
              >
                <i className="fas fa-chevron-left mr-2" />
                Volver
              </button>
              <SeasonGrid
                animes={currentSeasonData.animes}
                season={selectedSeason}
                loading={currentSeasonData.loading}
              />
            </div>
          )}

          {/* Grid View - All Seasons */}
          {viewMode === 'grid' && (
            <div className="space-y-12">
              {SEASONS.map(season => (
                <div key={season.id}>
                  <SeasonGrid
                    animes={seasonsData[season.id as keyof typeof seasonsData].animes}
                    season={season.id}
                    loading={seasonsData[season.id as keyof typeof seasonsData].loading}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {viewMode === 'grid' &&
            SEASONS.every(s => seasonsData[s.id as keyof typeof seasonsData].animes.length === 0) && (
              <div className="text-center py-20">
                <i className="fas fa-calendar-days text-6xl text-border-2 mb-4 block" />
                <p className="text-muted text-lg">No hay animes en temporada disponibles</p>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
