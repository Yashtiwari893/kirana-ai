'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'
import { User, Mail, Lock, Store, Phone, ArrowUpRight, Loader2, Sparkles } from 'lucide-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [shopName, setShopName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Registration error')

      const { error: shopError } = await supabase.from('shops').insert({
        user_id: authData.user.id,
        shop_name: shopName,
        whatsapp_number: whatsapp,
        is_active: true
      })

      if (shopError) throw shopError

      toast.success('Account Created! Welcome 🎉')
      router.push('/onboarding')
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

      <div className="auth-box max-w-[550px] z-10 animate-fade-in py-10">
        <div className="flex items-center justify-center gap-2 mb-8 group cursor-pointer">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
            <span className="text-xl">🏪</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Kirana<span className="text-emerald-500">AI</span></h1>
        </div>

        <div className="glass-card">
          <div className="mb-8 text-center flex flex-col items-center">
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[10px] font-bold text-emerald-400 mb-4 animate-pulse">
              <Sparkles size={10} /> PHASE 1 EARLY ACCESS
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Store Account</h2>
            <p className="text-sm text-slate-400 max-w-[300px]">Join 500+ Indian shops using AI to automate growth</p>
          </div>

          <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
            <div className="md:col-span-2 space-y-2">
              <label className="label-premium">Proprietor Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input-premium pl-12" placeholder="Harshvardhan Singh" />
              </div>
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="label-premium">Shop Name</label>
              <div className="relative">
                <Store size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" required value={shopName} onChange={e => setShopName(e.target.value)} className="input-premium pl-12" placeholder="Agrawal Store" />
              </div>
            </div>

            <div className="md:col-span-1 space-y-2">
              <label className="label-premium">WhatsApp No.</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="input-premium pl-12" placeholder="91987..." />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="label-premium">Business Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-premium pl-12" placeholder="owner@store.com" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="label-premium">Set Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input-premium pl-12" placeholder="••••••••" />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <button type="submit" disabled={loading} className="btn-green py-4">
                {loading ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Building your store...</div> : <>Get Started <ArrowUpRight size={18} /></>}
              </button>
            </div>
          </form>

          <footer className="mt-8 text-center border-t border-slate-800 pt-6">
            <p className="text-slate-500 text-xs">
              Already have an account? <Link href="/login" className="text-emerald-500 font-bold hover:underline underline-offset-4 ml-1">Sign In</Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
