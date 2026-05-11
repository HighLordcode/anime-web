import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const anime_id = searchParams.get('anime_id')

    const supabase = getSupabaseAdmin()

    let query = supabase
      .from('episodios')
      .select('*', { count: 'exact' })
      .order('fecha_estreno', { ascending: false })
      .range(offset, offset + limit - 1)

    if (anime_id) {
      query = query.eq('anime_id', anime_id)
    }

    const { data, count, error } = await query

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('episodios')
      .insert([body])
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, data: data[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating episode:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
