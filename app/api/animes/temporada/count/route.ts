import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const supabase = getSupabaseAdmin()
    const seasons = ['invierno', 'primavera', 'verano', 'otono']
    const counts: Record<string, number> = {}

    // Obtener conteo de animes por temporada
    for (const season of seasons) {
      const { count, error } = await supabase
        .from('animes')
        .select('id', { count: 'exact', head: true })
        .eq('temporada', season)
        .eq('anio', year)
        .eq('estado', 'EN_EMISION')

      if (!error) {
        counts[season] = count || 0
      }
    }

    return NextResponse.json({
      success: true,
      year,
      counts
    })
  } catch (error) {
    console.error('Error fetching season counts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
