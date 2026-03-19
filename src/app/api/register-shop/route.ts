import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { user_id, shop_name, whatsapp_number } = await req.json()

    if (!user_id || !shop_name) {
      return NextResponse.json({ error: 'user_id and shop_name are required' }, { status: 400 })
    }

    // Use admin client — bypasses RLS so shop can be created even before email confirmation
    const supabase = createAdminClient()

    // Check if shop already exists for this user (avoid duplicates on re-register)
    const { data: existing } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', user_id)
      .single()

    if (existing) {
      // Shop already exists — not an error, just return OK
      return NextResponse.json({ success: true, shop_id: existing.id })
    }

    const { data, error } = await supabase
      .from('shops')
      .insert({
        user_id,
        shop_name,
        whatsapp_number: whatsapp_number || '',
        is_active: true,
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, shop_id: data.id })
  } catch (error: any) {
    console.error('[register-shop]', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
