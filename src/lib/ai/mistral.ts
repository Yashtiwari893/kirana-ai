// Mistral AI - Structured Order Parsing
import { OrderItem, Product } from '@/lib/types/database'

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'

export interface ParsedOrder {
  items: ParsedItem[]
  clarification_needed: string | null
  confidence: number
}

export interface ParsedItem {
  name: string
  quantity: number
  unit: string
  original_text: string
}

export async function parseOrderWithMistral(
  message: string,
  catalog: Product[]
): Promise<ParsedOrder> {
  const catalogText = catalog
    .filter(p => p.is_active)
    .map(p => `- ${p.name} (${p.name_aliases.join(', ')}) | Price: ₹${p.price}/${p.unit} | Stock: ${p.stock_qty}`)
    .join('\n')

  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: `You are an AI order parser for a kirana (Indian grocery) shop. 
Extract order items from customer messages written in Hindi, Hinglish, or English.

Shop Catalog:
${catalogText}

Rules:
1. Extract each item with its quantity and unit
2. Match items to catalog using name or aliases (aata=flour=wheat, tel=oil, cheeni=sugar, etc.)
3. If quantity not specified, assume 1 unit
4. Common Hindi units: kg=kilogram, litre/liter=litre, packet=packet, dozen=12 pieces
5. If items are unclear or not in catalog, note them in clarification_needed
6. Return confidence 0-1 based on how clearly items are understood

Respond ONLY with valid JSON matching this schema:
{
  "items": [
    {
      "name": "product name from catalog or original",
      "quantity": 1.0,
      "unit": "kg/litre/piece/packet",
      "original_text": "what customer wrote"
    }
  ],
  "clarification_needed": "null or question to ask customer",
  "confidence": 0.95
}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
      max_tokens: 800,
      response_format: { type: 'json_object' }
    }),
  })

  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || '{}'

  try {
    return JSON.parse(content) as ParsedOrder
  } catch {
    return { items: [], clarification_needed: 'Maafi chahta hoon, order samajh nahi aaya. Please dobara likhein.', confidence: 0 }
  }
}

export async function generateBroadcastMessage(
  prompt: string,
  shopName: string
): Promise<string> {
  const response = await fetch(MISTRAL_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        {
          role: 'system',
          content: `You are a WhatsApp marketing message generator for ${shopName}, a kirana shop.
Write engaging, friendly Hindi/Hinglish messages that feel personal.
Keep messages under 200 characters. Use emojis appropriately.
Focus on offers, deals, and creating urgency without being spammy.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300,
    }),
  })

  if (!response.ok) throw new Error(`Mistral API error: ${response.status}`)
  
  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

export function matchProductsToOrder(
  parsedItems: ParsedItem[],
  catalog: Product[]
): OrderItem[] {
  return parsedItems.map(item => {
    // Try to find matching product
    const normalizedName = item.name.toLowerCase().trim()
    
    const match = catalog.find(p => {
      if (!p.is_active) return false
      const names = [p.name, ...p.name_aliases].map(n => n.toLowerCase())
      return names.some(n => 
        n.includes(normalizedName) || normalizedName.includes(n)
      )
    })

    return {
      product_id: match?.id || null,
      name: match?.name || item.name,
      quantity: item.quantity,
      unit: item.unit || match?.unit || 'piece',
      price: match ? match.price * item.quantity : 0,
      matched: !!match,
    }
  })
}
