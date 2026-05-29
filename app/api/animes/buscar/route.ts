import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import { getSupabaseAdmin } from '@/lib/supabase'

const JIKAN_API_URL = 'https://api.jikan.moe/v4'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = (page - 1) * limit

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Parámetro "q" es requerido'
        },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Primero intentar buscar en BD local
    const { data: localResults, count: localCount } = await supabase
      .from('animes')
      .select('*', { count: 'exact' })
      .or(
        `titulo.ilike.%${query}%,titulo_alternativo.ilike.%${query}%`
      )
      .order('puntuacion', { ascending: false })
      .range(offset, offset + limit - 1)

    // Si hay resultados en BD local, devolverlos
    if (localResults && localResults.length > 0) {
      return NextResponse.json({
        success: true,
        data: localResults,
        total: localCount,
        query,
        page,
        limit,
        source: 'local'
      })
    }

    // Si no hay en BD local, buscar en Jikan
    const response = await axios.get(`${JIKAN_API_URL}/anime`, {
      params: {
        query: query.trim(),
        page,
        limit,
        order_by: 'score',
        sort: 'desc'
      },
      timeout: 10000
    })

    // Transformar respuesta
    const transformedData = response.data.data.map((anime: any) => ({
      id: `jikan-${anime.mal_id}`,
      jikan_id: anime.mal_id,
      titulo: anime.title || anime.titles?.[0]?.title || 'Sin título',
      titulo_alternativo: anime.title_english || anime.title_japanese,
      portada_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
      sinopsis: anime.synopsis || 'Sin sinopsis',
      estado: anime.status === 'Finished Airing' ? 'FINALIZADO' : 'EN_EMISION',
      generos: anime.genres?.map((g: any) => g.name) || [],
      puntuacion: anime.score || 0,
      episodios_totales: anime.episodes || 0,
      tipo: anime.type,
      url_jikan: anime.url,
      ranking: anime.rank || null,
      popularidad: anime.popularity || 0
    }))

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: {
        page,
        limit,
        has_next_page: response.data.pagination?.has_next_page || false,
        last_visible_page: response.data.pagination?.last_visible_page || 1
      }
    })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        {
          success: false,
          error: error.message
        },
        { status: error.response?.status || 500 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message
      },
      { status: 500 }
    )
  }
}
