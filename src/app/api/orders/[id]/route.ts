import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'
import { sendWhatsAppMessage, formatStatusUpdate } from '@/lib/whatsapp/elevenza'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    // Demo mode: just return success
    const body = await req.json()
    return NextResponse.json({ data: { id: params.id, ...body, _demo: true } })
  }

  try {
    const supabase = createAdminClient()
    const body = await req.json()
    const { status, cancel_reason } = body

    const { data: order } = await supabase
      .from('orders')
      .select('*, shops(eleven_za_api_key), customers(whatsapp_number)')
      .eq('id', params.id)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const updateData: any = { status }
    if (cancel_reason) updateData.cancel_reason = cancel_reason

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Auto-notify customer via WhatsApp
    const apiKey = (order as any).shops?.eleven_za_api_key
    const customerPhone = (order as any).customers?.whatsapp_number
    if (apiKey && customerPhone) {
      const statusMsg = formatStatusUpdate(params.id, status, order.total_amount)
      await sendWhatsAppMessage({ to: customerPhone, message: statusMsg, apiKey })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Demo mode — connect Supabase' }, { status: 503 })
  }
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(name, whatsapp_number, tags)')
      .eq('id', params.id)
      .single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
