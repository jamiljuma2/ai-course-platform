'use client'
import { useState } from 'react'
import {
  BookOpen, CheckCircle2, Circle, Lock, Play, FileText,
  Award, Clock, TrendingUp, LogOut, Menu, X, ChevronRight,
  ClipboardList, Zap
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import type { User, Module, Lesson } from '@/types'

interface Props {
  profile: User
  enrollment: { course_id: string; enrolled_at: string; courses: { title: string } }
  modules: (Module & { lessons: Lesson[] })[]
  progressMap: Record<string, { completed: boolean; completed_at?: string }>
  progressPct: number
  totalLessons: number
  completedLessons: number
  certificateStatus: 'locked' | 'ready' | 'issued'
}

export default function DashboardClient({
  profile, enrollment, modules, progressMap, progressPct, totalLessons, completedLessons, certificateStatus
}: Props) {
  const router = useRouter()
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeModule, setActiveModule] = useState<Module | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [markingComplete, setMarkingComplete] = useState<string | null>(null)
  const [localProgress, setLocalProgress] = useState(progressMap)

  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const markComplete = async (lessonId: string) => {
    if (localProgress[lessonId]?.completed) return
    setMarkingComplete(lessonId)

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: true }),
      })

      if (res.ok) {
        setLocalProgress(prev => ({
          ...prev,
          [lessonId]: { completed: true, completed_at: new Date().toISOString() }
        }))
        toast.success('Lesson marked as complete! 🎉')
      }
    } catch {
      toast.error('Failed to save progress')
    } finally {
      setMarkingComplete(null)
    }
  }

  const getLessonIcon = (lesson: Lesson) => {
    const isComplete = localProgress[lesson.id]?.completed
    if (isComplete) return <CheckCircle2 size={16} className="text-brand-600" />
    if (lesson.lesson_type === 'assignment') return <ClipboardList size={16} className="text-brand-600" />
    if (lesson.lesson_type === 'video') return <Play size={16} className="text-dark-500" />
    return <FileText size={16} className="text-dark-500" />
  }

  const completedCount = Object.values(localProgress).filter(p => p.completed).length
  const currentPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  const certificateReady = certificateStatus === 'ready' || certificateStatus === 'issued'

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-brand-50/60 to-white flex flex-col text-dark-900">
      {/* Top Nav */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-brand-100 h-14 flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-40 shadow-sm">
        <button
          className="lg:hidden text-dark-600 hover:text-brand-700"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link href="/" className="flex items-center gap-2 mr-auto">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-brand-500/20">AI</div>
          <span className="hidden sm:block font-semibold text-dark-900 text-sm">AI for Beginners</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-sm text-dark-500">
          <TrendingUp size={14} className="text-brand-600" />
          <span>{currentPct}% complete</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <button onClick={handleSignOut} className="text-dark-500 hover:text-brand-700 transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white border-r border-brand-100
          flex flex-col transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Progress summary */}
          <div className="p-5 border-b border-brand-100 bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-dark-600">Overall Progress</span>
              <span className="text-sm font-bold text-brand-700">{currentPct}%</span>
            </div>
            <div className="h-2 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full transition-all duration-500 shadow-[0_0_18px_rgba(47,184,92,0.35)]"
                style={{ width: `${currentPct}%` }}
              />
            </div>
            <div className="text-xs text-dark-500 mt-2">{completedCount} of {totalLessons} lessons done</div>
          </div>

          {/* Module list */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-3">
            {modules.map(mod => {
              const modLessons = mod.lessons?.filter(l => l.is_active).sort((a, b) => a.order_index - b.order_index) || []
              const modCompleted = modLessons.filter(l => localProgress[l.id]?.completed).length
              const isActive = activeModule?.id === mod.id

              return (
                <div key={mod.id}>
                  <button
                    onClick={() => {
                      setActiveModule(isActive ? null : mod)
                      if (!isActive && modLessons.length > 0) {
                        setActiveLesson(modLessons[0])
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isActive ? 'bg-brand-50 text-dark-900 border border-brand-100' : 'text-dark-500 hover:text-brand-700 hover:bg-brand-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded bg-brand-50 border border-brand-100 flex items-center justify-center text-xs font-bold text-brand-700 shrink-0">
                      {mod.order_index}
                    </div>
                    <span className="text-xs flex-1 leading-tight">{mod.title}</span>
                    <span className="text-xs text-dark-500 shrink-0">{modCompleted}/{modLessons.length}</span>
                  </button>

                  {isActive && (
                    <div className="ml-4 mt-1 space-y-0.5">
                      {modLessons.map(lesson => (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLesson(lesson); setSidebarOpen(false) }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                            activeLesson?.id === lesson.id
                              ? 'bg-brand-100 text-dark-900 border border-brand-100'
                              : 'text-dark-500 hover:text-brand-700 hover:bg-brand-50'
                          }`}
                        >
                          {getLessonIcon(lesson)}
                          <span className="text-xs flex-1 leading-tight">{lesson.title}</span>
                          {lesson.duration_min > 0 && (
                            <span className="text-xs text-dark-500 shrink-0">{lesson.duration_min}m</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Capstone */}
          <div className="p-4 border-t border-brand-100">
            <Link
              href="/dashboard/capstone"
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors text-sm font-medium border border-brand-100"
            >
              <Award size={16} />
              Capstone Project
              <ChevronRight size={14} className="ml-auto" />
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {!activeLesson ? (
            /* Dashboard home */
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-dark-900 mb-1">
                  Welcome back, {profile?.name?.split(' ')[0]}! 👋
                </h1>
                <p className="text-dark-600">Continue your AI learning journey.</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Progress', value: `${currentPct}%`, icon: TrendingUp },
                  { label: 'Lessons Done', value: `${completedCount}/${totalLessons}`, icon: CheckCircle2 },
                  { label: 'Modules', value: `${modules.length}`, icon: BookOpen },
                  { label: 'Certificate', value: certificateReady ? 'Generate' : `${currentPct}%`, icon: Award, href: certificateReady ? '/dashboard/certificate' : '/dashboard/capstone' },
                ].map(({ label, value, icon: Icon, href }) => (
                  <Link key={label} href={href || '#'} className="card text-center py-4 hover:border-brand-200 transition-all hover:-translate-y-0.5">
                    <Icon size={20} className="text-brand-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-dark-900">{value}</div>
                    <div className="text-xs text-dark-500 mt-0.5">{label}</div>
                  </Link>
                ))}
              </div>

              {/* Continue button */}
              {modules[0]?.lessons?.length > 0 && (
                <button
                  onClick={() => {
                    const firstMod = modules[0]
                    const firstLesson = firstMod.lessons.sort((a, b) => a.order_index - b.order_index)[0]
                    setActiveModule(firstMod)
                    setActiveLesson(firstLesson)
                  }}
                  className="btn-primary mb-8"
                >
                  <Play size={18} /> Continue Learning
                </button>
              )}

              {/* Module cards */}
              <h2 className="text-lg font-bold text-dark-900 mb-4">All Modules</h2>
              <div className="space-y-3">
                {modules.map(mod => {
                  const modLessons = mod.lessons?.filter(l => l.is_active) || []
                  const modDone = modLessons.filter(l => localProgress[l.id]?.completed).length
                  const pct = modLessons.length > 0 ? Math.round((modDone / modLessons.length) * 100) : 0

                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        const sorted = modLessons.sort((a, b) => a.order_index - b.order_index)
                        setActiveModule(mod)
                        setActiveLesson(sorted[0] || null)
                      }}
                        className="w-full card hover:border-brand-200 transition-all text-left flex items-center gap-4 hover:-translate-y-0.5"
                    >
                        <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm shrink-0">
                        {mod.order_index < 10 ? `0${mod.order_index}` : mod.order_index}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="text-dark-900 font-medium text-sm">{mod.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-500 rounded-full shadow-[0_0_14px_rgba(47,184,92,0.35)]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                            <span className="text-xs text-dark-500 shrink-0">{modDone}/{modLessons.length}</span>
                        </div>
                      </div>
                        {pct === 100 && <CheckCircle2 size={18} className="text-brand-600 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Lesson viewer */
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-dark-500 mb-6">
                <button onClick={() => setActiveLesson(null)} className="hover:text-brand-700 transition-colors">
                  Dashboard
                </button>
                <ChevronRight size={14} />
                <span className="text-dark-500">{activeModule?.title}</span>
                <ChevronRight size={14} />
                <span className="text-dark-900">{activeLesson.title}</span>
              </div>

              {/* Lesson header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-brand-50 rounded text-xs text-brand-700 font-medium uppercase border border-brand-100">
                      {activeLesson.lesson_type}
                    </span>
                    {activeLesson.duration_min > 0 && (
                      <span className="text-xs text-dark-500">
                        <Clock size={12} className="inline mr-1" />
                        {activeLesson.duration_min} min
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-dark-900">{activeLesson.title}</h2>
                </div>

                {!localProgress[activeLesson.id]?.completed && activeLesson.lesson_type !== 'assignment' && (
                  <button
                    onClick={() => markComplete(activeLesson.id)}
                    disabled={markingComplete === activeLesson.id}
                    className="btn-secondary text-sm shrink-0"
                  >
                    {markingComplete === activeLesson.id ? (
                      <span className="animate-pulse">Saving...</span>
                    ) : (
                      <><CheckCircle2 size={16} /> Mark Complete</>
                    )}
                  </button>
                )}

                {localProgress[activeLesson.id]?.completed && (
                  <div className="flex items-center gap-2 text-brand-600 text-sm font-medium">
                    <CheckCircle2 size={18} />
                    Completed
                  </div>
                )}
              </div>

              {/* Video placeholder */}
              {activeLesson.lesson_type === 'video' && (
                <div className="bg-white rounded-2xl aspect-video flex items-center justify-center mb-8 border border-brand-100 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                  {activeLesson.video_url ? (
                    <iframe
                      src={activeLesson.video_url}
                      className="w-full h-full rounded-2xl"
                      allowFullScreen
                    />
                  ) : (
                    <div className="text-center">
                      <Play size={48} className="text-brand-600 mx-auto mb-3" />
                      <p className="text-dark-600 text-sm">Video content coming soon</p>
                    </div>
                  )}
                </div>
              )}

              {/* Assignment */}
              {activeLesson.lesson_type === 'assignment' && (
                <div className="card border-brand-100 bg-gradient-to-br from-brand-50 to-white mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <ClipboardList size={20} className="text-brand-600" />
                    <span className="font-semibold text-dark-900">Practical Assignment</span>
                  </div>
                  <div className="prose prose-sm max-w-none mb-6">
                    <p className="text-dark-600">{activeLesson.content}</p>
                  </div>
                  <Link
                    href={`/dashboard/assignment/${activeLesson.id}`}
                    className="btn-primary"
                  >
                    Submit Assignment <ChevronRight size={16} />
                  </Link>
                </div>
              )}

              {/* Lesson content */}
              {activeLesson.content && activeLesson.lesson_type !== 'assignment' && (
                <div className="prose max-w-none">
                  <div className="text-dark-600 leading-relaxed whitespace-pre-wrap">
                    {activeLesson.content}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-12 pt-8 border-t border-brand-100">
                <button className="btn-secondary text-sm">← Previous</button>
                <button
                  onClick={() => {
                    if (activeLesson.lesson_type !== 'assignment') {
                      markComplete(activeLesson.id)
                    }
                  }}
                  className="btn-primary text-sm"
                >
                  Next Lesson →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
