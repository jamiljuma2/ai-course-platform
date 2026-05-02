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
      } else {
        alert('Invalid admin key')
      }
    } finally {
      setLoading(false)
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

            {/* Meetings + Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
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
