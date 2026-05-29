'use client'
import { ArrowRight, Star, Users, BookOpen, Award } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { COURSE_OPTIONS } from '@/lib/course-options'

const stats = [
  { icon: Users, value: '500+', label: 'Students Enrolled' },
  { icon: BookOpen, value: `${COURSE_OPTIONS.length}+`, label: 'Courses' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
  { icon: Award, value: '100%', label: 'Practical Skills' },
]

const roles = ['Freelancers', 'Students', 'Entrepreneurs', 'Professionals']

interface ProgressData {
  moduleName: string
  currentModuleNum: number
  completionPercent: number
}

export default function HeroSection() {
  const [roleIdx, setRoleIdx] = useState(0)
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIdx(i => (i + 1) % roles.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user?.id) {
          setLoading(false)
          return
        }

        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', session.user.id)
          .eq('course_access', true)
          .maybeSingle()

        if (!enrollment) {
          setLoading(false)
          return
        }

        // determine user role to avoid exposing module names to students
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle()

        const isStudent = userProfile?.role === 'student'

        const { data: modules } = await supabase
          .from('modules')
          .select('id, title, order_index')
          .eq('course_id', enrollment.course_id)
          .eq('is_active', true)
          .order('order_index')

        if (!modules || modules.length === 0) {
          setLoading(false)
          return
        }

        // For students, compute overall progress percentage without exposing module names
        let totalLessons = 0
        let totalCompleted = 0

        for (const module of modules) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('module_id', module.id)
            .eq('is_active', true)
            .order('order_index')

          if (!lessons || lessons.length === 0) continue

          totalLessons += lessons.length

          const { data: completed } = await supabase
            .from('progress')
            .select('lesson_id')
            .eq('user_id', session.user.id)
            .in('lesson_id', lessons.map(l => l.id))
            .eq('completed', true)

          totalCompleted += (completed?.length || 0)
        }

        const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0

        if (isStudent) {
          setProgress({ moduleName: '', currentModuleNum: 0, completionPercent: overallPercent })
          setLoading(false)
          return
        }

        // For non-students, show the current module details (existing behavior)
        for (const module of modules) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('module_id', module.id)
            .eq('is_active', true)
            .order('order_index')

          if (!lessons || lessons.length === 0) continue

          const { data: completed } = await supabase
            .from('progress')
            .select('lesson_id')
            .eq('user_id', session.user.id)
            .in('lesson_id', lessons.map(l => l.id))
            .eq('completed', true)

          const completedLessonIds = completed?.map(c => c.lesson_id) || []
          const totalCount = lessons.length
          const completedCount = completedLessonIds.length
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

          if (completedCount > 0 || module.order_index === 1) {
            setProgress({
              moduleName: module.title,
              currentModuleNum: module.order_index,
              completionPercent: percent,
            })
            break
          }
        }
      } catch (error) {
        console.error('Error fetching progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-br from-white via-brand-50/70 to-brand-100/50" />
      <div className="absolute inset-0 bg-hero-soft-glow" />

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-400/18 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-white/70 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 pb-96 sm:pb-0">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/85 border border-brand-100 text-brand-700 text-sm font-medium mb-8 animate-fade-in shadow-sm backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            Now enrolling — multiple practical courses · Pay with M-Pesa
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-dark-900 mb-6 animate-fade-up">
            Practical Skills for
            <span className="block gradient-text min-h-[1.2em]">
              {roles[roleIdx]}
            </span>
          </h1>

          <p className="text-xl text-dark-600 leading-relaxed max-w-2xl mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Choose a course in AI or web development, then build practical skills that help you earn more, work smarter, and launch real projects.
          </p>

          <div className="flex flex-wrap gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <a href="#enroll" className="btn-primary glow-brand text-lg">
              Choose a Course
              <ArrowRight size={20} />
            </a>
            <a href="#courses" className="btn-secondary text-lg soft-glow">
              View All Courses
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon size={20} className="text-brand-600" />
                </div>
                <div className="text-2xl font-bold text-dark-900">{value}</div>
                <div className="text-xs text-dark-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute right-4 bottom-16 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 max-w-[320px] w-full sm:w-80 mt-0 mx-auto lg:mx-0">
          <div className="card glow-brand animate-float">
            {progress ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shadow-inner">
                        <span className="text-xl">📚</span>
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-dark-900">{progress.moduleName ? `Module ${progress.currentModuleNum}` : 'Course Progress'}</div>
                        {progress.moduleName ? (
                          <div className="text-xs text-dark-500 truncate">{progress.moduleName}</div>
                        ) : (
                          <div className="text-xs text-dark-500">Track your course completion</div>
                        )}
                      </div>
                    </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border flex items-center justify-center text-xs bg-brand-500 border-brand-500 text-white">
                      ✓
                    </div>
                    <span className="text-dark-900">Module progress unlocked</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-brand-200 bg-brand-50" />
                    <span className="text-dark-500">Practical projects</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-brand-200 bg-brand-50" />
                    <span className="text-dark-500">Lifetime access</span>
                  </div>
                </div>
                <div className="bg-brand-100 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full shadow-[0_0_18px_rgba(47,184,92,0.35)]" style={{ width: `${progress.completionPercent}%` }} />
                </div>
                <div className="text-xs text-dark-500 mt-2">{progress.completionPercent}% complete</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center shadow-inner">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-dark-900">Choose a Course</div>
                    <div className="text-xs text-dark-500">Enroll to track progress</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-brand-200 bg-brand-50" />
                    <span className="text-dark-500">AI track + web development track</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-brand-200 bg-brand-50" />
                    <span className="text-dark-500">Practical assignments</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-brand-200 bg-brand-50" />
                    <span className="text-dark-500">Lifetime access</span>
                  </div>
                </div>
                <div className="bg-brand-100 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full w-0 shadow-[0_0_18px_rgba(47,184,92,0.35)]" />
                </div>
                <div className="text-xs text-dark-500 mt-2">0% complete</div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
