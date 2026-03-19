'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { createBrowserClient } from '@supabase/ssr'

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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      // Update shop with 11za creds
      const { error } = await supabase
        .from('shops')
        .update({
          eleven_za_api_key: authToken,
          origin_website: originWebsite,
          eleven_za_phone_id: phoneId,
          is_active: true
        })
        .eq('user_id', user.id)

      if (error) throw error

      toast.success('Onboarding complete! Your shop is live! 🚀')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-navy">
      <div className="card w-full max-w-md p-8 shadow-2xl animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-primary/20 text-brand-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Connect 11za 🔗</h1>
          <p className="text-slate-400">Step 2: AI Bot ko WhatsApp se connect karein</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">11za Auth Token</label>
            <input type="text" required value={authToken} onChange={e => setAuthToken(e.target.value)} className="form-input w-full" placeholder="token_here..." />
            <p className="text-[10px] text-slate-500 mt-1">11za Dashboard → Copy API Token</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Origin Website/URL</label>
            <input type="url" required value={originWebsite} onChange={e => setOriginWebsite(e.target.value)} className="form-input w-full" placeholder="https://kirana-ai.shop" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">11za Phone Number ID</label>
            <input type="text" required value={phoneId} onChange={e => setPhoneId(e.target.value)} className="form-input w-full" placeholder="ID from Settings..." />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 mt-4 text-white font-bold shadow-lg shadow-green-900/40">
            {loading ? 'Saving Setup...' : 'Finish Setup & Open Dashboard ✨'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400">
            <strong>💡 Pro Tip:</strong> Testing ke liye aap 11za dashboard se sample phone ID bhi add kar sakte hain.
          </p>
        </div>
      </div>
    </div>
  )
}
