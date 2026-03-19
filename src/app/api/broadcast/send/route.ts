import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { sendBroadcast } from '@/lib/whatsapp/elevenza'

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      sent: 0, failed: 0, total: 0,
      message: 'Demo mode — configure Supabase + 11za to send real broadcasts',
      _demo: true,
    })
  }

  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { broadcast_id, shop_id } = body

    const { data: broadcast } = await supabase
      .from('broadcasts')
      .select('*')
      .eq('id', broadcast_id)
      .single()

    if (!broadcast) return NextResponse.json({ error: 'Broadcast not found' }, { status: 404 })

    const { data: shop } = await supabase
      .from('shops')
      .select('eleven_za_api_key')
      .eq('id', shop_id)
      .single()

    if (!shop?.eleven_za_api_key) {
      return NextResponse.json({ error: '11za API key not configured' }, { status: 400 })
    }

    let query = supabase.from('customers').select('whatsapp_number').eq('shop_id', shop_id)
    if (broadcast.audience_segment !== 'all') {
      query = query.contains('tags', [broadcast.audience_segment])
    }

    const { data: customers } = await query
    if (!customers || customers.length === 0) {
      return NextResponse.json({ error: 'No customers found for segment' }, { status: 400 })
    }

    const numbers = customers.map((c: any) => c.whatsapp_number)
    const result = await sendBroadcast({
      numbers,
      message: broadcast.message_text,
      apiKey: shop.eleven_za_api_key,
    })

    await supabase
      .from('broadcasts')
      .update({ sent_count: result.sent, sent_at: new Date().toISOString(), status: result.sent > 0 ? 'sent' : 'failed' })
      .eq('id', broadcast_id)

    return NextResponse.json({ ...result, total: numbers.length })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
