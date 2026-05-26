// app/admin/page.tsx
'use client'
import { useState, useEffect } from 'react'
import {
  Users, DollarSign, TrendingUp, BookOpen,
  Download, RefreshCw, Mail, CheckCircle, XCircle, Clock
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalEnrollments: number
  totalRevenue: number
  recentPayments: Array<{
    id: string
    amount: number
    status: string
    phone: string
    created_at: string
    mpesa_receipt?: string
    users?: { name: string; email: string }
  }>
}

interface Student {
  id: string
  name: string
  email: string
}

interface Lesson {
  id: string
  title: string
  order_index: number
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface ReviewItem {
  id: string
  name: string
  role?: string | null
  rating: number
  comment: string
  avatar_initials: string
  status: 'approved' | 'pending' | 'hidden' | 'published'
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [adminKey, setAdminKey] = useState('')
  const [authed, setAuthed] = useState(false)
  const [meetingTitle, setMeetingTitle] = useState('')
  const [meetingStartTime, setMeetingStartTime] = useState('')
  const [meetingDuration, setMeetingDuration] = useState('60')
  const [meetingLink, setMeetingLink] = useState(process.env.NEXT_PUBLIC_GOOGLE_MEET_LINK || '')
  const [notifyUsers, setNotifyUsers] = useState(true)
  const [certEmail, setCertEmail] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedModule, setSelectedModule] = useState('')
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [markingProgress, setMarkingProgress] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  useEffect(() => {
    const savedAdminKey = window.localStorage.getItem('adminKey')
    if (!savedAdminKey) {
      setLoading(false)
      return
    }

    setAdminKey(savedAdminKey)
    fetchStats(savedAdminKey)
  }, [])

  const meetingEndTime = (() => {
    const start = new Date(meetingStartTime)
    const duration = Number(meetingDuration)
    if (!meetingStartTime || Number.isNaN(start.getTime()) || !Number.isFinite(duration) || duration <= 0) {
      return ''
    }
    return new Date(start.getTime() + duration * 60 * 1000).toLocaleString()
  })()

  const fetchStats = async (keyOverride?: string) => {
    const keyToUse = keyOverride || adminKey

    if (!keyToUse.trim()) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-key': keyToUse }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        if (keyToUse !== adminKey) {
          setAdminKey(keyToUse)
        }
        window.localStorage.setItem('adminKey', keyToUse)
        setAuthed(true)
        // Also fetch students and modules
        fetchStudentsModules(keyToUse)
        fetchReviews(keyToUse)
      } else {
        window.localStorage.removeItem('adminKey')
        setAuthed(false)
        setStats(null)
        alert('Invalid admin key')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsModules = async (keyOverride?: string) => {
    try {
      const res = await fetch('/api/admin/students-modules', {
        headers: { 'x-admin-key': keyOverride || adminKey }
      })
      if (res.ok) {
        const data = await res.json()
        setStudents(data.students)
        setModules(data.modules)
      }
    } catch (e) {
      console.error('Error fetching students/modules:', e)
    }
  }

  const fetchReviews = async (keyOverride?: string) => {
    setReviewsLoading(true)
    try {
      const res = await fetch('/api/admin/reviews', {
        headers: { 'x-admin-key': keyOverride || adminKey }
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(Array.isArray(data.reviews) ? data.reviews : [])
      }
    } catch (e) {
      console.error('Error fetching reviews:', e)
    } finally {
      setReviewsLoading(false)
    }
  }

  const fetchStudentProgress = async (studentId: string) => {
    setProgressLoading(true)
    try {
      const res = await fetch(`/api/admin/student-progress?studentId=${encodeURIComponent(studentId)}`, {
        headers: { 'x-admin-key': adminKey }
      })
      if (res.ok) {
        const data = await res.json()
        setCompletedLessonIds(data.completedLessonIds || [])
      } else {
        setCompletedLessonIds([])
      }
    } catch (e) {
      console.error('Error fetching student progress:', e)
      setCompletedLessonIds([])
    } finally {
      setProgressLoading(false)
    }
  }

  const exportCSV = () => {
    window.open('/api/admin/export?key=' + adminKey, '_blank')
  }

  const scheduleMeeting = async () => {
    try {
      const res = await fetch('/api/admin/schedule', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: meetingTitle,
          start_time: meetingStartTime,
          duration_minutes: Number(meetingDuration),
          meet_link: meetingLink,
          notify: notifyUsers,
        }),
      })
      if (res.ok) {
        alert('Meeting scheduled')
        setMeetingTitle('')
        setMeetingStartTime('')
        setMeetingDuration('60')
      } else {
        const err = await res.json()
        alert(err?.error || 'Failed')
      }
    } catch (e) {
      alert('Failed to schedule meeting')
    }
  }

  const releaseCertificate = async () => {
    try {
      const res = await fetch('/api/admin/release-certificate', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: certEmail.trim() || undefined,
          user_id: selectedStudent || undefined,
        }),
      })
      if (res.ok) {
        const d = await res.json()
        alert('Certificate released: ' + (d.certificateUrl || ''))
        setCertEmail('')
      } else {
        const err = await res.json()
        alert(err?.error || 'Failed')
      }
    } catch (e) {
      alert('Failed to release certificate')
    }
  }

  const moderateReview = async (reviewId: string, status: ReviewItem['status']) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, status }),
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(current => current.map(review => review.id === reviewId ? data.review : review))
      } else {
        const err = await res.json()
        alert(err?.error || 'Failed to update review')
      }
    } catch (e) {
      alert('Failed to update review')
    }
  }

  const toggleLesson = (lessonId: string) => {
    setCompletedLessonIds(current => {
      if (current.includes(lessonId)) {
        return current.filter(id => id !== lessonId)
      }
      return [...current, lessonId]
    })
  }

  const saveSelectedProgress = async () => {
    if (!selectedStudent) {
      alert('Please select a student')
      return
    }

    setMarkingProgress(true)
    try {
      const allLessonIds = modules.flatMap(module => module.lessons.map(lesson => lesson.id))
      const res = await fetch('/api/admin/mark-progress', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent,
          lessonIds: allLessonIds,
          completedLessonIds,
          batch: true,
        }),
      })

      if (res.ok) {
        alert('Progress saved')
      } else {
        const err = await res.json()
        alert(err?.error || 'Failed to save progress')
      }
    } catch (e) {
      alert('Failed to save progress')
    } finally {
      setMarkingProgress(false)
    }
  }

  const markLessonComplete = async (lessonId: string) => {
    if (!selectedStudent) {
      alert('Please select a student')
      return
    }
    setMarkingProgress(true)
    try {
      const res = await fetch('/api/admin/mark-progress', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedStudent, lessonId }),
      })
      if (res.ok) {
        alert('Lesson marked as complete')
      } else {
        const err = await res.json()
        alert(err?.error || 'Failed')
      }
    } catch (e) {
      alert('Failed to mark progress')
    } finally {
      setMarkingProgress(false)
    }
  }

  const markModuleComplete = async () => {
    if (!selectedStudent) {
      alert('Please select a student')
      return
    }
    if (!selectedModule) {
      alert('Please select a module')
      return
    }

    const module = modules.find(m => m.id === selectedModule)
    if (!module || !module.lessons) {
      alert('Module or lessons not found')
      return
    }

    const allLessonIds = module.lessons.map(l => l.id)
    setMarkingProgress(true)
    try {
      const res = await fetch('/api/admin/mark-progress', {
        method: 'POST',
        headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudent,
          lessonIds: allLessonIds,
          completedLessonIds: allLessonIds,
          batch: true,
        }),
      })

      if (res.ok) {
        alert(`Module "${module.title}" marked as complete for this student`)
        setSelectedModule('')
      } else {
        const err = await res.json()
        alert(err?.error || 'Failed to mark module complete')
      }
    } catch (e) {
      alert('Failed to mark module complete')
    } finally {
      setMarkingProgress(false)
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      completed: { icon: <CheckCircle size={12} />, cls: 'text-brand-700 bg-brand-50 border border-brand-100' },
      pending: { icon: <Clock size={12} />, cls: 'text-amber-700 bg-amber-50 border border-amber-100' },
      failed: { icon: <XCircle size={12} />, cls: 'text-red-700 bg-red-50 border border-red-100' },
    }
    const { icon, cls } = map[status] || { icon: null, cls: 'text-dark-600 bg-white border border-brand-100' }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {icon}{status}
      </span>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-brand-50 to-brand-100/50 flex items-center justify-center px-4">
        <div className="card max-w-sm w-full">
          <h2 className="text-xl font-bold text-dark-900 mb-6">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats()}
            className="w-full bg-white border border-brand-100 rounded-xl px-4 py-3 text-dark-900 mb-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
          />
          <button onClick={() => fetchStats()} className="btn-primary w-full">
            Access Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/60 to-white p-3 sm:p-6 lg:p-8 overflow-x-hidden text-dark-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-dark-900">Admin Dashboard</h1>
            <p className="text-dark-600 text-xs sm:text-sm mt-1">AI for Beginners Course</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchStats()} className="btn-secondary text-sm">
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={exportCSV} className="btn-secondary text-sm">
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {[
                { label: 'Total Students', value: stats.totalUsers, icon: Users, color: 'text-brand-700' },
                { label: 'Active Enrollments', value: stats.totalEnrollments, icon: BookOpen, color: 'text-brand-600' },
                { label: 'Revenue (KES)', value: `${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-brand-700' },
                { label: 'Avg. Order', value: stats.totalEnrollments > 0 ? `${Math.round(stats.totalRevenue / stats.totalEnrollments).toLocaleString()}` : '0', icon: TrendingUp, color: 'text-brand-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card soft-glow">
                  <Icon size={20} className={`${color} mb-3`} />
                  <div className="text-2xl font-bold text-dark-900">{value}</div>
                  <div className="text-xs text-dark-600 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Meetings + Certificates + Mark Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
              <div className="card">
                <h3 className="text-lg font-bold text-dark-900 mb-3">Mark Module Complete</h3>
                <div className="mb-3">
                  <label className="block text-xs text-dark-600 mb-1">Select Student</label>
                  <select 
                    value={selectedStudent} 
                    onChange={e => {
                      setSelectedStudent(e.target.value)
                      setSelectedModule('')
                      setCompletedLessonIds([])
                    }}
                    className="w-full bg-white border border-brand-100 rounded-lg px-3 py-2 text-dark-900 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  >
                    <option value="">Choose a student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-xs text-dark-600 mb-1">Select Module</label>
                  <select 
                    value={selectedModule} 
                    onChange={e => setSelectedModule(e.target.value)}
                    disabled={!selectedStudent}
                    className="w-full bg-white border border-brand-100 rounded-lg px-3 py-2 text-dark-900 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50"
                  >
                    <option value="">Choose a module...</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>Module {m.order_index}: {m.title}</option>
                    ))}
                  </select>
                </div>
                {selectedModule && (
                  <div className="mb-3 p-2 bg-brand-50 border border-brand-100 rounded text-xs text-dark-600">
                    {modules.find(m => m.id === selectedModule)?.lessons.length || 0} lessons will be marked complete
                  </div>
                )}
                <button 
                  onClick={markModuleComplete} 
                  disabled={!selectedStudent || !selectedModule || markingProgress}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingProgress ? 'Marking...' : 'Mark Module Complete'}
                </button>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-dark-900 mb-3">Schedule Live Session</h3>
                <input className="w-full mb-2 bg-white border border-brand-100 p-2 rounded-lg text-dark-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Title" value={meetingTitle} onChange={e=>setMeetingTitle(e.target.value)} />
                <label className="block text-xs text-dark-600 mb-1">Start Time</label>
                <input type="datetime-local" className="w-full mb-2 bg-white border border-brand-100 p-2 rounded-lg text-dark-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" value={meetingStartTime} onChange={e=>setMeetingStartTime(e.target.value)} />
                <label className="block text-xs text-dark-600 mb-1">Duration (minutes)</label>
                <input type="number" min="1" className="w-full mb-2 bg-white border border-brand-100 p-2 rounded-lg text-dark-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" value={meetingDuration} onChange={e=>setMeetingDuration(e.target.value)} />
                <div className="w-full mb-2 bg-brand-50 border border-brand-100 p-2 rounded-lg text-dark-600 text-sm">
                  End Time: {meetingEndTime || 'Auto-calculated after duration is set'}
                </div>
                <input className="w-full mb-2 bg-white border border-brand-100 p-2 rounded-lg text-dark-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Meet link" value={meetingLink} onChange={e=>setMeetingLink(e.target.value)} />
                <div className="flex items-center gap-2 mb-3">
                  <input id="notify" type="checkbox" checked={notifyUsers} onChange={e=>setNotifyUsers(e.target.checked)} />
                  <label htmlFor="notify" className="text-sm text-dark-600">Notify enrolled users</label>
                </div>
                <div className="flex gap-2">
                  <button onClick={scheduleMeeting} className="btn-primary">Schedule & Notify</button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-dark-900 mb-3">Release Certificate</h3>
                <input className="w-full mb-2 bg-white border border-brand-100 p-2 rounded-lg text-dark-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" placeholder="Student email" value={certEmail} onChange={e=>setCertEmail(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={releaseCertificate} className="btn-primary">Release Certificate</button>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="card">
              <h2 className="text-lg font-bold text-dark-900 mb-4">Recent Payments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-100">
                      <th className="text-left py-3 text-dark-600 font-medium">Student</th>
                      <th className="text-left py-3 text-dark-600 font-medium">Phone</th>
                      <th className="text-left py-3 text-dark-600 font-medium">Amount</th>
                      <th className="text-left py-3 text-dark-600 font-medium">Status</th>
                      <th className="text-left py-3 text-dark-600 font-medium">Receipt</th>
                      <th className="text-left py-3 text-dark-600 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-100">
                    {stats.recentPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-brand-50/80 transition-colors">
                        <td className="py-3">
                          <div className="text-dark-900 font-medium">{payment.users?.name || '—'}</div>
                          <div className="text-dark-500 text-xs">{payment.users?.email || '—'}</div>
                        </td>
                        <td className="py-3 text-dark-700 font-mono text-xs">{payment.phone}</td>
                        <td className="py-3 text-dark-900 font-medium">KES {payment.amount.toLocaleString()}</td>
                        <td className="py-3">{statusBadge(payment.status)}</td>
                        <td className="py-3 text-dark-700 font-mono text-xs">{payment.mpesa_receipt || '—'}</td>
                        <td className="py-3 text-dark-600 text-xs">
                          {new Date(payment.created_at).toLocaleDateString('en-KE', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {stats.recentPayments.length === 0 && (
                  <div className="text-center py-12 text-dark-600">No payments yet</div>
                )}
              </div>
            </div>

            {/* Review Moderation */}
            <div className="card">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-dark-900">Review Moderation</h2>
                  <p className="text-dark-600 text-sm mt-1">Approve learner reviews before they appear on the public landing page.</p>
                </div>
                <button onClick={() => fetchReviews()} className="btn-secondary text-sm">
                  <RefreshCw size={14} /> Refresh Reviews
                </button>
              </div>

              {reviewsLoading ? (
                <div className="text-dark-600 text-sm py-8 text-center">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-dark-600">No reviews submitted yet</div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-full bg-white border border-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                            {review.avatar_initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-dark-900">{review.name}</h3>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide bg-white border border-brand-100 text-dark-600">
                                {review.status === 'published' ? 'approved' : review.status}
                              </span>
                            </div>
                            <p className="text-xs text-dark-500 mt-1">{review.role || 'Learner'}</p>
                            <p className="text-sm text-dark-700 mt-3 leading-relaxed max-w-3xl">{review.comment}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-3 lg:items-end">
                          <div className="text-sm text-dark-700 font-semibold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => moderateReview(review.id, 'approved')}
                              className="btn-primary px-3 py-2 text-xs"
                              disabled={review.status === 'approved'}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => moderateReview(review.id, 'pending')}
                              className="btn-secondary px-3 py-2 text-xs"
                              disabled={review.status === 'pending'}
                            >
                              Set Pending
                            </button>
                            <button
                              onClick={() => moderateReview(review.id, 'hidden')}
                              className="btn-secondary px-3 py-2 text-xs"
                              disabled={review.status === 'hidden'}
                            >
                              Hide
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
