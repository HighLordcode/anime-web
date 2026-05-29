import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getSupabaseAdmin } from '@/lib/supabase'

interface JikanAnime {
  mal_id: number
  url: string
  images: {
    jpg: {
      image_url: string
      large_image_url: string
    }
  }
  trailer?: {
    youtube_id: string
  }
  titles: Array<{
    type: string
    title: string
  }>
  title: string
  title_english?: string
  title_japanese?: string
  type: string
  episodes?: number
  status: string
  aired: {
    from: string
    to?: string
  }
  aired_string?: string
  synopsis: string
  background?: string
  season?: string
  year?: number
  broadcast?: {
    day: string
    time: string
    timezone: string
  }
  producers: Array<{ mal_id: number; type: string; name: string; url: string }>
  licensors: Array<{ mal_id: number; type: string; name: string; url: string }>
  studios: Array<{ mal_id: number; type: string; name: string; url: string }>
  genres: Array<{ mal_id: number; type: string; name: string; url: string }>
  explicit_genres: Array<{ mal_id: number; type: string; name: string; url: string }>
  themes: Array<{ mal_id: number; type: string; name: string; url: string }>
  demographics: Array<{ mal_id: number; type: string; name: string; url: string }>
  score: number
  scored_by: number
  rank?: number
  popularity: number
  members: number
  rating: string
}

const JIKAN_API_URL = 'https://api.jikan.moe/v4'

async function fetchAnimeFromJikan(page = 1, limit = 25) {
  try {
    const response = await axios.get(`${JIKAN_API_URL}/anime`, {
      params: {
        page,
        limit,
        min_score: 6,
        order_by: 'score',
        sort: 'desc',
        status: 'airing'
      },
      timeout: 10000
    })
    return response.data
  } catch (error) {
    console.error('Error fetching from Jikan:', error)
    throw error
  }
}

function transformJikanAnimeToSupabase(jikanAnime: JikanAnime) {
  return {
    jikan_id: jikanAnime.mal_id,
    titulo: jikanAnime.title || jikanAnime.titles?.[0]?.title || 'Sin título',
    titulo_alternativo: jikanAnime.title_english || jikanAnime.title_japanese,
    portada_url: jikanAnime.images?.jpg?.large_image_url || jikanAnime.images?.jpg?.image_url,
    sinopsis: jikanAnime.synopsis || 'Sin sinopsis',
    estado: jikanAnime.status === 'Finished Airing' ? 'FINALIZADO' : 'EN_EMISION',
    generos: jikanAnime.genres?.map(g => g.name) || [],
    puntuacion: jikanAnime.score || 0,
    episodios_totales: jikanAnime.episodes || 0,
    tipo: jikanAnime.type,
    url_jikan: jikanAnime.url,
    temporada: jikanAnime.season,
    anio: jikanAnime.year,
    estudio: jikanAnime.studios?.map(s => s.name).join(', ') || '',
    ranking: jikanAnime.rank || null,
    popularidad: jikanAnime.popularity || 0,
    total_miembros: jikanAnime.members || 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get('source') || 'jikan'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const dryRun = searchParams.get('dryRun') === 'true'

    if (source !== 'jikan') {
      return NextResponse.json(
        { success: false, error: 'Solo source=jikan está soportado actualmente' },
        { status: 400 }
      )
    }

    // Obtener datos de Jikan
    const jikanData = await fetchAnimeFromJikan(page, limit)
    const supabase = getSupabaseAdmin()

    let syncedCount = 0
    let errorCount = 0
    const results = []

    for (const anime of jikanData.data) {
      try {
        const transformedAnime = transformJikanAnimeToSupabase(anime)

        if (!dryRun) {
          // Verificar si el anime ya existe
          const { data: existing } = await supabase
            .from('animes')
            .select('id')
            .eq('jikan_id', anime.mal_id)
            .single()

          if (existing) {
            // Actualizar
            await supabase
              .from('animes')
              .update(transformedAnime)
              .eq('jikan_id', anime.mal_id)
          } else {
            // Insertar
            await supabase
              .from('animes')
              .insert([transformedAnime])
          }
        }

        syncedCount++
        results.push({
          title: transformedAnime.titulo,
          malId: anime.mal_id,
          status: 'success'
        })
      } catch (error) {
        errorCount++
        results.push({
          title: anime.title,
          malId: anime.mal_id,
          status: 'error',
          error: (error as Error).message
        })
      }
    }

    return NextResponse.json({
      success: true,
      source,
      page,
      limit,
      dryRun,
      synced: syncedCount,
      errors: errorCount,
      total: jikanData.pagination?.last_visible_page || 1,
      results: dryRun ? results.slice(0, 5) : undefined,
      message: `Sincronización completada: ${syncedCount} exitosos, ${errorCount} errores`
    })
  } catch (error) {
    console.error('Sync error:', error)
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}
