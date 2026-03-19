import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { prompt, shop_id } = await req.json()
    
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY not found in environment variables')
    }

    let shopName = 'Kirana Shop'
    if (shop_id) {
      const supabase = createAdminClient()
      const { data: shop } = await supabase.from('shops').select('shop_name').eq('id', shop_id).single()
      if (shop) shopName = shop.shop_name
    }

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: `You are a WhatsApp marketing message generator for ${shopName}, a kirana shop. 
            Write engaging, friendly Hindi/Hinglish messages that feel personal. 
            Keep messages under 200 characters. Use emojis. 
            Prompt describe karega kya offer ya product message likhna hai.`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) throw new Error(`Mistral API error: ${response.status}`)
    const data = await response.json()
    const message = data.choices[0]?.message?.content || ''
    
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
