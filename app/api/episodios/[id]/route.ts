import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const supabase = getSupabaseAdmin()

    // Obtener episodio específico
    const { data: episode, error } = await supabase
      .from('episodios')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !episode) {
      return NextResponse.json(
        { success: false, error: 'Episodio no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: episode
    })
  } catch (error) {
    console.error('Error fetching episode:', error)
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
      .from('episodios')
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
    console.error('Error updating episode:', error)
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
      .from('episodios')
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
      message: 'Episodio eliminado'
    })
  } catch (error) {
    console.error('Error deleting episode:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
