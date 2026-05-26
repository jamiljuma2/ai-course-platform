"use client"

import { useEffect, useMemo, useState } from 'react'
import { Loader2, MessageCircle, Send, Star } from 'lucide-react'
import toast from 'react-hot-toast'

type Review = {
  id: string
  name: string
  role?: string | null
  rating: number
  comment: string
  avatar_initials: string
  created_at: string
}

const starArray = [1, 2, 3, 4, 5]

const initialForm = {
  name: '',
  role: '',
  rating: 5,
  comment: '',
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(initialForm)

  useEffect(() => {
    let active = true

    const loadReviews = async () => {
      try {
        const res = await fetch('/api/reviews')
        const data = await res.json()
        if (active && res.ok) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : [])
        }
      } catch {
        if (active) setReviews([])
      } finally {
        if (active) setLoadingReviews(false)
      }
    }

    loadReviews()

    return () => {
      active = false
    }
  }, [])

  const averageRating = useMemo(() => {
    if (!reviews.length) return 5
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [reviews])

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault()

    if (form.name.trim().length < 2) {
      toast.error('Please enter your name')
      return
    }

    if (form.comment.trim().length < 20) {
      toast.error('Please write at least 20 characters')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to submit review')
        return
      }

      setForm(initialForm)
      toast.success(data.message || 'Thanks for sharing your review! It will appear after moderation.')
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="reviews" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Student Success Stories</p>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4">
            Real Results and Fresh Reviews
          </h2>
          <p className="text-dark-600 text-lg max-w-2xl mx-auto">
            Read verified learner reviews, then leave your own rating, comment, and story. New submissions are reviewed before they go public.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm text-dark-700">
            <Star size={16} className="text-brand-600 fill-brand-600" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span>average from {reviews.length} verified reviews</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="card bg-gradient-to-br from-brand-50 via-white to-brand-100/60 border-brand-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-dark-900">What students are saying right now</h3>
                  <p className="text-dark-600 text-sm">Only approved reviews from real learners appear here after moderation.</p>
                </div>
              </div>

              {loadingReviews ? (
                <div className="flex items-center gap-2 text-dark-600 text-sm py-6">
                  <Loader2 size={16} className="animate-spin text-brand-600" />
                  Loading recent reviews...
                </div>
              ) : reviews.length ? (
                <div className="space-y-4">
                  {reviews.slice(0, 4).map(review => (
                    <article key={review.id} className="rounded-2xl border border-brand-100 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                            {review.avatar_initials}
                          </div>
                          <div>
                            <div className="font-semibold text-dark-900">{review.name}</div>
                            <div className="text-xs text-dark-500">{review.role || 'Verified learner'}</div>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {starArray.map(star => (
                            <Star
                              key={star}
                              size={14}
                              className={star <= review.rating ? 'text-brand-500 fill-brand-500' : 'text-brand-100'}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-dark-600">{review.comment}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-brand-200 bg-white/70 p-5 text-sm text-dark-600">
                  No verified reviews yet. Be the first to share one.
                </div>
              )}
            </div>
          </div>

          <div className="card border-brand-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] sticky top-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700">
                <Send size={18} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dark-900">Leave a review</h3>
                <p className="text-sm text-dark-600">Tell other learners what changed for you.</p>
              </div>
            </div>

            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Your Name</label>
                <input
                  value={form.name}
                  onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-dark-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Amina Wanjiku"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Role or Title</label>
                <input
                  value={form.role}
                  onChange={event => setForm(current => ({ ...current, role: event.target.value }))}
                  className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-dark-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  placeholder="Student, Freelancer, Entrepreneur..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {starArray.map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm(current => ({ ...current, rating: star }))}
                      className="rounded-full p-1 transition-transform hover:scale-110"
                      aria-label={`Set rating to ${star} star${star === 1 ? '' : 's'}`}
                    >
                      <Star
                        size={22}
                        className={star <= form.rating ? 'text-brand-500 fill-brand-500' : 'text-brand-200'}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-dark-500">{form.rating}/5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-600 mb-2">Comment</label>
                <textarea
                  value={form.comment}
                  onChange={event => setForm(current => ({ ...current, comment: event.target.value }))}
                  className="w-full min-h-[160px] rounded-xl border border-brand-100 bg-white px-4 py-3 text-dark-900 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-y"
                  placeholder="Share what you achieved after taking the course..."
                />
                <p className="mt-2 text-xs text-dark-500">Minimum 20 characters.</p>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full text-base disabled:opacity-60">
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Publishing Review...</>
                ) : (
                  'Submit Review'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
