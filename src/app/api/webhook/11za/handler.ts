// Meta Cloud API Webhook Handler
import { createAdminClient } from '@/lib/supabase/server'
import { detectIntent } from '@/lib/ai/groq'
import { parseOrderWithMistral, matchProductsToOrder } from '@/lib/ai/mistral'
import { 
  sendWhatsAppMessage, 
  formatOrderConfirmation, 
  formatCatalogMessage, 
  formatStatusUpdate 
} from '@/lib/whatsapp/elevenza'

/**
 * Parses Meta Cloud API standard payload
 */
function parseWhatsAppPayload(body: any) {
  try {
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]
    const contact = value?.contacts?.[0]
    
    if (!message) return null

    return {
      from: message?.from, // WhatsApp Number
      name: contact?.profile?.name || null,
      message_text: message?.text?.body || null,
      message_id: message?.id,
      timestamp: message?.timestamp,
      phone_number_id: value?.metadata?.phone_number_id
    }
  } catch (e) {
    console.error('[Parser] Failed to parse payload:', e)
    return null
  }
}

export async function handleIncomingMessage(body: any) {
  const data = parseWhatsAppPayload(body)
  if (!data || !data.message_text) return

  const { from, message_text, name, phone_number_id } = data
  const supabase = createAdminClient()

  // 11za routing: identify shop by phone_number_id in metadata
  const { data: shop } = await supabase
    .from('shops')
    .select('*')
    .eq('eleven_za_phone_id', phone_number_id)
    .eq('is_active', true)
    .single()

  if (!shop) {
    console.error(`[11za] No shop found for ID: ${phone_number_id}`)
    return
  }

  const wpToken = shop.eleven_za_api_key
  if (!wpToken) return

  // Auto-register or fetch customer
  let { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('shop_id', shop.id)
    .eq('whatsapp_number', from)
    .single()

  if (!customer) {
    const { data: newCustomer } = await supabase
      .from('customers')
      .insert({ shop_id: shop.id, whatsapp_number: from, name: name, tags: ['new'], total_orders: 0, total_spend: 0, reorder_score: 0 })
      .select()
      .single()
    customer = newCustomer
  }

  // ── STEP 1: Groq fast intent detection ──────────────────────
  const intentResult = await detectIntent(message_text)
  console.log(`[Webhook] ${from} (${shop.shop_name}) → ${intentResult.intent}`)
  const credentials = {
    authToken: shop.eleven_za_api_key,
    originWebsite: shop.origin_website
  }

  const wpParams = { credentials }

  switch (intentResult.intent) {
    case 'order': {
      // ── STEP 2: Mistral order parsing ──────────────────────
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('is_active', true)

      if (!products?.length) {
        await sendWhatsAppMessage({ to: from, message: 'Hamari shop pe abhi koi products available nahi hain.', ...wpParams })
        return
      }

      const parsed = await parseOrderWithMistral(message_text, products)

      if (parsed.clarification_needed || !parsed.items.length) {
        await sendWhatsAppMessage({ to: from, message: parsed.clarification_needed || 'Samajh nahi aaya. Please items aur quantity likhein jaise: 2kg aata, 1 litre tel', ...wpParams })
        return
      }

      const orderItems = matchProductsToOrder(parsed.items, products)
      const totalAmount = orderItems.reduce((s, i) => s + i.price, 0)

      // ── STEP 3: Supabase order save ──────────────────────
      const { data: order } = await supabase
        .from('orders')
        .insert({
          shop_id: shop.id,
          customer_id: customer?.id,
          items: orderItems,
          total_amount: totalAmount,
          status: 'received',
          payment_status: 'pending',
          raw_message: message_text
        })
        .select()
        .single()

      if (!order) {
        await sendWhatsAppMessage({ to: from, message: 'Order save mein error. Please dobara try karein.', ...wpParams })
        return
      }

      // Update customer stats
      if (customer) {
        await supabase
          .from('customers')
          .update({
            total_orders: (customer.total_orders || 0) + 1,
            total_spend: (customer.total_spend || 0) + totalAmount,
            last_order_at: new Date().toISOString()
          })
          .eq('id', customer.id)
      }

      // ── STEP 4: Send confirmation ──────────────────────
      const confirmMsg = formatOrderConfirmation(orderItems, totalAmount, order.id)
      await sendWhatsAppMessage({ to: from, message: confirmMsg, ...wpParams })
      break
    }

    case 'catalog': {
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('is_active', true)
        .order('category')

      const msg = products?.length ? formatCatalogMessage(products) : 'Abhi koi product available nahi hai.'
      await sendWhatsAppMessage({ to: from, message: msg, ...wpParams })
      break
    }

    case 'status': {
      const { data: lastOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_id', shop.id)
        .eq('customer_id', customer?.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const msg = lastOrder 
        ? formatStatusUpdate(lastOrder.id, lastOrder.status, lastOrder.total_amount)
        : 'Aapka koi order nahi mila. Order karne ke liye items ki list likhein!'
      await sendWhatsAppMessage({ to: from, message: msg, ...wpParams })
      break
    }

    case 'greeting':
    default:
      await sendWhatsAppMessage({ 
        to: from, 
        message: shop.bot_greeting || 'Namaste! Main KiranaAI bot hoon. Order ke liye items likhein jaise: 2kg aata, 1 litre tel\n\n"list" likhein catalog dekhne ke liye.', 
        ...wpParams 
      })
  }
}
