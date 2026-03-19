'use client'

import { useEffect, useState } from 'react'
import { Megaphone, Sparkles, Send, Users, RefreshCw, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const SEGMENTS = [
  { key: 'all', label: 'Sab Customers', desc: 'Sabhi customers ko send karo', emoji: '👥' },
  { key: 'regular', label: 'Regular', desc: 'Frequent buyers', emoji: '⭐' },
  { key: 'new', label: 'New', desc: 'Naye customers', emoji: '🆕' },
  { key: 'premium', label: 'Premium', desc: 'High value customers', emoji: '👑' },
  { key: 'churned', label: 'Churned', desc: '30+ din se order nahi kiya', emoji: '💤' },
]

const PROMPT_TEMPLATES = [
  'Weekly special offer on aata aur tel - 10% off',
  'Naye products available hain - chawal aur dal',
  'Festival offer - Diwali special discount 20%',
  'Sunday morning fresh vegetables available',
  'Monsoon special - warm beverages discount',
]

export default function BroadcastPage() {
  const [segment, setSegment] = useState('all')
  const [message, setMessage] = useState('')
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [broadcasts, setBroadcasts] = useState([
    { id: '1', message_text: '🎉 Aaj special offer! Aata 5% off. Order karo WhatsApp pe! 🛒', audience_segment: 'all', sent_count: 68, read_count: 45, status: 'sent', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: '2', message_text: '👑 Premium customers ke liye FREE delivery aaj! ₹500+ orders pe. 🚚', audience_segment: 'premium', sent_count: 12, read_count: 10, status: 'sent', created_at: new Date(Date.now() - 172800000).toISOString() },
  ])

  const generateMessage = async () => {
    if (!prompt.trim()) { toast.error('Pehle prompt likhein'); return }
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, shop_id: localStorage.getItem('shop_id') || 'demo' }),
      })
      if (res.ok) {
        const { message: msg } = await res.json()
        setMessage(msg)
        toast.success('AI ne message generate kar diya! ✨')
      }
    } catch {
      // Demo message
      setMessage(`🎉 ${prompt.includes('offer') ? 'Aaj special offer!' : 'Khaas khabar!'} Hamari shop pe visit karein ya WhatsApp pe order karein. Sabse fresh groceries, best price mein! 🛒✨`)
      toast.success('AI message ready!')
    } finally {
      setGenerating(false)
    }
  }

  const sendBroadcast = async () => {
    if (!message.trim()) { toast.error('Message likhein pehle'); return }
    setSending(true)
    try {
      // Save broadcast first
      const saveRes = await fetch('/api/broadcast/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_text: message,
          audience_segment: segment,
          shop_id: localStorage.getItem('shop_id') || 'demo',
        }),
      })

      toast.success(`Broadcast bhej diya! 68 customers ko WhatsApp gaya 🚀`)
      setBroadcasts(prev => [{
        id: Date.now().toString(),
        message_text: message,
        audience_segment: segment,
        sent_count: 68, read_count: 0, status: 'sent',
        created_at: new Date().toISOString()
      }, ...prev])
      setMessage('')
      setPrompt('')
    } catch {
      toast.error('Send nahi hua')
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{ padding: '2rem' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Broadcast 📣</h1>
          <p className="page-subtitle">AI-powered WhatsApp marketing • Bulk messages bhejo</p>
        </div>
      </div>

      <div className="two-col" style={{ alignItems: 'flex-start' }}>
        {/* Compose */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Segment Selector */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>1. Audience Choose Karo</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {SEGMENTS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setSegment(s.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.875rem 1rem', borderRadius: '10px', textAlign: 'left',
                    border: `1px solid ${segment === s.key ? 'var(--brand-primary)' : 'var(--glass-border)'}`,
                    background: segment === s.key ? 'rgba(34,197,94,0.08)' : 'transparent',
                    cursor: 'pointer', width: '100%', transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{s.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: segment === s.key ? '#4ade80' : 'var(--text-primary)' }}>{s.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.desc}</div>
                  </div>
                  {segment === s.key && <Check size={16} color="#4ade80" />}
                </button>
              ))}
            </div>
          </div>

          {/* AI Generator */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '0.25rem', fontSize: '0.95rem' }}>2. AI se Message Generate Karo</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Mistral AI Hindi/Hinglish mein likhegs</p>
            
            {/* Quick Prompts */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
              {PROMPT_TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => setPrompt(t)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '100px', padding: '0.25rem 0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  {t.slice(0, 25)}...
                </button>
              ))}
            </div>

            <textarea
              className="form-textarea"
              placeholder="Describe karo kya message bhejni hai... e.g. 'Aaj special offer hai aate aur tel pe'"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{ minHeight: '80px', marginBottom: '0.75rem' }}
            />
            <button onClick={generateMessage} disabled={generating} className="btn btn-secondary w-full">
              {generating ? <><RefreshCw size={14} className="animate-spin" /> Generating...</> : <><Sparkles size={14} /> AI se Generate Karo</>}
            </button>
          </div>
        </div>

        {/* Message Preview + Send */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Message Editor */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>3. Message Review aur Send</h3>
            <textarea
              className="form-textarea"
              placeholder="Message yahan likhein ya AI se generate karo..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              style={{ minHeight: '140px', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{message.length} characters</span>
              <span style={{ fontSize: '0.75rem', color: message.length > 200 ? '#f87171' : 'var(--text-muted)' }}>
                {message.length > 200 ? '⚠️ Too long!' : '✓ Good length'}
              </span>
            </div>

            {/* WhatsApp Preview */}
            {message && (
              <div style={{ 
                background: '#0b1f0f', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: '12px', padding: '1rem', marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📱 WhatsApp Preview</div>
                <div style={{ 
                  background: '#1a3520', borderRadius: '10px 10px 10px 2px',
                  padding: '0.75rem', fontSize: '0.875rem', color: '#e2f8e8', lineHeight: 1.6
                }}>
                  {message}
                </div>
              </div>
            )}

            <button onClick={sendBroadcast} disabled={sending || !message} className="btn btn-primary w-full btn-lg">
              {sending ? <><RefreshCw size={16} className="animate-spin" /> Sending...</> : <><Send size={16} /> Send Broadcast</>}
            </button>
          </div>

          {/* Past Broadcasts */}
          <div className="card card-padding">
            <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>Past Broadcasts</h3>
            {broadcasts.map(b => (
              <div key={b.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.875rem', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{b.message_text.slice(0, 80)}...</div>
                <div className="flex items-center gap-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>👥 {b.sent_count} sent</span>
                  <span>👀 {b.read_count} read ({b.sent_count ? Math.round(b.read_count / b.sent_count * 100) : 0}%)</span>
                  <span className={`badge ${b.status === 'sent' ? 'badge-delivered' : 'badge-received'}`} style={{ fontSize: '0.65rem' }}>
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
