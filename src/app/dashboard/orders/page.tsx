'use client'

import { useEffect, useState, useCallback } from 'react'
import { Filter, Search, Eye, CheckCircle2, Package, Truck, XCircle, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUS_CONFIG: Record<string, { label: string; emoji: string; className: string; next?: string; nextLabel?: string }> = {
  received: { label: 'Received', emoji: '📥', className: 'badge-received', next: 'packed', nextLabel: 'Pack Karo' },
  packed: { label: 'Packed', emoji: '📦', className: 'badge-packed', next: 'delivered', nextLabel: 'Deliver Karo' },
  delivered: { label: 'Delivered', emoji: '✅', className: 'badge-delivered' },
  cancelled: { label: 'Cancelled', emoji: '❌', className: 'badge-cancelled' },
}

interface Order {
  id: string
  status: string
  total_amount: number
  created_at: string
  raw_message: string
  items: any[]
  customers: { name: string | null; whatsapp_number: string } | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (filterStatus !== 'all') params.set('status', filterStatus)
      
      const res = await fetch(`/api/orders?${params}`)
      if (res.ok) {
        const { data } = await res.json()
        setOrders(data || [])
      }
    } catch {
      // Demo data
      setOrders([
        { id: 'ord-001abc', status: 'received', total_amount: 485, created_at: new Date().toISOString(), raw_message: '2kg aata, 1 litre tel aur thoda cheeni', items: [{ name: 'Aata', quantity: 2, unit: 'kg', price: 160 }, { name: 'Tel', quantity: 1, unit: 'litre', price: 180 }], customers: { name: 'Ramesh ji', whatsapp_number: '+91 98765 43210' } },
        { id: 'ord-002def', status: 'packed', total_amount: 220, created_at: new Date(Date.now() - 3600000).toISOString(), raw_message: 'cheeni 1kg, doodh 2 packet', items: [{ name: 'Cheeni', quantity: 1, unit: 'kg', price: 45 }, { name: 'Doodh', quantity: 2, unit: 'packet', price: 90 }], customers: { name: 'Priya Sharma', whatsapp_number: '+91 87654 32109' } },
        { id: 'ord-003ghi', status: 'delivered', total_amount: 1240, created_at: new Date(Date.now() - 86400000).toISOString(), raw_message: 'monthly ration: chawal 5kg, dal 2kg...', items: [{ name: 'Chawal', quantity: 5, unit: 'kg', price: 750 }, { name: 'Dal', quantity: 2, unit: 'kg', price: 320 }], customers: { name: 'Sunita Devi', whatsapp_number: '+91 76543 21098' } },
        { id: 'ord-004jkl', status: 'received', total_amount: 340, created_at: new Date(Date.now() - 1800000).toISOString(), raw_message: 'ek packet namak, ek packet haldi', items: [{ name: 'Namak', quantity: 1, unit: 'packet', price: 20 }, { name: 'Haldi', quantity: 1, unit: 'packet', price: 80 }], customers: { name: null, whatsapp_number: '+91 65432 10987' } },
      ])
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 15000) // Real-time refresh
    return () => clearInterval(interval)
  }, [fetchOrders])

  const updateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        toast.success(`Order ${STATUS_CONFIG[newStatus]?.label} ho gaya! Customer ko WhatsApp gaya ✅`)
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
        }
      }
    } catch {
      toast.error('Status update nahi hua. Internet check karein.')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    const matchSearch = !search || 
      o.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customers?.whatsapp_number?.includes(search) ||
      o.id.includes(search)
    return matchStatus && matchSearch
  })

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders 📦</h1>
          <p className="page-subtitle">Real-time orders • Auto WhatsApp notifications</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2" style={{ fontSize: '0.8rem', color: '#4ade80' }}>
            <span className="live-dot"></span> Live Updates
          </span>
          <button onClick={fetchOrders} className="btn btn-secondary btn-sm">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Sab', count: orders.length },
          { key: 'received', label: '📥 Received', count: statusCounts.received || 0 },
          { key: 'packed', label: '📦 Packed', count: statusCounts.packed || 0 },
          { key: 'delivered', label: '✅ Delivered', count: statusCounts.delivered || 0 },
          { key: 'cancelled', label: '❌ Cancelled', count: statusCounts.cancelled || 0 },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '100px',
              border: `1px solid ${filterStatus === tab.key ? 'var(--brand-primary)' : 'var(--glass-border)'}`,
              background: filterStatus === tab.key ? 'rgba(34,197,94,0.12)' : 'transparent',
              color: filterStatus === tab.key ? '#4ade80' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              transition: 'all 0.15s ease',
            }}
          >
            {tab.label}
            <span style={{
              background: filterStatus === tab.key ? 'var(--brand-primary)' : 'var(--bg-input)',
              color: 'white',
              padding: '0.05rem 0.45rem',
              borderRadius: '100px',
              fontSize: '0.7rem',
              fontWeight: 700,
            }}>{tab.count}</span>
          </button>
        ))}

        {/* Search */}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem', width: '220px', padding: '0.55rem 1rem 0.55rem 2.25rem' }}
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Details</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={20} className="animate-spin" style={{ display: 'inline-block' }} />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <span className="empty-state-icon">📭</span>
                    <div className="empty-state-title">Koi order nahi mila</div>
                    <p>WhatsApp pe order aane ka intezaar karo!</p>
                  </div>
                </td></tr>
              ) : filtered.map(order => {
                const s = STATUS_CONFIG[order.status] || STATUS_CONFIG.received
                const isUpdating = updatingId === order.id
                return (
                  <tr key={order.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#4ade80', fontSize: '0.8rem' }}>
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{order.customers?.name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customers?.whatsapp_number}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{order.raw_message}"
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items?.length || 0} items</div>
                    </td>
                    <td><span className={`badge ${s.className}`}>{s.emoji} {s.label}</span></td>
                    <td><span style={{ fontWeight: 700 }}>₹{order.total_amount.toLocaleString()}</span></td>
                    <td>
                      <div style={{ fontSize: '0.8rem' }}>{format(new Date(order.created_at), 'HH:mm')}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{format(new Date(order.created_at), 'd MMM')}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="btn btn-secondary btn-sm btn-icon"
                          title="View Order"
                        >
                          <Eye size={14} />
                        </button>
                        {s.next && (
                          <button
                            onClick={() => updateStatus(order.id, s.next!)}
                            disabled={isUpdating}
                            className="btn btn-primary btn-sm"
                          >
                            {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : s.nextLabel}
                          </button>
                        )}
                        {order.status === 'received' && (
                          <button
                            onClick={() => updateStatus(order.id, 'cancelled')}
                            disabled={isUpdating}
                            className="btn btn-danger btn-sm"
                            title="Cancel"
                          >
                            <XCircle size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Order #{selectedOrder.id.slice(-6).toUpperCase()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {format(new Date(selectedOrder.created_at), "d MMM yyyy, HH:mm")}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary btn-icon">✕</button>
            </div>
            <div className="modal-body">
              {/* Customer Info */}
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px', padding: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Customer</div>
                <div style={{ fontWeight: 700 }}>{selectedOrder.customers?.name || 'Unknown'}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{selectedOrder.customers?.whatsapp_number}</div>
              </div>

              {/* Original Message */}
              <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', padding: '0.875rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>WhatsApp Message</div>
                <div style={{ fontSize: '0.875rem', color: '#4ade80', fontStyle: 'italic' }}>"{selectedOrder.raw_message}"</div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Order Items</div>
                {selectedOrder.items?.map((item: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--glass-border)' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}> × {item.quantity} {item.unit}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: '#4ade80' }}>₹{item.price}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0', fontWeight: 800, fontSize: '1.05rem' }}>
                  <span>Total</span>
                  <span style={{ color: '#4ade80' }}>₹{selectedOrder.total_amount}</span>
                </div>
              </div>

              {/* Status Actions */}
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Update Status</div>
              <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
                {['received', 'packed', 'delivered', 'cancelled'].map(status => {
                  const s = STATUS_CONFIG[status]
                  const isCurrent = selectedOrder.status === status
                  return (
                    <button
                      key={status}
                      onClick={() => !isCurrent && updateStatus(selectedOrder.id, status)}
                      disabled={isCurrent || !!updatingId}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: `1px solid ${isCurrent ? 'var(--brand-primary)' : 'var(--glass-border)'}`,
                        background: isCurrent ? 'rgba(34,197,94,0.15)' : 'transparent',
                        color: isCurrent ? '#4ade80' : 'var(--text-secondary)',
                        cursor: isCurrent ? 'default' : 'pointer',
                        fontSize: '0.8rem', fontWeight: 600,
                      }}
                    >
                      {s.emoji} {s.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
