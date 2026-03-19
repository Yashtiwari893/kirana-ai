'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

const COLORS = ['#22c55e', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color, fontWeight: 700 }}>₹{(p.value || 0).toLocaleString()}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const weeklyData = [
    { week: 'Week 1', orders: 28, revenue: 12400 },
    { week: 'Week 2', orders: 35, revenue: 16800 },
    { week: 'Week 3', orders: 42, revenue: 19200 },
    { week: 'Week 4', orders: 37, revenue: 17600 },
  ]

  const categoryData = [
    { name: 'Grains', value: 42 },
    { name: 'Oil & Ghee', value: 28 },
    { name: 'Pulses', value: 18 },
    { name: 'Dairy', value: 8 },
    { name: 'Spices', value: 4 },
  ]

  const topProducts = [
    { name: 'Aata', revenue: 8400, orders: 42 },
    { name: 'Chawal', revenue: 6600, orders: 22 },
    { name: 'Sarson Tel', revenue: 5600, orders: 28 },
    { name: 'Dal Chana', revenue: 3800, orders: 19 },
    { name: 'Cheeni', revenue: 3500, orders: 35 },
  ]

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics 📊</h1>
          <p className="page-subtitle">Sales reports, trends, and business insights</p>
        </div>
        <select className="form-select" style={{ width: 'auto' }}>
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
          <option>Last 3 Months</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Monthly Revenue', value: '₹65,800', change: '+18%', up: true, desc: 'vs last month' },
          { label: 'Total Orders', value: '142', change: '+24%', up: true, desc: 'vs last month' },
          { label: 'Avg Order Value', value: '₹463', change: '+3.2%', up: true, desc: 'per order' },
          { label: 'Customer Retention', value: '72%', change: '-5%', up: false, desc: 'returning buyers' },
        ].map((k, i) => (
          <div key={i} className="stat-card">
            <div className="stat-value">{k.value}</div>
            <div className="stat-label">{k.label}</div>
            <div className={`stat-change ${k.up ? 'up' : 'down'}`}>
              {k.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {k.change} {k.desc}
            </div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: '1.5rem' }}>
        {/* Weekly Revenue Bar Chart */}
        <div className="card card-padding">
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Weekly Revenue</h3>
          <p className="text-sm text-muted mb-4">Pichle 4 hafte ka comparison</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="week" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="card card-padding">
          <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Sales by Category</h3>
          <p className="text-sm text-muted mb-4">Category-wise revenue share</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(val: any) => `${val}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', borderRadius: '10px' }} />
              <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{val}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card">
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontWeight: 700 }}>Top Products</h3>
          <p className="text-sm text-muted">Best selling items by revenue</p>
        </div>
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Revenue Share</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => {
                const totalRevenue = topProducts.reduce((s, x) => s + x.revenue, 0)
                const share = Math.round(p.revenue / totalRevenue * 100)
                return (
                  <tr key={i}>
                    <td><span style={{ fontWeight: 800, color: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : 'var(--text-muted)', fontSize: '0.875rem' }}>#{i + 1}</span></td>
                    <td><span style={{ fontWeight: 700 }}>{p.name}</span></td>
                    <td>{p.orders} orders</td>
                    <td><span style={{ fontWeight: 700, color: '#4ade80' }}>₹{p.revenue.toLocaleString()}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '80px', height: '6px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                          <div style={{ width: `${share}%`, height: '100%', background: 'var(--brand-primary)', borderRadius: '100px' }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{share}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
