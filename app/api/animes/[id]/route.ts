import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = getSupabaseAdmin()

    // Obtener anime por ID
    const { data: anime, error } = await supabase
      .from('animes')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !anime) {
      return NextResponse.json(
        { success: false, error: 'Anime no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: anime
    })
  } catch (error) {
    console.error('Error fetching anime:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('animes')
      .update(body)
      .eq('id', id)
      .select()

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0]
    })
  } catch (error) {
    console.error('Error updating anime:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = getSupabaseAdmin()

    const { error } = await supabase
      .from('animes')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Anime eliminado'
    })
  } catch (error) {
    console.error('Error deleting anime:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
