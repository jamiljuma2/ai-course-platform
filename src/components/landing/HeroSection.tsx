'use client'
import { ArrowRight, Star, Users, BookOpen, Award } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const stats = [
  { icon: Users, value: '500+', label: 'Students Enrolled' },
  { icon: BookOpen, value: '8', label: 'Modules' },
  { icon: Star, value: '4.9', label: 'Average Rating' },
  { icon: Award, value: '100%', label: 'Practical Skills' },
]

const roles = ['Freelancers', 'Students', 'Entrepreneurs', 'Professionals']

interface ProgressData {
  moduleName: string
  currentModuleNum: number
  completedLessons: string[]
  totalLessons: number
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

        // Get user's enrollment
        const { data: enrollment } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', session.user.id)
          .eq('course_access', true)
          .single()

        if (!enrollment) {
          setLoading(false)
          return
        }

        // Get first incomplete module
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

        // Find first module with incomplete lessons
        for (const module of modules) {
          const { data: lessons } = await supabase
            .from('lessons')
            .select('id, title')
            .eq('module_id', module.id)
            .eq('is_active', true)
            .order('order_index')

          if (!lessons || lessons.length === 0) continue

          // Get completed lessons for this module
          const { data: completed } = await supabase
            .from('progress')
            .select('lesson_id')
            .eq('user_id', session.user.id)
            .in('lesson_id', lessons.map(l => l.id))
            .eq('completed', true)

          const completedLessonIds = completed?.map(c => c.lesson_id) || []
          const completedLessonNames = lessons
            .filter(l => completedLessonIds.includes(l.id))
            .map(l => l.title)

          const totalCount = lessons.length
          const completedCount = completedLessonIds.length
          const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

          // If this module has any progress or is the first one, show it
          if (completedCount > 0 || module.order_index === 1) {
            setProgress({
              moduleName: module.title,
              currentModuleNum: module.order_index,
              completedLessons: completedLessonNames,
              totalLessons: totalCount,
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
      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-900/95 to-dark-800" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-300/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 pb-96 sm:pb-0">
        <div className="max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-slow" />
            Now enrolling — KES 3,000 · Pay with M-Pesa
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 animate-fade-up">
            AI Skills for
            <span className="block gradient-text min-h-[1.2em]">
              {roles[roleIdx]}
            </span>
          </h1>

          <p className="text-xl text-dark-300 leading-relaxed max-w-2xl mb-10 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Master ChatGPT, AI automation, and practical tools to earn more, work smarter, and build a profitable digital career — starting this week.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-16 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <a href="#enroll" className="btn-primary glow-brand text-lg">
              Enroll for KES 3,000
              <ArrowRight size={20} />
            </a>
            <a href="#modules" className="btn-secondary text-lg">
              View All Modules
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="flex justify-center mb-2">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-dark-300 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating card: static & centered on mobile, floating on desktop */}
        <div className="absolute right-4 bottom-16 sm:top-1/2 sm:bottom-auto sm:-translate-y-1/2 max-w-[320px] w-full sm:w-80 mt-0 mx-auto lg:mx-0">
          <div className="card glow-brand animate-float">
            {progress ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <span className="text-xl">📚</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Module {progress.currentModuleNum}</div>
                    <div className="text-xs text-dark-400 truncate">{progress.moduleName}</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  {progress.completedLessons.slice(0, 3).map((lesson, i) => (
                    <div key={lesson} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full border flex items-center justify-center text-xs bg-brand-500 border-brand-500 text-white">
                        ✓
                      </div>
                      <span className="text-white truncate">{lesson}</span>
                    </div>
                  ))}
                  {progress.totalLessons > progress.completedLessons.length && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full border border-dark-500" />
                      <span className="text-dark-400">{progress.totalLessons - progress.completedLessons.length} more lessons</span>
                    </div>
                  )}
                </div>
                <div className="bg-dark-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full" style={{ width: `${progress.completionPercent}%` }} />
                </div>
                <div className="text-xs text-dark-400 mt-2">{progress.completionPercent}% complete</div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Start Learning</div>
                    <div className="text-xs text-dark-400">Enroll to track progress</div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-dark-500" />
                    <span className="text-dark-400">8 Modules</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-dark-500" />
                    <span className="text-dark-400">40+ Lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border border-dark-500" />
                    <span className="text-dark-400">Lifetime access</span>
                  </div>
                </div>
                <div className="bg-dark-700 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full w-0" />
                </div>
                <div className="text-xs text-dark-400 mt-2">0% complete</div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
