'use client'

import { useEffect, useState } from 'react'
import { Search, RefreshCw, Users, Star, Crown, BedDouble } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const TAG_COLORS: Record<string, string> = {
  new: 'badge-new',
  regular: 'badge-regular',
  premium: 'badge-premium',
  churned: 'badge-cancelled',
}

interface Customer {
  id: string
  whatsapp_number: string
  name: string | null
  tags: string[]
  total_orders: number
  total_spend: number
  last_order_at: string
  reorder_score: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState('all')

  const fetchCustomers = async () => {
    try {
      const shopId = localStorage.getItem('shop_id') || 'demo'
      let url = `/api/customers?shop_id=${shopId}`
      if (tagFilter !== 'all') url += `&tag=${tagFilter}`
      
      const res = await fetch(url)
      if (res.ok) {
        const result = await res.json()
        setCustomers(result.data || [])
      }
    } catch (e) {
      toast.error('Customers load karne mein error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [tagFilter])

  const filtered = customers.filter(c => {
    const matchSearch = !search || 
      (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
      c.whatsapp_number.includes(search)
    return matchSearch
  })

  // Stats calculation
  const stats = {
    total: customers.length,
    regular: customers.filter(c => c.tags?.includes('regular')).length,
    premium: customers.filter(c => c.tags?.includes('premium')).length,
    churned: customers.filter(c => c.tags?.includes('churned')).length,
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers 👥</h1>
          <p className="page-subtitle">{stats.total} registered customers • WhatsApp se auto-managed</p>
        </div>
        <button onClick={fetchCustomers} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Customers', value: stats.total, color: 'var(--text-primary)', icon: <Users size={20} /> },
          { label: 'Regular Buyers', value: stats.regular, color: '#4ade80', icon: <Star size={20} /> },
          { label: 'Premium (Top)', value: stats.premium, color: '#fbbf24', icon: <Crown size={20} /> },
          { label: 'Churned', value: stats.churned, color: '#f87171', icon: <BedDouble size={20} /> },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '1.25rem' }}>
            <div style={{ color: s.color, marginBottom: '0.5rem' }}>{s.icon}</div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" placeholder="Search customers..." 
            value={search} onChange={e => setSearch(e.target.value)} 
            className="form-input" style={{ paddingLeft: '2.2rem', width: '250px' }} 
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'new', 'regular', 'premium', 'churned'].map(tag => (
            <button key={tag} onClick={() => setTagFilter(tag)} style={{
              padding: '0.4rem 0.875rem', borderRadius: '100px', border: `1px solid ${tagFilter === tag ? 'var(--brand-primary)' : 'var(--glass-border)'}`,
              background: tagFilter === tag ? 'rgba(34,197,94,0.12)' : 'transparent',
              color: tagFilter === tag ? '#4ade80' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            }}>
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>WhatsApp</th>
                <th>Tags</th>
                <th>Orders</th>
                <th>Spend</th>
                <th>Last Order</th>
                <th>Reorder Score</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><RefreshCw size={24} className="animate-spin mx-auto opacity-50" /></td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: 'white', fontSize: '0.75rem'
                      }}>
                        {(c.name || c.whatsapp_number).charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>{c.name || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{c.whatsapp_number}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {c.tags?.map(tag => (
                        <span key={tag} className={`badge ${TAG_COLORS[tag] || 'badge-new'}`} style={{ fontSize: '0.65rem' }}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td><span style={{ fontWeight: 700 }}>{c.total_orders}</span></td>
                  <td><span style={{ fontWeight: 700, color: '#4ade80' }}>₹{c.total_spend.toLocaleString()}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {c.last_order_at ? format(new Date(c.last_order_at), 'd MMM HH:mm') : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--bg-input)', borderRadius: '100px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(c.reorder_score || 0) * 100}%`, height: '100%',
                          background: (c.reorder_score || 0) > 0.7 ? '#22c55e' : (c.reorder_score || 0) > 0.4 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{Math.round((c.reorder_score || 0) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
