import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { buildCertificateId, formatCertificateDate, getCertificateStatus } from '@/lib/certificate'
import Link from 'next/link'
import CertificateClient from './CertificateClient'

export default async function CertificatePage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/dashboard/certificate')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

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
    enrollment = null
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-3">No active enrollment</h1>
          <p className="text-dark-300 mb-6">You need an active enrollment before generating a certificate.</p>
          <Link href="/#enroll" className="btn-primary w-full">Enroll Now</Link>
        </div>
      </div>
    )
  }

  const { data: progress } = await supabase
    .from('progress')
    .select('lesson_id, completed')
    .eq('user_id', user.id)

  let capstoneProject = null
  try {
    const { data } = await supabase
      .from('capstone_projects')
      .select('status, certificate_issued, submitted_at')
      .eq('user_id', user.id)
      .eq('course_id', enrollment.course_id)
      .single()
    capstoneProject = data
  } catch {
    capstoneProject = null
  }

  const { data: modules } = await supabase
    .from('modules')
    .select('*, lessons(id, lesson_type, is_active)')
    .eq('course_id', enrollment.course_id)
    .eq('is_active', true)

  const totalLessons = modules?.flatMap((module) => module.lessons || []).filter((lesson) => lesson.lesson_type !== 'assignment').length || 0
  const completedLessons = progress?.filter((item) => item.completed).length || 0
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
  const certificateStatus = getCertificateStatus(progressPct, capstoneProject?.status)

  if (certificateStatus === 'locked') {
    return (
      <div className="min-h-screen bg-dark-900 px-4 py-8 flex items-center justify-center">
        <div className="card max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-brand-400 text-2xl">🏆</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Certificate not ready yet</h1>
          <p className="text-dark-300 mb-6">
            Finish at least 80% of the lessons and submit your capstone project to unlock your certificate.
          </p>
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Progress</span>
              <span className="text-white">{progressPct}%</span>
            </div>
            <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Capstone</span>
              <span className="text-white capitalize">{capstoneProject?.status || 'not started'}</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/dashboard" className="btn-secondary">Back to Dashboard</Link>
            <Link href="/dashboard/capstone" className="btn-primary">Go to Capstone</Link>
          </div>
        </div>
      </div>
    )
  }

  const issueDate = formatCertificateDate(capstoneProject?.submitted_at || enrollment.completed_at || enrollment.enrolled_at)
  const certificateId = buildCertificateId(user.id, enrollment.course_id)
  const verificationCode = `${certificateId}-${enrollment.course_id.slice(0, 6).toUpperCase()}`

  return (
    <CertificateClient
      certificateId={certificateId}
      name={profile?.name || user.email || 'Learner'}
      courseTitle={enrollment.courses?.title || 'AI for Beginners'}
      issueDate={issueDate}
      progressPct={progressPct}
      verificationCode={verificationCode}
    />
  )
}