'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

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
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Signup failed')

      // 2. Create shop record
      const { error: shopError } = await supabase.from('shops').insert({
        user_id: authData.user.id,
        shop_name: shopName,
        whatsapp_number: whatsapp,
        is_active: true
      })

      if (shopError) throw shopError

      toast.success('Registration successful! Please complete onboarding.')
      router.push('/onboarding')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-navy">
      <div className="card w-full max-w-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">KiranaAI 🛍️</h1>
          <p className="text-slate-400">Store register karein aur AI bot start karein</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="form-input w-full" placeholder="Ramesh Kumar" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Shop Name</label>
            <input type="text" required value={shopName} onChange={e => setShopName(e.target.value)} className="form-input w-full" placeholder="Ramesh General Store" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Business WhatsApp Number</label>
            <input type="text" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="form-input w-full" placeholder="919876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input w-full" placeholder="ramesh@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input w-full" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 mt-4">
            {loading ? 'Creating Account...' : 'Register & Continue'}
          </button>
        </form>

        <p className="text-center mt-6 text-slate-400 text-sm">
          Already have an account? <Link href="/login" className="text-brand-primary hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  )
}
