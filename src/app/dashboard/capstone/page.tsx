'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CapstonePage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    portfolio_url: '',
    freelance_service: '',
    business_idea: '',
    content_samples: '',
    automation_flow: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate at least 3 sections filled
    const filled = Object.values(form).filter(v => v.trim().length > 30)
    if (filled.length < 3) {
      toast.error('Please complete at least 3 sections (min 30 chars each)')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Please log in'); return }

      // Get enrollment for course_id
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('course_access', true)
        .maybeSingle()

      if (!enrollment) { toast.error('No active enrollment found'); return }

      const { error } = await supabase.from('capstone_projects').upsert({
        user_id: user.id,
        course_id: enrollment.course_id,
        ...form,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' })

      if (error) throw error

      setSubmitted(true)
      toast.success('Capstone submitted! We\'ll review it within 3 business days. 🎉')
    } catch (err) {
      toast.error('Failed to submit. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const textareaClass = "w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 min-h-[120px] resize-y text-sm"

  if (submitted) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Capstone Submitted! 🏆</h2>
          <p className="text-dark-300 mb-2">
            Your project has been received. We'll review it and send your certificate within 3 business days.
          </p>
          <p className="text-dark-400 text-sm mb-6">Check your email for confirmation.</p>
          <Link href="/dashboard" className="btn-primary w-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-dark-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="text-brand-400" size={24} />
              Final Capstone Project
            </h1>
            <p className="text-dark-400 text-sm mt-1">Submit your work to earn your certificate</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="card border-brand-500/20 bg-brand-500/5 mb-8">
          <h3 className="font-semibold text-white mb-3">📋 What to Include</h3>
          <p className="text-dark-300 text-sm leading-relaxed">
            Your capstone demonstrates everything you've learned. Complete as many sections as possible.
            You need to fill at least <strong className="text-white">3 sections</strong> to submit.
            Be specific — the more detail, the better your feedback and the faster your certificate is issued.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">1</span>
              <h3 className="font-semibold text-white">Portfolio</h3>
            </div>
            <p className="text-dark-400 text-sm mb-3">
              Share your portfolio URL or describe the work you've done during the course. Include links to any websites, documents, or profiles you've built.
            </p>
            <textarea
              value={form.portfolio_url}
              onChange={e => setForm(f => ({ ...f, portfolio_url: e.target.value }))}
              placeholder="My portfolio link: https://... OR description of what I built: During this course I created..."
              className={textareaClass}
            />
          </div>

          {/* Section 2 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">2</span>
              <h3 className="font-semibold text-white">Freelance Service Offer</h3>
            </div>
            <p className="text-dark-400 text-sm mb-3">
              Describe the AI-powered freelance service you've created or plan to offer. Include the service name, description, target client, and pricing.
            </p>
            <textarea
              value={form.freelance_service}
              onChange={e => setForm(f => ({ ...f, freelance_service: e.target.value }))}
              placeholder="Service: AI-Powered Content Writing&#10;Description: I write 10 SEO blog posts per week for SaaS companies using ChatGPT + editing...&#10;Target clients: Tech startups in Kenya and globally&#10;Price: KES 5,000 / article or $30 on Upwork"
              className={textareaClass}
            />
          </div>

          {/* Section 3 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">3</span>
              <h3 className="font-semibold text-white">Business Idea</h3>
            </div>
            <p className="text-dark-400 text-sm mb-3">
              Describe the business concept you developed in Module 5. Include the idea, target market, how AI powers it, and your go-to-market plan.
            </p>
            <textarea
              value={form.business_idea}
              onChange={e => setForm(f => ({ ...f, business_idea: e.target.value }))}
              placeholder="Business: AI Resume Writing Agency for Kenyan Graduates&#10;Problem: 80% of graduates send poor CVs...&#10;Solution: AI-powered CV + cover letter service...&#10;Revenue model: KES 1,500 per CV..."
              className={textareaClass}
            />
          </div>

          {/* Section 4 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">4</span>
              <h3 className="font-semibold text-white">Content Samples</h3>
            </div>
            <p className="text-dark-400 text-sm mb-3">
              Paste 2–3 content pieces you created using AI (blog posts, social media posts, email campaigns, etc.). Include the prompt you used and the result.
            </p>
            <textarea
              value={form.content_samples}
              onChange={e => setForm(f => ({ ...f, content_samples: e.target.value }))}
              placeholder="Sample 1 - LinkedIn post:&#10;Prompt used: 'Write a LinkedIn post about...'&#10;Result: [paste your content here]&#10;&#10;Sample 2 - Blog intro:..."
              className={`${textareaClass} min-h-[160px]`}
            />
          </div>

          {/* Section 5 */}
          <div className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">5</span>
              <h3 className="font-semibold text-white">Automation Workflow</h3>
            </div>
            <p className="text-dark-400 text-sm mb-3">
              Describe the automation(s) you built in Module 6. What tools did you connect? What problem does it solve? How many hours per week does it save?
            </p>
            <textarea
              value={form.automation_flow}
              onChange={e => setForm(f => ({ ...f, automation_flow: e.target.value }))}
              placeholder="Automation 1: New Email Lead → Auto-Save to Google Sheets → Send Welcome WhatsApp&#10;Tools: Gmail + Zapier + WhatsApp Business&#10;Trigger: New email with subject 'Inquiry'&#10;Saves: ~3 hours/week of manual data entry&#10;&#10;Automation 2:..."
              className={textareaClass}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-base"
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <><Award size={18} /> Submit Capstone & Claim Certificate</>
            )}
          </button>

          <p className="text-dark-500 text-xs text-center">
            Your submission will be reviewed within 3 business days. Certificate issued via email.
          </p>
        </form>
      </div>
    </div>
  )
}
