'use client'
import { useState, useEffect, useCallback } from 'react'
import { Smartphone, Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'form' | 'pending' | 'success' | 'failed'

const COURSE_ID = process.env.NEXT_PUBLIC_COURSE_ID || 'ai-for-beginners'

export default function EnrollmentSection() {
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [checkoutRequestId, setCheckoutRequestId] = useState('')
  const [receiptNo, setReceiptNo] = useState('')
  const [pollCount, setPollCount] = useState(0)

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.length < 2) e.name = 'Enter your full name'
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.phone || !/^(07|01|2547|2541|\+2547|\+2541)\d{8}$/.test(form.phone.replace(/\s/g, '')))
      e.phone = 'Enter a valid Safaricom/Airtel number (07XXXXXXXX or 01XXXXXXXX)'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      // First get course ID
      const courseRes = await fetch('/api/courses/slug/ai-for-beginners')
      const courseData = await courseRes.json()

      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.toLowerCase().trim(),
          phone: form.phone.trim(),
          courseId: courseData.id,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to initiate payment')
        return
      }

      setCheckoutRequestId(data.checkoutRequestId)
      setStep('pending')
      setPollCount(0)
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Poll for payment status every 3 seconds (max 40 attempts = 2 min)
  const pollStatus = useCallback(async () => {
    if (!checkoutRequestId || step !== 'pending') return

    try {
      const res = await fetch(`/api/mpesa/status?checkoutRequestId=${checkoutRequestId}`)
      const data = await res.json()

      if (data.status === 'completed') {
        setReceiptNo(data.receipt || data.transactionId || '')
        setStep('success')
      } else if (data.status === 'failed' || data.status === 'cancelled') {
        setStep('failed')
      } else {
        // Still pending
        setPollCount(c => c + 1)
        if (pollCount >= 40) {
          toast.error('Payment timeout. Please check your M-Pesa and try again.')
          setStep('failed')
        }
      }
    } catch {
      // Silently continue polling
    }
  }, [checkoutRequestId, step, pollCount])

  useEffect(() => {
    if (step !== 'pending') return
    const interval = setInterval(pollStatus, 3000)
    return () => clearInterval(interval)
  }, [step, pollStatus])

  const inputClass = (field: string) =>
    `w-full bg-dark-700 border rounded-xl px-4 py-3.5 text-white placeholder-dark-400 outline-none transition-all focus:ring-2 focus:ring-brand-500/50 ${
      errors[field] ? 'border-red-500' : 'border-dark-600 hover:border-dark-500 focus:border-brand-500'
    }`

  return (
    <section id="enroll" className="py-24 bg-dark-800/50">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="section-label mb-3">Get Started Today</p>
          <h2 className="text-4xl font-bold text-white mb-4">Enroll in 60 Seconds</h2>
          <p className="text-dark-300">Pay with M-Pesa — no card or account needed</p>
        </div>

        <div className="card">
          {/* --- FORM STEP --- */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Amina Wanjiku"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className={inputClass('name')}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={inputClass('email')}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-300 mb-2">M-Pesa Phone Number</label>
                <div className="relative">
                  <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type="tel"
                    placeholder="0712 345 678"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className={`${inputClass('phone')} pl-10`}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                <p className="text-dark-500 text-xs mt-1">We'll send an STK Push to this number</p>
              </div>

              {/* Summary */}
              <div className="bg-dark-700 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white font-medium">AI for Beginners Course</div>
                  <div className="text-xs text-dark-400">Lifetime access · 8 modules</div>
                </div>
                <div className="text-xl font-bold text-brand-400">KES 3,000</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Initiating Payment...</>
                ) : (
                  <>Pay KES 3,000 via M-Pesa <ArrowRight size={18} /></>
                )}
              </button>

              <p className="text-xs text-dark-500 text-center">
                By enrolling you agree to our Terms of Service. Secure payment via Safaricom M-Pesa.
              </p>
            </form>
          )}

          {/* --- PENDING STEP --- */}
          {step === 'pending' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-brand-500/10 border-2 border-brand-500/30 flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                <Smartphone size={32} className="text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Check Your Phone</h3>
              <p className="text-dark-300 mb-6">
                An M-Pesa prompt has been sent to{' '}
                <span className="text-white font-medium">{form.phone}</span>.
                Enter your M-Pesa PIN to complete payment.
              </p>
              <div className="bg-dark-700 rounded-xl p-4 mb-6">
                <div className="text-sm text-dark-300 mb-1">Waiting for payment confirmation...</div>
                <div className="flex items-center justify-center gap-2 text-brand-400">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm font-medium">
                    Checking status ({pollCount * 3}s / 2min)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setStep('form')}
                className="text-dark-400 hover:text-white text-sm transition-colors"
              >
                ← Cancel and go back
              </button>
            </div>
          )}

          {/* --- SUCCESS STEP --- */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={36} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Payment Confirmed! 🎉</h3>
              {receiptNo && (
                <div className="text-dark-400 text-sm mb-4">
                  Receipt: <span className="font-mono text-white">{receiptNo}</span>
                </div>
              )}
              <p className="text-dark-300 mb-6">
                Welcome to <strong className="text-white">AI for Beginners!</strong> Check your email at{' '}
                <span className="text-brand-400">{form.email}</span> for your access details.
              </p>
              <a href="/dashboard" className="btn-primary w-full">
                Go to Your Dashboard →
              </a>
            </div>
          )}

          {/* --- FAILED STEP --- */}
          {step === 'failed' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
                <XCircle size={36} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Not Completed</h3>
              <p className="text-dark-300 mb-6">
                The payment was cancelled or timed out. Please try again. Make sure you have sufficient M-Pesa balance.
              </p>
              <button
                onClick={() => { setStep('form'); setErrors({}) }}
                className="btn-primary w-full"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
