'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import { KeyRound, Globe, Smartphone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'

export default function OnboardingPage() {
  const [authToken, setAuthToken] = useState('')
  const [originWebsite, setOriginWebsite] = useState('')
  const [phoneId, setPhoneId] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) throw new Error('Session expired. Please login again')

      const { error } = await supabase
        .from('shops')
        .update({
          eleven_za_api_key: authToken,
          eleven_za_phone_id: phoneId,
          origin_website: originWebsite,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Setup complete! Dashboard pe milte hain 🎉')
      router.push('/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    "Login karo 11za.in pe",
    "WhatsApp number select karo",
    "Settings → API Credentials",
    "Neecha diye fields mein paste karo"
  ]

  return (
    <div className="auth-page">
      <div className="mesh-container">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      <div style={{ width: '100%', maxWidth: '520px', zIndex: 10, padding: '20px 0' }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🏪</div>
          <span className="auth-logo-name">Kirana<span>AI</span></span>
        </div>

        <div className="auth-card auth-card-wide">
          {/* Step Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(11,176,124,0.1)', border: '1px solid rgba(11,176,124,0.25)',
            borderRadius: '99px', padding: '4px 14px',
            fontSize: '11px', fontWeight: 700, color: 'var(--brand-green)',
            marginBottom: '20px'
          }}>
            Step 2 of 2 · 11za WhatsApp Setup
          </div>

          <h2 className="auth-heading">Connect WhatsApp API</h2>
          <p className="auth-subheading">11za dashboard se ye credentials copy karo aur paste karo</p>

          {/* How-to box */}
          <div style={{
            background: 'rgba(11,176,124,0.05)', border: '1px solid rgba(11,176,124,0.15)',
            borderRadius: '12px', padding: '16px', marginBottom: '24px'
          }}>
            <p style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--brand-green)', marginBottom: '10px' }}>
              🔑 11za se kaise milenge credentials?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={13} style={{ color: 'var(--brand-green)', flexShrink: 0 }} />
                  {s}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleUpdate}>
            <div className="field-group">
              <label className="field-label">11za Auth Token</label>
              <div className="field-wrap">
                <KeyRound size={15} className="field-icon" />
                <input
                  type="password" required
                  value={authToken} onChange={e => setAuthToken(e.target.value)}
                  className="field-input has-icon"
                  placeholder="Paste your 11za auth token..."
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">11za Phone Number ID</label>
              <div className="field-wrap">
                <Smartphone size={15} className="field-icon" />
                <input
                  type="text" required
                  value={phoneId} onChange={e => setPhoneId(e.target.value)}
                  className="field-input has-icon"
                  placeholder="e.g. 919876543210"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Origin Website / App URL</label>
              <div className="field-wrap">
                <Globe size={15} className="field-icon" />
                <input
                  type="url" required
                  value={originWebsite} onChange={e => setOriginWebsite(e.target.value)}
                  className="field-input has-icon"
                  placeholder="https://yourdomain.com"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Connecting...</>
                : <>Complete Setup & Go to Dashboard <ArrowRight size={16} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
