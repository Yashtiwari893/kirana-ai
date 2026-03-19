'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, Lock, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Email aur password dono chahiye')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      const { data: shop } = await supabase
        .from('shops')
        .select('eleven_za_phone_id')
        .eq('user_id', data.user.id)
        .single()

      toast.success('Welcome back! 🏪')
      router.push(shop?.eleven_za_phone_id ? '/dashboard' : '/onboarding')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="mesh-container">
        <div className="mesh-blob mesh-blob-1" />
        <div className="mesh-blob mesh-blob-2" />
        <div className="mesh-blob mesh-blob-3" />
      </div>

      <div style={{ width: '100%', maxWidth: '440px', zIndex: 10 }}>
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🏪</div>
          <span className="auth-logo-name">Kirana<span>AI</span></span>
        </div>

        {/* Card */}
        <div className="auth-card">
          <h2 className="auth-heading">Welcome back</h2>
          <p className="auth-subheading">Sign in to manage your WhatsApp store</p>

          <form onSubmit={handleLogin}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <div className="field-wrap">
                <Mail size={16} className="field-icon" />
                <input
                  type="email" required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="field-input has-icon"
                  placeholder="you@store.com"
                />
              </div>
            </div>

            <div className="field-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label className="field-label" style={{ marginBottom: 0 }}>Password</label>
                <Link href="#" style={{ fontSize: '12px', color: 'var(--brand-green)', fontWeight: 600, textDecoration: 'none' }}>
                  Forgot?
                </Link>
              </div>
              <div className="field-wrap">
                <Lock size={16} className="field-icon" />
                <input
                  type="password" required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="field-input has-icon"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                : <>Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={{
            marginTop: '24px', paddingTop: '20px',
            borderTop: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              New to KiranaAI?{' '}
              <Link href="/register" style={{ color: 'var(--brand-green)', fontWeight: 700, textDecoration: 'none' }}>
                Create Account →
              </Link>
            </p>
          </div>
        </div>

        {/* Security Note */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
          <ShieldCheck size={13} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>256-bit AES encrypted · Powered by Supabase</span>
        </div>
      </div>
    </div>
  )
}
