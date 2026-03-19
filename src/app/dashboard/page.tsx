'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingCart, Users, TrendingUp, Package,
  ArrowUpRight, RefreshCw,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface Stats {
  totalOrders: number; todayOrders: number; weekOrders: number
  totalRevenue: number; todayRevenue: number; totalCustomers: number
}
interface RecentOrder {
  id: string; status: string; total_amount: number
  created_at: string; raw_message: string
  customers: { name: string | null; whatsapp_number: string } | null
}

const STATUS: Record<string, { label: string; cls: string }> = {
  received:  { label: '📥 Received',  cls: 'badge-received' },
  packed:    { label: '📦 Packed',    cls: 'badge-packed' },
  delivered: { label: '✅ Delivered', cls: 'badge-delivered' },
  cancelled: { label: '❌ Cancelled', cls: 'badge-cancelled' },
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-default)',
      borderRadius: '10px', padding: '10px 14px', fontSize: '12px'
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</p>
      <p style={{ color: 'var(--brand-green)', fontWeight: 700 }}>₹{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [dailyRevenue, setDailyRevenue] = useState([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const shopId = localStorage.getItem('shop_id') || 'demo'
      const res = await fetch(`/api/analytics/summary?shop_id=${shopId}`)
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats); setDailyRevenue(data.dailyRevenue || [])
        setRecentOrders(data.recentOrders || []); setTopProducts(data.topProducts || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()
    const iv = setInterval(fetchData, 30000)
    return () => clearInterval(iv)
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <RefreshCw size={28} style={{ color: 'var(--brand-green)', animation: 'spin 1s linear infinite' }} />
    </div>
  )

  const statCards = [
    { label: "Today's Orders",  value: stats?.todayOrders || 0,   sub: `₹${(stats?.todayRevenue||0).toLocaleString()} earned today`, icon: ShoppingCart, color: '#0BB07C', bg: 'rgba(11,176,124,0.12)' },
    { label: "Total Revenue",   value: `₹${((stats?.totalRevenue||0)/1000).toFixed(1)}k`, sub: `${stats?.weekOrders||0} orders this week`, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: "Total Customers", value: stats?.totalCustomers || 0, sub: 'Registered via WhatsApp', icon: Users,    color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
    { label: "All Time Orders", value: stats?.totalOrders || 0,   sub: 'Since you started',       icon: Package,  color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
  ]

  return (
    <div className="page-wrap">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard 🏪</h1>
          <p className="page-subtitle">{format(new Date(), "EEEE, d MMMM yyyy")} · Real-time updates every 30s</p>
        </div>
        <button onClick={fetchData} className="btn-secondary">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="stat-icon-wrap" style={{ background: card.bg }}>
                  <Icon size={20} style={{ color: card.color }} />
                </div>
                <ArrowUpRight size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <div className="stat-value" style={{ color: card.color }}>{card.value}</div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-meta">{card.sub}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="two-col">
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-sub">Last 7 days</div>
            </div>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={190}>
              <AreaChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0BB07C" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0BB07C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#0BB07C" strokeWidth={2} fill="url(#rev)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Top Products</div>
              <div className="card-sub">Best selling items</div>
            </div>
          </div>
          <div className="card-body">
            {topProducts.length === 0
              ? <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No sales data yet</p>
              : topProducts.map((p: any, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <div style={{
                    width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px',
                    background: 'rgba(11,176,124,0.12)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: 'var(--brand-green)'
                  }}>{i+1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '1px' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.count} units sold</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--brand-green)' }}>₹{p.revenue.toLocaleString()}</div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent Orders</div>
            <div className="card-sub">Latest WhatsApp bot activity</div>
          </div>
          <Link href="/dashboard/orders" className="btn-secondary">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => {
                const s = STATUS[o.status] || STATUS.received
                return (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-green)', fontSize: '12px' }}>#{o.id.slice(-6).toUpperCase()}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{o.customers?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.customers?.whatsapp_number}</div>
                    </td>
                    <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    <td><span style={{ fontWeight: 700, fontSize: '13px' }}>₹{o.total_amount.toLocaleString()}</span></td>
                    <td><span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{format(new Date(o.created_at), 'hh:mm a')}</span></td>
                  </tr>
                )
              })}
              {recentOrders.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>No orders yet. WhatsApp bot se orders ayenge! 🤖</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
