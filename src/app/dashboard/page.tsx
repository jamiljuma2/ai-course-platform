// app/dashboard/page.tsx
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/lms/DashboardClient'
import { getCertificateStatus } from '@/lib/certificate'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const authRole = user.user_metadata?.role

  if (profile?.role === 'admin' || authRole === 'admin') {
    redirect('/admin')
  }

  // Fetch enrollment (try to find any active enrollment, or return null)
  let enrollment = null
  try {
    const { data } = await supabase
      .from('enrollments')
      .select('*, courses(*)')
      .eq('user_id', user.id)
      .eq('course_access', true)
      .single()
    enrollment = data
  } catch {
    // User not enrolled yet
  }

  // If not enrolled, show enrollment prompt
  if (!enrollment) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Welcome, {profile?.name?.split(' ')[0]}!</h1>
          <p className="text-dark-300 mb-8">You're logged in, but not yet enrolled in any courses.</p>
          
          <div className="card p-8 mb-6">
            <p className="text-dark-400 mb-6">
              Enroll in <span className="text-brand-400 font-semibold">AI for Beginners</span> to get started:
            </p>
            <Link href="/#enroll" className="btn-primary w-full inline-block mb-4">
              Enroll for KES 2,500
            </Link>
            <Link href="/" className="btn-secondary w-full inline-block">
              View Course Info
            </Link>
          </div>

          <p className="text-xs text-dark-500">
            Already completed payment? <a href="/" className="text-brand-400 hover:underline">Refresh the page</a>
          </p>
        </div>
      </div>
    )
  }

  // Fetch modules with lessons
  const { data: modules } = await supabase
    .from('modules')
    .select(`
      *,
      lessons(id, title, duration_min, order_index, lesson_type, is_preview, is_active)
    `)
    .eq('course_id', enrollment.course_id)
    .eq('is_active', true)
    .order('order_index')

  // Fetch user progress
  const { data: progress } = await supabase
    .from('progress')
    .select('lesson_id, completed, completed_at')
    .eq('user_id', user.id)

  let capstoneProject = null
  try {
    const { data } = await supabase
      .from('capstone_projects')
      .select('status, certificate_issued, submitted_at, reviewed_at')
      .eq('user_id', user.id)
      .eq('course_id', enrollment.course_id)
      .single()
    capstoneProject = data
  } catch {
    capstoneProject = null
  }

  const progressMap = new Map(progress?.map(p => [p.lesson_id, p]) || [])

  // Calculate overall progress
  const totalLessons = modules?.flatMap(m => m.lessons).filter(l => l.lesson_type !== 'assignment').length || 0
  const completedLessons = progress?.filter(p => p.completed).length || 0
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const certificateStatus = getCertificateStatus(progressPct, capstoneProject?.status)

  return (
    <DashboardClient
      profile={profile}
      enrollment={enrollment}
      modules={modules || []}
      progressMap={Object.fromEntries(progressMap)}
      progressPct={progressPct}
      totalLessons={totalLessons}
      completedLessons={completedLessons}
      certificateStatus={certificateStatus}
    />
  )
}
