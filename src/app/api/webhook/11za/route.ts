import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient, isSupabaseConfigured } from '@/lib/supabase/server'

/**
 * GET - WhatsApp Webhook Verification
 * This is used by Meta/11za to verify the URL
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  // verify_token should match your secret
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'kirana_ai_secret'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Webhook] Verification Successful')
    return new Response(challenge, { status: 200 })
  }

  console.error('[Webhook] Verification Failed - Tokens do not match')
  return new Response('Verification failed', { status: 403 })
}

/**
 * POST - Incoming WhatsApp Events
 */
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ 
      status: 'demo', 
      message: 'Demo mode — connect Supabase to process real orders.' 
    })
  }

  try {
    const body = await req.json()
    
    // Dynamically import logic to avoid top-level env issues
    const { handleIncomingMessage } = await import('./handler')
    await handleIncomingMessage(body)
    
    return NextResponse.json({ status: 'ok' })
  } catch (error: any) {
    console.error('[Webhook Error]:', error.message)
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
  }
}
