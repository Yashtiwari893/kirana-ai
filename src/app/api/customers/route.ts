import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const tag = searchParams.get('tag')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const shop_id = searchParams.get('shop_id')

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .order('last_order_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (shop_id) query = query.eq('shop_id', shop_id)
    if (tag) query = query.contains('tags', [tag])

    const { data, error, count } = await query
    if (error) throw error
    return NextResponse.json({ data, count })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
