import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/shared/Header'
import Footer from '@/components/shared/Footer'
import AnimeDetails from '@/components/sections/AnimeDetails'
import EpisodesList from '@/components/sections/EpisodesList'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Anime, Episodio } from '@/lib/types'

interface AnimePageProps {
  params: {
    id: string
  }
}

// Generar metadata dinámicamente
export async function generateMetadata({
  params
}: AnimePageProps): Promise<Metadata> {
  const supabase = getSupabaseAdmin()
  const { data: anime } = await supabase
    .from('animes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!anime) {
    return {
      title: 'Anime no encontrado'
    }
  }

  return {
    title: `${anime.titulo} | Anime Online`,
    description: anime.sinopsis || 'Ver anime online',
    openGraph: {
      title: anime.titulo,
      description: anime.sinopsis || 'Ver anime online',
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

export default async function AnimePage({ params }: AnimePageProps) {
  const supabase = getSupabaseAdmin()

  // Obtener anime
  const { data: anime, error: animeError } = await supabase
    .from('animes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (animeError || !anime) {
    notFound()
  }

  // Obtener episodios
  const { data: episodes = [] } = await supabase
    .from('episodios')
    .select('*')
    .eq('anime_id', params.id)
    .order('numero', { ascending: true })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
          {/* Detalles del anime */}
          <AnimeDetails anime={anime as Anime} />

          {/* Episodios */}
          <section className="mt-12 border-t border-border pt-8">
            <EpisodesList
              episodes={episodes as Episodio[]}
              animeId={params.id}
            />
          </section>

          {/* Información adicional */}
          {anime.url_jikan && (
            <section className="mt-12 pt-8 border-t border-border">
              <div className="flex gap-3">
                <a
                  href={anime.url_jikan}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-bg3 border border-border2 text-muted rounded font-semibold hover:border-primary hover:text-primary transition"
                >
                  <i className="fas fa-external-link text-xs" />
                  Ver en MyAnimeList
                </a>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
