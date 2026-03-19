/**
 * 11za WhatsApp API Integration (V2)
 * Fully Dynamic - Uses Shop-Specific Credentials from DB
 */

const BASE_URL = 'https://api.11za.in/apis'

export interface WhatsAppCredentials {
  authToken: string
  originWebsite: string
}

export interface WhatsAppMessage {
  to: string
  message: string
  credentials: WhatsAppCredentials
}

/**
 * Send Session Message (Standard Chat)
 * Endpoint: /chat/sendMessage
 */
export async function sendWhatsAppMessage({ to, message, credentials }: WhatsAppMessage) {
  const { authToken, originWebsite } = credentials

  if (!authToken || !originWebsite) {
    console.error('[11za] Missing credentials:', { hasToken: !!authToken, hasOrigin: !!originWebsite })
    return { success: false, error: 'Missing 11za credentials in database' }
  }

  const cleanNumber = to.replace(/\D/g, '')

  try {
    const response = await fetch(`${BASE_URL}/chat/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authToken,
        originWebsite,
        recipient: cleanNumber,
        message: message,
        type: "text"
      })
    })

    const data = await response.json()
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || '11za API Error')
    }
    
    return { success: true, data }
  } catch (error: any) {
    console.error('[11za] Send error:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Send Template Message (Used for broadcasts)
 */
export async function sendTemplateMessage({ to, templateName, components, credentials }: any) {
  const { authToken, originWebsite } = credentials
  const cleanNumber = to.replace(/\D/g, '')

  try {
    const response = await fetch(`${BASE_URL}/template/sendTemplate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authToken,
        originWebsite,
        recipient: cleanNumber,
        templateName,
        components: components || []
      })
    })

    const data = await response.json()
    return { success: response.ok, data }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Bulk Broadcast
 */
export async function sendBroadcast({ numbers, message, authToken }: { numbers: string[], message: string, authToken: string }) {
  const results = { sent: 0, failed: 0 }
  
  for (const number of numbers) {
    const res = await sendWhatsAppMessage({ 
      to: number, 
      message, 
      credentials: { authToken, originWebsite: process.env.NEXT_PUBLIC_APP_URL || 'https://kiranaai.vercel.app' } 
    })
    if (res.success) results.sent++
    else results.failed++
  }
  
  return results
}

/**
 * Formatting Utilities
 */
export function formatOrderConfirmation(items: any[], total: number, orderId: string) {
  let msg = `✅ *Order Confirm Ho Gaya!*\n`
  msg += `🔢 Order #${orderId.slice(-6).toUpperCase()}\n\n`
  msg += `🛒 *Items:*\n`
  items.forEach(item => {
    msg += `• ${item.name}: ${item.quantity} ${item.unit} = ₹${item.price}\n`
  })
  msg += `\n💰 *Total Amount: ₹${total}*\n`
  msg += `📍 Shop se delivery nikalne wali hai. 🙏`
  return msg
}

export function formatStatusUpdate(orderId: string, status: string, total: number) {
  const statusMap: any = { received: '📥 Mil gaya', packed: '📦 Pack ho gaya', delivered: '✅ Deliver ho gaya' }
  return `📢 *Order Update:*\n\nOrder #${orderId.slice(-6).toUpperCase()}\nStatus: ${statusMap[status] || status}\nAmount: ₹${total}\n\nDhanyawad! 🙏`
}

export function formatCatalogMessage(products: any[]) {
  let msg = `🛒 *Hamara Catalog:*\n\n`
  const cats = Array.from(new Set(products.map(p => p.category)))
  cats.forEach(c => {
    msg += `*${c}:*\n`
    products.filter(p => p.category === c).forEach(p => msg += `• ${p.name} - ₹${p.price}/${p.unit}\n`)
    msg += `\n`
  })
  msg += `Order ke liye items likhein!`
  return msg
}
