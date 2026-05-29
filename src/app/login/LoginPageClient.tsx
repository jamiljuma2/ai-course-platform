'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Mail, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function LoginPageClient() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'

  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [supabase] = useState(() => createClient())

  // removed magic-link helper: using password reset flow instead

  const resolvePostLoginRoute = async (
    userId?: string | null,
    fallbackPath = redirect,
    authRole?: string | null,
  ) => {
    if (!userId) return fallbackPath

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle()

    if (profile?.role === 'admin' || authRole === 'admin') {
      return '/admin'
    }

    return fallbackPath
  }

  const handleForgotPassword = async () => {
    if (!form.email) {
      toast.error('Enter your email first to reset your password')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) toast.error(error.message)
      else toast.success('Password reset link sent. Check your email.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const email = form.email.trim().toLowerCase()
      const password = form.password.trim()

      if (tab === 'signup') {
        const registerResponse = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            email,
            password,
          }),
        })

        const registerResult = await registerResponse.json()
        if (!registerResponse.ok) {
          if (registerResponse.status === 409) {
            toast('Account already exists. Use "Sign In" or "Forgot password" if needed.')
            setTab('login')
          } else {
            toast.error(registerResult.error || 'Could not create your account')
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 500))
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (error) {
            toast.success('Account created. You can sign in now with the same email and password.')
            setTab('login')
          } else {
            toast.success('Account created successfully')
            const nextPath = await resolvePostLoginRoute(data.user?.id, redirect, data.user?.user_metadata?.role)
            router.push(nextPath)
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          const message = error.message.toLowerCase()
          if (message.includes('invalid login credentials') || error.status === 400) {
            const checkResponse = await fetch('/api/auth/check-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email }),
            })

            const checkResult = await checkResponse.json()
            if (checkResponse.ok && checkResult.exists) {
              toast.error('That email exists, but the password is incorrect. Use "Forgot password" to reset it.')
            } else if (checkResponse.ok) {
              toast.error('No account found for that email. Create an account first.')
            } else {
              toast.error('Invalid credentials. Use "Forgot password" to reset your password.')
            }
          } else {
            toast.error(error.message)
          }
        } else {
          const nextPath = await resolvePostLoginRoute(data.user?.id, redirect, data.user?.user_metadata?.role)
          router.push(nextPath)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // magic link sign-in removed; users should use password or Forgot password flow

  const inputClass =
     'w-full bg-white border border-dark-200 rounded-xl px-4 py-3.5 text-dark-900 placeholder-dark-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
         <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold">NG</div>
         <span className="font-bold text-dark-900 text-lg">NextGen Academy</span>
        </Link>

        <div className="card">
          <div className="flex bg-dark-700 rounded-xl p-1 mb-6">
            <div className="flex bg-white rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                    tab === t ? 'bg-brand-600 text-white' : 'text-dark-600 hover:text-dark-800'
                  }`}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-sm text-dark-400 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Amina Wanjiku"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-dark-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`${inputClass} pl-10`}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`${inputClass} pl-10`}
                  required
                  minLength={8}
                />
              </div>
              {tab === 'login' && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-xs text-brand-400 hover:underline disabled:opacity-60"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {tab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 px-3 text-xs text-dark-400">or</span>
            </div>
          </div>

          {/* Magic link sign-in removed by request */}

          <p className="text-center text-dark-500 text-xs mt-4">
            Don't have access?{' '}
            <Link href="/#enroll" className="text-brand-400 hover:underline">
              Enroll for KES 3,000
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
