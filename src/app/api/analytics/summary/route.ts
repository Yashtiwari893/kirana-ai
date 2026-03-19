import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(req.url)
    const shop_id = searchParams.get('shop_id')

    if (!shop_id) {
      return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 })
    }

    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      { count: totalOrders },
      { count: todayOrders },
      { count: weekOrders },
      { data: revenueData },
      { data: ordersForProducts },
      { count: totalCustomers },
      { data: recentOrders }
    ] = await Promise.all([
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shop_id', shop_id),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shop_id', shop_id).gte('created_at', today.toISOString().split('T')[0]),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('shop_id', shop_id).gte('created_at', weekAgo.toISOString()),
      supabase.from('orders').select('total_amount, created_at, status').eq('shop_id', shop_id).gte('created_at', monthAgo.toISOString()).neq('status', 'cancelled'),
      supabase.from('orders').select('items').eq('shop_id', shop_id).neq('status', 'cancelled'),
      supabase.from('customers').select('*', { count: 'exact', head: true }).eq('shop_id', shop_id),
      supabase.from('orders').select('*, customers(name, whatsapp_number)').eq('shop_id', shop_id).order('created_at', { ascending: false }).limit(5)
    ])

    const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total_amount, 0) || 0
    const todayStr = today.toISOString().split('T')[0]
    const todayRevenue = revenueData?.filter(o => o.created_at.startsWith(todayStr)).reduce((sum, o) => sum + o.total_amount, 0) || 0

    // Last 7 days chart
    const dailyRevenue = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const dayRevenue = revenueData?.filter(o => o.created_at.startsWith(dateStr)).reduce((sum, o) => sum + o.total_amount, 0) || 0
      dailyRevenue.push({
        date: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenue: dayRevenue
      })
    }

    // Process top products from items
    const productCounts: Record<string, any> = {}
    ordersForProducts?.forEach(order => {
      const items = (order.items as any[]) || []
      items.forEach(item => {
        if (!productCounts[item.name]) productCounts[item.name] = { name: item.name, count: 0, revenue: 0 }
        productCounts[item.name].count += (item.quantity || 1)
        productCounts[item.name].revenue += (item.price || 0)
      })
    })
    
    const topProducts = Object.values(productCounts).sort((a, b) => b.revenue - a.revenue).slice(0, 5)

    return NextResponse.json({
      stats: { totalOrders, todayOrders, weekOrders, totalRevenue, todayRevenue, totalCustomers },
      dailyRevenue,
      topProducts,
      recentOrders: recentOrders || []
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
