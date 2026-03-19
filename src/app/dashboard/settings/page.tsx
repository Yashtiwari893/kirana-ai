'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, EyeOff, RefreshCw, Smartphone, Globe, Shield } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [shopId, setShopId] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    shop_name: '',
    whatsapp_number: '',
    eleven_za_api_key: '',
    eleven_za_phone_id: '',
    origin_website: '',
    bot_greeting: '',
    working_hours: { start: '09:00', end: '21:00' }
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      if (data) {
        setShopId(data.id)
        setForm({
          shop_name: data.shop_name || '',
          whatsapp_number: data.whatsapp_number || '',
          eleven_za_api_key: data.eleven_za_api_key || '',
          eleven_za_phone_id: data.eleven_za_phone_id || '',
          origin_website: data.origin_website || '',
          bot_greeting: data.bot_greeting || '',
          working_hours: data.working_hours || { start: '09:00', end: '21:00' }
        })
      }
    } catch (e: any) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!shopId) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('shops')
        .update({
          shop_name: form.shop_name,
          whatsapp_number: form.whatsapp_number,
          eleven_za_api_key: form.eleven_za_api_key,
          eleven_za_phone_id: form.eleven_za_phone_id,
          origin_website: form.origin_website,
          bot_greeting: form.bot_greeting,
          working_hours: form.working_hours,
          updated_at: new Date().toISOString()
        })
        .eq('id', shopId)

      if (error) throw error
      toast.success('Settings updated successfully! ✅')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center p-20"><RefreshCw className="animate-spin text-brand-primary" /></div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings ⚙️</h1>
          <p className="page-subtitle">Shop configuration aur 11za credentials manage karo</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Save size={14} className="mr-2" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="two-col" style={{ alignItems: 'flex-start', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Shop Basic Info */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏪 Shop Profile</h3>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input type="text" className="form-input" value={form.shop_name} onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp (Business Number)</label>
              <input type="text" className="form-input" value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} />
            </div>
          </div>

          {/* Working Hours */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>⏰ Store Timing</h3>
            <div className="two-col" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Opening</label>
                <input type="time" className="form-input" value={form.working_hours.start} onChange={e => setForm(p => ({ ...p, working_hours: { ...p.working_hours, start: e.target.value } }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Closing</label>
                <input type="time" className="form-input" value={form.working_hours.end} onChange={e => setForm(p => ({ ...p, working_hours: { ...p.working_hours, end: e.target.value } }))} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 11za Credentials Section */}
          <div className="card card-padding" style={{ border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.05)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Shield size={18} className="text-blue-400" />
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>11za Credentials</h3>
            </div>
            
            <div className="form-group">
              <label className="form-label">11za Auth Token</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Paste 11za authToken here"
                  value={form.eleven_za_api_key}
                  onChange={e => setForm(p => ({ ...p, eleven_za_api_key: e.target.value }))}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button onClick={() => setShowApiKey(!showApiKey)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">11za Phone Number ID</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input pl-8" placeholder="Phone Number ID" value={form.eleven_za_phone_id} onChange={e => setForm(p => ({ ...p, eleven_za_phone_id: e.target.value }))} style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Origin Website</label>
              <div style={{ position: 'relative' }}>
                <Globe size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" className="form-input pl-8" placeholder="https://yourpage.com" value={form.origin_website} onChange={e => setForm(p => ({ ...p, origin_website: e.target.value }))} style={{ paddingLeft: '2.4rem' }} />
              </div>
            </div>
          </div>

          {/* Bot Greeting */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>🤖 Bot Welcome Greeting</h3>
            <textarea
              className="form-textarea"
              value={form.bot_greeting}
              onChange={e => setForm(p => ({ ...p, bot_greeting: e.target.value }))}
              style={{ minHeight: '120px' }}
              placeholder="Namaste! Order ke liye items likhein..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
