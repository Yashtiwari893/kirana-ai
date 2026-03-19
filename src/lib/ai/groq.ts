// Groq API - Fast Intent Detection
export interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type Intent = 'order' | 'catalog' | 'status' | 'help' | 'cancel' | 'payment' | 'greeting' | 'unknown'

export interface IntentResult {
  intent: Intent
  confidence: number
  language: 'hindi' | 'hinglish' | 'english'
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

export async function detectIntent(message: string): Promise<IntentResult> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are an intent classifier for a kirana (grocery) shop WhatsApp bot.
Classify the user's message into one of these intents:
- order: Customer wants to place an order (e.g., "2kg aata chahiye", "ek litre tel do")
- catalog: Customer wants to see product list/menu (e.g., "kya kya hai", "list bhejo", "rates batao")  
- status: Customer asking about their order status (e.g., "mera order kab aayega", "order kahan hai")
- cancel: Customer wants to cancel an order (e.g., "order cancel karo", "nahi chahiye")
- payment: Customer asking about payment/bill (e.g., "kitne paise", "UPI number do")
- help: Customer needs assistance
- greeting: Just saying hello/hi/namaste
- unknown: Cannot determine intent

Also detect language: hindi (mostly Devanagari), hinglish (Hindi words in English script), english (mostly English)

Respond ONLY with JSON: {"intent": "...", "confidence": 0.0-1.0, "language": "..."}`
        },
        { role: 'user', content: message }
      ],
      temperature: 0.1,
      max_tokens: 100,
    }),
  })

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || '{}'
  
  try {
    return JSON.parse(content) as IntentResult
  } catch {
    return { intent: 'unknown', confidence: 0, language: 'hinglish' }
  }
}

export async function generateGroqResponse(
  messages: GroqMessage[],
  systemPrompt: string
): Promise<string> {
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  if (!response.ok) throw new Error(`Groq API error: ${response.status}`)
  
  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}
