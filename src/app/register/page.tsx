'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import { User, Mail, Lock, Store, Phone, ArrowRight, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: '', shopName: '', whatsapp: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.fullName } }
      })
      if (authError) throw authError
      if (!authData.user) throw new Error('Registration failed')

      const { error: shopError } = await supabase.from('shops').insert({
        user_id: authData.user.id,
        shop_name: form.shopName,
        whatsapp_number: form.whatsapp,
        is_active: true
      })
      if (shopError) throw shopError

      toast.success('Account created! Setup karein 🚀')
      router.push('/onboarding')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'fullName',  label: 'Full Name',          icon: User,  type: 'text',     placeholder: 'Ramesh Agrawal',   span: 2 },
    { key: 'shopName',  label: 'Shop Name',           icon: Store, type: 'text',     placeholder: 'Agrawal General Store', span: 1 },
    { key: 'whatsapp',  label: 'WhatsApp Number',     icon: Phone, type: 'text',     placeholder: '919876543210',    span: 1 },
    { key: 'email',     label: 'Business Email',      icon: Mail,  type: 'email',    placeholder: 'owner@store.com', span: 2 },
    { key: 'password',  label: 'Set Password',        icon: Lock,  type: 'password', placeholder: '••••••••',        span: 2 },
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

        {/* Card */}
        <div className="auth-card auth-card-wide">
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: 'rgba(11,176,124,0.1)', border: '1px solid rgba(11,176,124,0.25)',
            borderRadius: '99px', padding: '4px 12px',
            fontSize: '11px', fontWeight: 700, color: 'var(--brand-green)',
            marginBottom: '20px'
          }}>
            <span style={{ width: '6px', height: '6px', background: 'var(--brand-green)', borderRadius: '50%', display: 'inline-block' }} />
            Free to get started · No credit card needed
          </div>

          <h2 className="auth-heading">Create your store</h2>
          <p className="auth-subheading">Set up KiranaAI for your WhatsApp business in minutes</p>

          <form onSubmit={handleRegister}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {fields.map(f => {
                const Icon = f.icon
                return (
                  <div key={f.key} style={{ gridColumn: f.span === 2 ? 'span 2' : 'span 1' }}>
                    <label className="field-label">{f.label}</label>
                    <div className="field-wrap">
                      <Icon size={15} className="field-icon" />
                      <input
                        type={f.type} required
                        value={(form as any)[f.key]}
                        onChange={set(f.key)}
                        className="field-input has-icon"
                        placeholder={f.placeholder}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '20px' }}>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating your store...</>
                : <>Create Store Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--brand-green)', fontWeight: 700, textDecoration: 'none' }}>
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
