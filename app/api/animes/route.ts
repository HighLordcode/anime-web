import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '25')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = getSupabaseAdmin()

    const { data, count, error } = await supabase
      .from('animes')
      .select('*', { count: 'exact' })
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
      total: count,
      page: Math.ceil(offset / limit) + 1,
      limit
    })
  } catch (error) {
    console.error('Error fetching animes:', error)
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
      .from('animes')
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
    console.error('Error creating anime:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
