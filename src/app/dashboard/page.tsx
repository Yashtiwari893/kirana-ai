'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ShoppingCart, Users, TrendingUp, Package,
  ArrowUpRight, Clock, CheckCircle2, RefreshCw,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface Stats {
  totalOrders: number
  todayOrders: number
  weekOrders: number
  totalRevenue: number
  todayRevenue: number
  totalCustomers: number
}

interface RecentOrder {
  id: string
  status: string
  total_amount: number
  created_at: string
  raw_message: string
  customers: { name: string | null; whatsapp_number: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; emoji: string; className: string }> = {
  received: { label: 'Received', emoji: '📥', className: 'badge-received' },
  packed: { label: 'Packed', emoji: '📦', className: 'badge-packed' },
  delivered: { label: 'Delivered', emoji: '✅', className: 'badge-delivered' },
  cancelled: { label: 'Cancelled', emoji: '❌', className: 'badge-cancelled' },
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
        borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: '#4ade80', fontWeight: 700 }}>₹{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
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
        setStats(data.stats)
        setDailyRevenue(data.dailyRevenue || [])
        setRecentOrders(data.recentOrders || [])
        setTopProducts(data.topProducts || [])
      }
    } catch (e) {
      console.error('Fetch error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <RefreshCw size={32} color="var(--brand-primary)" className="animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: "Aaj ke Orders", value: stats?.todayOrders || 0, sub: `₹${(stats?.todayRevenue || 0).toLocaleString()} revenue`, icon: ShoppingCart, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', variant: '' },
    { label: "Total Revenue", value: `₹${((stats?.totalRevenue || 0) / 1000).toFixed(1)}k`, sub: `${stats?.weekOrders || 0} orders this week`, icon: TrendingUp, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', variant: 'amber' },
    { label: "Total Customers", value: stats?.totalCustomers || 0, sub: 'WhatsApp se registered', icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', variant: 'purple' },
    { label: "Total Orders", value: stats?.totalOrders || 0, sub: 'Sabhi time ke orders', icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', variant: 'blue' },
  ]

  return (
    <div className="page-container" style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard 🏪</h1>
          <p className="page-subtitle">{format(new Date(), "EEEE, d MMMM yyyy")} • Real-time updates</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary btn-sm"><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="stats-grid">
        {statCards.map((card, i) => {
          const Icon = card.icon
          return (
            <div key={i} className={`stat-card ${card.variant}`}>
              <div className="stat-icon" style={{ background: card.bg, color: card.color }}><Icon size={22} /></div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{card.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="two-col" style={{ marginBottom: '1.5rem' }}>
        <div className="card card-padding">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Revenue Chart</h3>
          <p className="text-sm text-muted mb-4">Pichle 7 din ka revenue</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Top Products</h3>
          <p className="text-sm text-muted mb-4">Sabse zyada bikne wale items</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {topProducts.map((p: any, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '28px', height: '28px', background: 'rgba(34,197,94,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#4ade80', flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.count} units sold</div>
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4ade80' }}>₹{p.revenue.toLocaleString()}</div>
              </div>
            ))}
            {topProducts.length === 0 && <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No data available yet</p>}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h3>
          <Link href="/dashboard/orders" className="btn btn-secondary btn-sm">Sab dekho <ArrowUpRight size={14} /></Link>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
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
              {recentOrders.map(order => {
                const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.received
                return (
                  <tr key={order.id}>
                    <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4ade80', fontSize: '0.8rem' }}>#{order.id.slice(-6).toUpperCase()}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.customers?.name || 'Unknown'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customers?.whatsapp_number}</div>
                    </td>
                    <td><span className={`badge ${s.className}`}>{s.emoji} {s.label}</span></td>
                    <td><span style={{ fontWeight: 700 }}>₹{order.total_amount.toLocaleString()}</span></td>
                    <td><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{format(new Date(order.created_at), 'HH:mm')}</span></td>
                  </tr>
                )
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No orders found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
