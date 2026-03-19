'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

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
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      if (!data.user) throw new Error('Could not authenticate user')

      // Check if onboarding is complete
      const { data: shop } = await supabase
        .from('shops')
        .select('eleven_za_phone_id')
        .eq('user_id', data.user.id)
        .single()

      if (!shop?.eleven_za_phone_id) {
        toast.success('Welcome back! Completing setup...')
        router.push('/onboarding')
      } else {
        toast.success('Login successful! 🏪')
        router.push('/dashboard')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-navy">
      <div className="card w-full max-w-sm p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">KiranaAI 🏪</h1>
          <p className="text-slate-400">Welcome back, Shop Owner!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input w-full" placeholder="name@email.com" />
          </div>
          <div>
            <div className="flex justify-between mb-1.5 ml-1">
              <label className="block text-sm font-semibold text-slate-300">Password</label>
              <Link href="#" className="text-xs text-slate-500 hover:text-brand-primary">Forgot?</Link>
            </div>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input w-full" placeholder="••••••••" />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3.5 mt-2 font-bold shadow-lg shadow-green-900/30">
            {loading ? 'Logging in...' : 'Sign In 🗝️'}
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-400 text-sm">
            Don't have a shop yet? <Link href="/register" className="text-brand-primary font-bold hover:underline">Create One Now</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
