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
  const [selectedStudent, setSelectedStudent] = useState('')
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [markingProgress, setMarkingProgress] = useState(false)
  const [progressLoading, setProgressLoading] = useState(false)

  const meetingEndTime = (() => {
    const start = new Date(meetingStartTime)
    const duration = Number(meetingDuration)
    if (!meetingStartTime || Number.isNaN(start.getTime()) || !Number.isFinite(duration) || duration <= 0) {
      return ''
    }
    return new Date(start.getTime() + duration * 60 * 1000).toLocaleString()
  })()

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-key': adminKey }
      })
      if (res.ok) {
        const data = await res.json()
        setStats(data)
        setAuthed(true)
        // Also fetch students and modules
        fetchStudentsModules()
      } else {
        alert('Invalid admin key')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentsModules = async () => {
    try {
      const res = await fetch('/api/admin/students-modules', {
        headers: { 'x-admin-key': adminKey }
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
        body: JSON.stringify({ email: certEmail }),
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

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: React.ReactNode; cls: string }> = {
      completed: { icon: <CheckCircle size={12} />, cls: 'text-green-400 bg-green-400/10' },
      pending: { icon: <Clock size={12} />, cls: 'text-yellow-400 bg-yellow-400/10' },
      failed: { icon: <XCircle size={12} />, cls: 'text-red-400 bg-red-400/10' },
    }
    const { icon, cls } = map[status] || { icon: null, cls: 'text-dark-400 bg-dark-700' }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
        {icon}{status}
      </span>
    )
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
        <div className="card max-w-sm w-full">
          <h2 className="text-xl font-bold text-white mb-6">Admin Access</h2>
          <input
            type="password"
            placeholder="Enter admin key"
            value={adminKey}
            onChange={e => setAdminKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchStats()}
            className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white mb-4 outline-none focus:border-brand-500"
          />
          <button onClick={fetchStats} className="btn-primary w-full">
            Access Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-dark-400 text-sm mt-1">AI for Beginners Course</p>
          </div>
          <div className="flex gap-3">
            <button onClick={fetchStats} className="btn-secondary text-sm">
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Students', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
                { label: 'Active Enrollments', value: stats.totalEnrollments, icon: BookOpen, color: 'text-green-400' },
                { label: 'Revenue (KES)', value: `${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-brand-400' },
                { label: 'Avg. Order', value: stats.totalEnrollments > 0 ? `${Math.round(stats.totalRevenue / stats.totalEnrollments).toLocaleString()}` : '0', icon: TrendingUp, color: 'text-purple-400' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card">
                  <Icon size={20} className={`${color} mb-3`} />
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-dark-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Meetings + Certificates + Mark Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
              <div className="card">
                <h3 className="text-lg font-bold text-white mb-3">Schedule Live Session</h3>
                <input className="w-full mb-2 bg-dark-800 p-2 rounded" placeholder="Title" value={meetingTitle} onChange={e=>setMeetingTitle(e.target.value)} />
                <label className="block text-xs text-dark-400 mb-1">Start Time</label>
                <input type="datetime-local" className="w-full mb-2 bg-dark-800 p-2 rounded" value={meetingStartTime} onChange={e=>setMeetingStartTime(e.target.value)} />
                <label className="block text-xs text-dark-400 mb-1">Duration (minutes)</label>
                <input type="number" min="1" className="w-full mb-2 bg-dark-800 p-2 rounded" value={meetingDuration} onChange={e=>setMeetingDuration(e.target.value)} />
                <div className="w-full mb-2 bg-dark-800 p-2 rounded text-dark-300 text-sm">
                  End Time: {meetingEndTime || 'Auto-calculated after duration is set'}
                </div>
                <input className="w-full mb-2 bg-dark-800 p-2 rounded" placeholder="Meet link" value={meetingLink} onChange={e=>setMeetingLink(e.target.value)} />
                <div className="flex items-center gap-2 mb-3">
                  <input id="notify" type="checkbox" checked={notifyUsers} onChange={e=>setNotifyUsers(e.target.checked)} />
                  <label htmlFor="notify" className="text-sm text-dark-400">Notify enrolled users</label>
                </div>
                <div className="flex gap-2">
                  <button onClick={scheduleMeeting} className="btn-primary">Schedule & Notify</button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-white mb-3">Release Certificate</h3>
                <input className="w-full mb-2 bg-dark-800 p-2 rounded" placeholder="Student email" value={certEmail} onChange={e=>setCertEmail(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={releaseCertificate} className="btn-primary">Release Certificate</button>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-white mb-3">Mark Lesson Complete</h3>
                <label className="block text-xs text-dark-400 mb-1">Student</label>
                <select 
                  className="w-full mb-2 bg-dark-800 p-2 rounded text-white" 
                  value={selectedStudent}
                  onChange={e => {
                    const nextStudent = e.target.value
                    setSelectedStudent(nextStudent)
                    setCompletedLessonIds([])
                    if (nextStudent) {
                      fetchStudentProgress(nextStudent)
                    }
                  }}
                >
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                  ))}
                </select>

                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs text-dark-400">All Modules</label>
                  <button
                    onClick={saveSelectedProgress}
                    disabled={markingProgress || progressLoading || !selectedStudent}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {markingProgress ? 'Saving...' : 'Save Progress'}
                  </button>
                </div>

                <div className="mb-3 max-h-[32rem] overflow-y-auto space-y-4 pr-1">
                  {modules.map(module => (
                    <div key={module.id} className="rounded-xl border border-dark-700 bg-dark-800/60 p-3">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {module.order_index}. {module.title}
                          </div>
                          <div className="text-xs text-dark-400">{module.lessons.length} lessons</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {module.lessons.map(lesson => {
                          const isCompleted = completedLessonIds.includes(lesson.id)
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => toggleLesson(lesson.id)}
                              disabled={!selectedStudent}
                              className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-colors disabled:opacity-50 ${
                                isCompleted
                                  ? 'border-brand-500 bg-brand-500/10 text-white'
                                  : 'border-dark-700 bg-dark-900/60 text-dark-300 hover:border-dark-500'
                              }`}
                            >
                              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                                isCompleted ? 'border-brand-500 bg-brand-500 text-white' : 'border-dark-500 text-transparent'
                              }`}>
                                ✓
                              </span>
                              <span className="flex-1">
                                {lesson.order_index}. {lesson.title}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {!selectedStudent && (
                  <div className="text-xs text-dark-400">Select a student to load and mark completed lessons.</div>
                )}
              </div>
            </div>

            {/* Recent Payments */}
            <div className="card">
              <h2 className="text-lg font-bold text-white mb-4">Recent Payments</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 text-dark-400 font-medium">Student</th>
                      <th className="text-left py-3 text-dark-400 font-medium">Phone</th>
                      <th className="text-left py-3 text-dark-400 font-medium">Amount</th>
                      <th className="text-left py-3 text-dark-400 font-medium">Status</th>
                      <th className="text-left py-3 text-dark-400 font-medium">Receipt</th>
                      <th className="text-left py-3 text-dark-400 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {stats.recentPayments.map(payment => (
                      <tr key={payment.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="py-3">
                          <div className="text-white font-medium">{payment.users?.name || '—'}</div>
                          <div className="text-dark-500 text-xs">{payment.users?.email || '—'}</div>
                        </td>
                        <td className="py-3 text-dark-300 font-mono text-xs">{payment.phone}</td>
                        <td className="py-3 text-white font-medium">KES {payment.amount.toLocaleString()}</td>
                        <td className="py-3">{statusBadge(payment.status)}</td>
                        <td className="py-3 text-dark-300 font-mono text-xs">{payment.mpesa_receipt || '—'}</td>
                        <td className="py-3 text-dark-400 text-xs">
                          {new Date(payment.created_at).toLocaleDateString('en-KE', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {stats.recentPayments.length === 0 && (
                  <div className="text-center py-12 text-dark-400">No payments yet</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
