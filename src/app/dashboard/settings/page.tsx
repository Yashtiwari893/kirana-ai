'use client'

import { useState } from 'react'
import { Save, Eye, EyeOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [form, setForm] = useState({
    shop_name: 'Sharma Kirana Store',
    owner_name: 'Ramesh Sharma',
    whatsapp_number: '+91 98765 43210',
    eleven_za_api_key: '',
    working_hours_start: '09:00',
    working_hours_end: '21:00',
    bot_greeting: 'Namaste! Main aapka kirana bot hoon. Order ke liye item aur quantity likhein jaise: 2kg aata, 1 litre tel',
  })

  const save = async () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      toast.success('Settings save ho gayi! ✅')
    }, 1000)
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings ⚙️</h1>
          <p className="page-subtitle">Shop configuration aur bot customize karo</p>
        </div>
        <button onClick={save} disabled={saving} className="btn btn-primary">
          {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Changes</>}
        </button>
      </div>

      <div className="two-col" style={{ alignItems: 'flex-start', gap: '1.5rem' }}>
        {/* Shop Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>🏪 Shop Information</h3>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input type="text" className="form-input" value={form.shop_name} onChange={e => setForm(p => ({ ...p, shop_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Owner Name</label>
              <input type="text" className="form-input" value={form.owner_name} onChange={e => setForm(p => ({ ...p, owner_name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Shop WhatsApp Number</label>
              <input type="text" className="form-input" value={form.whatsapp_number} onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))} />
            </div>
          </div>

          {/* Working Hours */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>⏰ Working Hours</h3>
            <div className="two-col" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Opening Time</label>
                <input type="time" className="form-input" value={form.working_hours_start} onChange={e => setForm(p => ({ ...p, working_hours_start: e.target.value }))} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Closing Time</label>
                <input type="time" className="form-input" value={form.working_hours_end} onChange={e => setForm(p => ({ ...p, working_hours_end: e.target.value }))} />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>Bot is timing ke baad order accept nahi karega</p>
          </div>
        </div>

        {/* API + Bot */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 11za API */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>📱 11za WhatsApp API</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              11za.in se API key lo aur yahan paste karo
            </p>
            <div className="form-group">
              <label className="form-label">11za API Key</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  className="form-input"
                  placeholder="sk-11za-xxxxxxxxxxxxxxxx"
                  value={form.eleven_za_api_key}
                  onChange={e => setForm(p => ({ ...p, eleven_za_api_key: e.target.value }))}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button onClick={() => setShowApiKey(!showApiKey)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Webhook URL */}
            <div className="form-group">
              <label className="form-label">Webhook URL (11za mein set karo yeh)</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={`${typeof window !== 'undefined' ? window.location.origin : 'https://your-app.vercel.app'}/api/webhook/11za`}
                  readOnly
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#4ade80' }}
                />
                <button
                  onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/webhook/11za`); toast.success('Copied!') }}
                  className="btn btn-secondary btn-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', padding: '0.875rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', marginBottom: '0.4rem' }}>✅ Setup Steps:</div>
              <ol style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1rem', lineHeight: 2 }}>
                <li>11za.in pe account banao</li>
                <li>WhatsApp instance connect karo</li>
                <li>API Key copy karo aur yahan paste karo</li>
                <li>Webhook URL 11za dashboard mein set karo</li>
                <li>Test order bhejo!</li>
              </ol>
            </div>
          </div>

          {/* Bot Greeting */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.95rem' }}>🤖 Bot Customize</h3>
            <div className="form-group">
              <label className="form-label">Welcome Message</label>
              <textarea
                className="form-textarea"
                value={form.bot_greeting}
                onChange={e => setForm(p => ({ ...p, bot_greeting: e.target.value }))}
                style={{ minHeight: '100px' }}
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Jab customer pehli baar message kare ya "hi" likhe</small>
            </div>

            {/* Preview */}
            <div style={{ background: '#0b1f0f', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📱 WhatsApp Preview</div>
              <div style={{ background: '#1a3520', borderRadius: '10px 10px 10px 2px', padding: '0.75rem', fontSize: '0.8rem', color: '#e2f8e8', lineHeight: 1.6 }}>
                {form.bot_greeting}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
