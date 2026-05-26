'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, CheckCircle2, ClipboardList } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useParams } from 'next/navigation'
import type { Lesson } from '@/types'

export default function AssignmentPage() {
  const params = useParams()
  const lessonId = params.lessonId as string
  const supabase = createClient()

  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState<{ content: string; status: string } | null>(null)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setAccessDenied(true)
        return
      }

      // Require an active enrollment before showing any lesson content
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('user_id', user.id)
        .eq('course_access', true)
        .maybeSingle()

      if (!enrollment) {
        setAccessDenied(true)
        return
      }

      // Get lesson
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*, module_id')
        .eq('id', lessonId)
        .maybeSingle()

      if (!lessonData) {
        setAccessDenied(true)
        return
      }

      const { data: moduleData } = await supabase
        .from('modules')
        .select('course_id')
        .eq('id', lessonData.module_id)
        .maybeSingle()

      if (!moduleData || moduleData.course_id !== enrollment.course_id) {
        setAccessDenied(true)
        return
      }

      setLesson(lessonData)

      // Check existing submission
      const { data: assignment } = await supabase
        .from('assignments')
        .select('id')
        .eq('lesson_id', lessonId)
        .single()

      if (assignment) {
        const { data: sub } = await supabase
          .from('submissions')
          .select('content, status')
          .eq('assignment_id', assignment.id)
          .eq('user_id', user.id)
          .single()
        if (sub) {
          setExistingSubmission(sub)
          setContent(sub.content || '')
        }
      }
    }
    load()
  }, [lessonId])

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <ClipboardList size={48} className="text-brand-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Enroll to view this lesson</h2>
          <p className="text-dark-300 text-sm mb-6">
            Lesson content is available only after enrollment.
          </p>
          <Link href="/dashboard" className="btn-primary w-full">
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim().length < 50) {
      toast.error('Please write at least 50 characters')
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Please log in'); return }

      // Get or create assignment record
      let { data: assignment } = await supabase
        .from('assignments')
        .select('id')
        .eq('lesson_id', lessonId)
        .maybeSingle()

      if (!assignment) {
        const { data: newAssignment } = await supabase
          .from('assignments')
          .insert({
            lesson_id: lessonId,
            module_id: lesson?.module_id,
            title: lesson?.title || 'Assignment',
            description: lesson?.content || '',
          })
          .select('id')
          .maybeSingle()
        assignment = newAssignment
      }

      if (!assignment) throw new Error('Could not create assignment')

      // Upsert submission
      const { error } = await supabase.from('submissions').upsert({
        assignment_id: assignment.id,
        user_id: user.id,
        content,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      }, { onConflict: 'assignment_id,user_id' })

      if (error) throw error

      // Mark lesson as complete
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: true }),
      })

      setSubmitted(true)
      toast.success('Assignment submitted! Great work 🎉')
    } catch (err) {
      toast.error('Submission failed. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (submitted || existingSubmission?.status === 'submitted' || existingSubmission?.status === 'reviewed') {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Assignment Submitted!</h2>
          <p className="text-dark-300 text-sm mb-6">
            {existingSubmission?.status === 'reviewed'
              ? 'This assignment has been reviewed. Check your feedback below.'
              : 'Your work has been received and will be reviewed soon.'}
          </p>
          {existingSubmission?.status === 'reviewed' && (
            <div className="bg-dark-700 rounded-xl p-4 mb-6 text-left">
              <div className="text-xs text-dark-400 mb-2">Your submission:</div>
              <p className="text-dark-300 text-sm">{existingSubmission.content}</p>
            </div>
          )}
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
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-dark-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="text-brand-400" size={20} />
              {lesson?.title || 'Practical Assignment'}
            </h1>
            <p className="text-dark-400 text-sm mt-0.5">Submit your work for this module</p>
          </div>
        </div>

        {lesson?.content && (
          <div className="card border-brand-500/20 bg-brand-500/5 mb-6">
            <h3 className="font-semibold text-white mb-2">📋 Assignment Brief</h3>
            <p className="text-dark-300 text-sm leading-relaxed">{lesson.content}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-3">Your Work</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Describe what you did, what you created, what you learned, and any links to your work..."
              className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-dark-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 min-h-[250px] resize-y text-sm"
              required
            />
            <p className="text-dark-500 text-xs mt-2">{content.length} characters (min 50)</p>
          </div>

          <div className="bg-dark-700 rounded-xl p-4 text-sm text-dark-400">
            <strong className="text-white">Tips for a great submission:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Be specific about what you did, not just what you planned</li>
              <li>Include links to any content, tools, or documents you created</li>
              <li>Share what worked, what didn't, and what you'd do differently</li>
            </ul>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              <>Submit Assignment</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
