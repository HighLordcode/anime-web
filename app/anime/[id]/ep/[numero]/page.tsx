import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import VideoPlayer from '@/components/sections/VideoPlayer'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Episodio, Anime } from '@/lib/types'

interface EpisodePageProps {
  params: {
    id: string
    numero: string
  }
}

export async function generateMetadata({
  params
}: EpisodePageProps): Promise<Metadata> {
  const supabase = getSupabaseAdmin()

  // Obtener anime
  const { data: anime } = await supabase
    .from('animes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!anime) {
    return {
      title: 'Episodio no encontrado'
    }
  }

  return {
    title: `${anime.titulo} - Episodio ${params.numero} | Anime Online`,
    description: `Ver ${anime.titulo} episodio ${params.numero} online con subtítulos en español`,
    openGraph: {
      title: `${anime.titulo} - Episodio ${params.numero}`,
      description: `Ver ${anime.titulo} episodio ${params.numero} online`,
      images: [
        {
          url: anime.portada_url,
          width: 300,
          height: 450
        }
      ]
    }
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const supabase = getSupabaseAdmin()
  const episodeNumber = parseInt(params.numero)

  // Obtener anime
  const { data: anime } = await supabase
    .from('animes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!anime) {
    notFound()
  }

  // Obtener episodio actual
  const { data: episode } = await supabase
    .from('episodios')
    .select('*')
    .eq('anime_id', params.id)
    .eq('numero', episodeNumber)
    .single()

  if (!episode) {
    notFound()
  }

  // Obtener episodios anteriores y siguientes
  const { data: previousEpisode } = await supabase
    .from('episodios')
    .select('*')
    .eq('anime_id', params.id)
    .eq('numero', episodeNumber - 1)
    .single()

  const { data: nextEpisode } = await supabase
    .from('episodios')
    .select('*')
    .eq('anime_id', params.id)
    .eq('numero', episodeNumber + 1)
    .single()

  // Obtener otros episodios recientes
  const { data: recentEpisodes = [] } = await supabase
    .from('episodios')
    .select('*')
    .eq('anime_id', params.id)
    .neq('numero', episodeNumber)
    .order('numero', { ascending: false })
    .limit(8)

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-muted mb-6">
            <Link href="/" className="hover:text-primary transition">
              Inicio
            </Link>
            <i className="fas fa-chevron-right" />
            <Link
              href={`/anime/${anime.id}`}
              className="hover:text-primary transition"
            >
              {anime.titulo}
            </Link>
            <i className="fas fa-chevron-right" />
            <span>Episodio {episodeNumber}</span>
          </nav>

          {/* Video Player */}
          <VideoPlayer
            title={anime.titulo}
            episodeNumber={episodeNumber}
            links={(episode as Episodio).enlaces || {}}
          />

          {/* Episode Info */}
          <div className="mt-8 p-6 bg-bg2 border border-border rounded">
            <h2 className="text-lg font-bold text-text mb-2">
              {(episode as Episodio).titulo || `Episodio ${episodeNumber}`}
            </h2>
            {(episode as Episodio).sinopsis && (
              <p className="text-sm text-muted leading-relaxed mb-4">
                {(episode as Episodio).sinopsis}
              </p>
            )}
            <div className="flex gap-4 text-xs text-muted">
              {(episode as Episodio).fecha_estreno && (
                <div>
                  <span className="text-muted-2">Fecha de estreno:</span>{' '}
                  {new Date((episode as Episodio).fecha_estreno).toLocaleDateString(
                    'es-ES'
                  )}
                </div>
              )}
              {(episode as Episodio).duracion_minutos && (
                <div>
                  <span className="text-muted-2">Duración:</span>{' '}
                  {(episode as Episodio).duracion_minutos} min
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {previousEpisode && (
              <Link
                href={`/anime/${anime.id}/ep/${previousEpisode.numero}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition"
              >
                <i className="fas fa-chevron-left" />
                Anterior
              </Link>
            )}
            <Link
              href={`/anime/${anime.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition"
            >
              <i className="fas fa-list" />
              Ver todos
            </Link>
            {nextEpisode && (
              <Link
                href={`/anime/${anime.id}/ep/${nextEpisode.numero}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-primary text-white rounded font-semibold hover:opacity-90 transition"
              >
                Siguiente
                <i className="fas fa-chevron-right" />
              </Link>
            )}
          </div>

          {/* More Episodes */}
          {recentEpisodes.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-text mb-6">Más episodios</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {recentEpisodes.map(ep => (
                  <Link
                    key={ep.id}
                    href={`/anime/${anime.id}/ep/${ep.numero}`}
                    className={`relative rounded overflow-hidden border transition ${
                      ep.numero === episodeNumber
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <div className="aspect-video bg-black/50 relative overflow-hidden">
                      {ep.imagen_url ? (
                        <Image
                          src={ep.imagen_url}
                          alt={`Ep ${ep.numero}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-image text-muted text-lg" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <i className="fas fa-play text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-1 bg-black/75 px-1.5 py-0.5 rounded text-xs font-bold text-white">
                      {ep.numero}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
