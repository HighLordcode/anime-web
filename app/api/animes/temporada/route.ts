import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1
  if ([12, 1, 2].includes(month)) return 'invierno'
  if ([3, 4, 5].includes(month)) return 'primavera'
  if ([6, 7, 8].includes(month)) return 'verano'
  return 'otono'
}

const VALID_SEASONS = ['invierno', 'primavera', 'verano', 'otono']

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const season = searchParams.get('season')?.toLowerCase() || getCurrentSeason()
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validar temporada
    if (!VALID_SEASONS.includes(season)) {
      return NextResponse.json(
        { success: false, error: `Temporada inválida. Usa: ${VALID_SEASONS.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdmin()

    // Obtener animes por temporada y año
    const { data, count, error } = await supabase
      .from('animes')
      .select('*', { count: 'exact' })
      .eq('temporada', season)
      .eq('anio', year)
      .eq('estado', 'EN_EMISION')
      .order('puntuacion', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      season,
      year,
      total: count,
      page: Math.ceil(offset / limit) + 1,
      limit
    })
  } catch (error) {
    console.error('Error fetching season animes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
