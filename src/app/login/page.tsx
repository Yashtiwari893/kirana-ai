'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, KeyRound, ArrowRight, Loader2, Info } from 'lucide-react'

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
    if (!email || !password) return toast.error('Kripya details bharein')
    
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      const { data: shop } = await supabase
        .from('shops')
        .select('eleven_za_phone_id')
        .eq('user_id', data.user.id)
        .single()

      if (!shop?.eleven_za_phone_id) {
        toast.success('Welcome! Finishing background setup...')
        router.push('/onboarding')
      } else {
        toast.success('Login Successful! 🏪')
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container relative overflow-hidden">
      {/* Mesh Background Components */}
      <div className="mesh-container">
        <div className="mesh-gradient" />
        <div className="mesh-gradient-2" />
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]" />
      </div>

      <div className="auth-box z-10 animate-fade-in">
        {/* Branding Logo */}
        <div className="flex items-center justify-center gap-2 mb-8 group cursor-pointer">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <span className="text-xl">🏪</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Kirana<span className="text-emerald-500">AI</span></h1>
        </div>

        {/* Login Card */}
        <div className="glass-card">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-sm text-slate-400">Enter your credentials to manage your store</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="label-premium">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" required 
                  value={email} onChange={e => setEmail(e.target.value)} 
                  className="input-premium pl-12" 
                  placeholder="name@store.com" 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label-premium m-0">Password</label>
                <Link href="#" className="text-xs text-emerald-500 hover:text-emerald-400 font-semibold transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" required 
                  value={password} onChange={e => setPassword(e.target.value)} 
                  className="input-premium pl-12" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-green mt-2">
              {loading ? (
                <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Processing...</div>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have a shop yet? <Link href="/register" className="text-emerald-500 font-bold hover:text-emerald-400 ml-1 transition-colors underline-offset-4 hover:underline">Register Now</Link>
          </p>
        </div>

        {/* Simple Footer/Info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-slate-600 font-medium">
          <Info size={12} />
          <span>Secure AES-256 encrypted authentication</span>
        </div>
      </div>
    </div>
  )
}
