'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Pencil, Trash2, Upload, RefreshCw, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Grains', 'Oil & Ghee', 'Dairy', 'Spices', 'Pulses', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Other']

interface Product {
  id: string
  name: string
  name_aliases: string[]
  price: number
  unit: string
  category: string
  stock_qty: number
  reorder_level: number
  is_active: boolean
}

const emptyProduct = { name: '', name_aliases: [] as string[], price: 0, unit: 'kg', category: 'Grains', stock_qty: 0, reorder_level: 10, is_active: true }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [aliasInput, setAliasInput] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const { data } = await res.json()
        setProducts(data || [])
      }
    } catch {
      setProducts([
        { id: '1', name: 'Aata', name_aliases: ['flour', 'wheat', 'atta'], price: 42, unit: 'kg', category: 'Grains', stock_qty: 50, reorder_level: 10, is_active: true },
        { id: '2', name: 'Tel', name_aliases: ['oil', 'cooking oil', 'soyabean'], price: 130, unit: 'litre', category: 'Oil & Ghee', stock_qty: 18, reorder_level: 5, is_active: true },
        { id: '3', name: 'Cheeni', name_aliases: ['sugar', 'shakkar'], price: 45, unit: 'kg', category: 'Grains', stock_qty: 4, reorder_level: 5, is_active: true },
        { id: '4', name: 'Dal Chana', name_aliases: ['chana dal', 'gram dal'], price: 90, unit: 'kg', category: 'Pulses', stock_qty: 22, reorder_level: 5, is_active: true },
        { id: '5', name: 'Chawal', name_aliases: ['rice', 'basmati'], price: 60, unit: 'kg', category: 'Grains', stock_qty: 80, reorder_level: 20, is_active: true },
        { id: '6', name: 'Doodh', name_aliases: ['milk'], price: 55, unit: 'litre', category: 'Dairy', stock_qty: 30, reorder_level: 10, is_active: true },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyProduct)
    setAliasInput('')
    setShowModal(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({ name: p.name, name_aliases: p.name_aliases, price: p.price, unit: p.unit, category: p.category, stock_qty: p.stock_qty, reorder_level: p.reorder_level, is_active: p.is_active })
    setAliasInput(p.name_aliases.join(', '))
    setShowModal(true)
  }

  const saveProduct = async () => {
    if (!form.name || form.price <= 0) {
      toast.error('Name aur price required hai')
      return
    }
    setSaving(true)
    const payload = { ...form, name_aliases: aliasInput.split(',').map(s => s.trim()).filter(Boolean) }
    
    try {
      let res
      if (editing) {
        res = await fetch(`/api/products/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, shop_id: localStorage.getItem('shop_id') || 'demo' }) })
      }
      
      if (res?.ok) {
        toast.success(editing ? 'Product updated! ✅' : 'Product add ho gaya! 🎉')
        setShowModal(false)
        fetchProducts()
      }
    } catch {
      toast.error('Save nahi hua. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (id: string, name: string) => {
    if (!confirm(`"${name}" ko delete karna chahte ho?`)) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success(`${name} deleted ✅`)
        setProducts(prev => prev.filter(p => p.id !== id))
      }
    } catch {
      toast.error('Delete nahi hua')
    }
  }

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'all' || p.category === catFilter
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.name_aliases.some(a => a.toLowerCase().includes(search.toLowerCase()))
    return matchCat && matchSearch
  })

  const categories = Array.from(new Set(products.map(p => p.category)))
  const lowStockCount = products.filter(p => p.stock_qty <= p.reorder_level && p.is_active).length

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products 🛍️</h1>
          <p className="page-subtitle">{products.length} products • Catalog manage karo</p>
        </div>
        <div className="flex items-center gap-3">
          {lowStockCount > 0 && (
            <div className="flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: '#fbbf24' }}>
              <AlertTriangle size={14} /> {lowStockCount} low stock
            </div>
          )}
          <button className="btn btn-secondary btn-sm"><Upload size={14} /> CSV Upload</button>
          <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Product</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="form-input" style={{ paddingLeft: '2.2rem', width: '200px', padding: '0.55rem 1rem 0.55rem 2.2rem' }} />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="form-select" style={{ width: 'auto' }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><RefreshCw size={28} className="animate-spin" color="var(--brand-primary)" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map(product => {
            const isLow = product.stock_qty <= product.reorder_level
            return (
              <div key={product.id} className="card" style={{ padding: '1.25rem', position: 'relative' }}>
                {isLow && (
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '100px', padding: '0.15rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, color: '#fbbf24' }}>
                    ⚠️ Low Stock
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(34,197,94,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
                    {product.category === 'Oil & Ghee' ? '🫙' : product.category === 'Dairy' ? '🥛' : product.category === 'Pulses' ? '🫘' : product.category === 'Spices' ? '🌶️' : '🌾'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{product.category}</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div style={{ background: 'var(--glass-bg)', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>PRICE</div>
                    <div style={{ fontWeight: 800, color: '#4ade80' }}>₹{product.price}/{product.unit}</div>
                  </div>
                  <div style={{ background: isLow ? 'rgba(245,158,11,0.08)' : 'var(--glass-bg)', borderRadius: '8px', padding: '0.6rem' }}>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '2px' }}>STOCK</div>
                    <div style={{ fontWeight: 800, color: isLow ? '#fbbf24' : 'var(--text-primary)' }}>{product.stock_qty} {product.unit}</div>
                  </div>
                </div>

                {product.name_aliases.length > 0 && (
                  <div style={{ marginBottom: '0.875rem' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Aliases:</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {product.name_aliases.map((alias, i) => (
                        <span key={i} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{alias}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(product)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => deleteProduct(product.id, product.name)} className="btn btn-danger btn-sm btn-icon">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Product Card */}
          <button onClick={openAdd} style={{
            background: 'transparent', border: '2px dashed var(--glass-border)', borderRadius: 'var(--border-radius-lg)',
            cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem', minHeight: '160px',
            transition: 'all var(--transition-normal)',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'var(--brand-primary)'; (e.target as HTMLElement).style.color = '#4ade80'; }}
          onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--glass-border)'; (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <Plus size={28} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>New Product</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editing ? '✏️ Edit Product' : '➕ New Product'}</div>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-icon">✕</button>
            </div>
            <div className="modal-body">
              <div className="two-col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Aata" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="two-col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" placeholder="0.00" value={form.price} onChange={e => setForm(p => ({ ...p, price: parseFloat(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-select" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                    {['kg', 'gram', 'litre', 'ml', 'piece', 'packet', 'dozen', 'box'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="two-col" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input type="number" className="form-input" placeholder="0" value={form.stock_qty} onChange={e => setForm(p => ({ ...p, stock_qty: parseFloat(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reorder Level</label>
                  <input type="number" className="form-input" placeholder="10" value={form.reorder_level} onChange={e => setForm(p => ({ ...p, reorder_level: parseFloat(e.target.value) }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Hindi/English Aliases (comma separated)</label>
                <input type="text" className="form-input" placeholder="e.g. flour, wheat, atta, गेहूं" value={aliasInput} onChange={e => setAliasInput(e.target.value)} />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Yeh bot ko item match karne mein help karta hai</small>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button onClick={saveProduct} disabled={saving} className="btn btn-primary">
                {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : editing ? '✅ Update' : '➕ Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
