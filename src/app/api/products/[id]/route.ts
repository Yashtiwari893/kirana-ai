import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    const body = await req.json()
    return NextResponse.json({ data: { id: params.id, ...body, _demo: true } })
  }
  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { data, error } = await supabase.from('products').update(body).eq('id', params.id).select().single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, _demo: true })
  }
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('products').update({ is_active: false }).eq('id', params.id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
