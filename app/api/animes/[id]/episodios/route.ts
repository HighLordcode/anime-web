import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = getSupabaseAdmin()

    // Obtener episodios del anime
    const { data, count, error } = await supabase
      .from('episodios')
      .select('*', { count: 'exact' })
      .eq('anime_id', id)
      .order('numero', { ascending: true })
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
      total: count,
      page: Math.ceil(offset / limit) + 1,
      limit
    })
  } catch (error) {
    console.error('Error fetching episodes:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
