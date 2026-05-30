import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import type { CourseOption } from '@/lib/course-options'

interface CoursesSectionProps {
  courses: CourseOption[]
}

export default function CoursesSection({ courses }: CoursesSectionProps) {
  return (
    <section id="courses" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Choose Your Course</p>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4">
            Pick a practical path and start learning
          </h2>
          <p className="text-dark-600 text-lg max-w-2xl mx-auto">
            Students can choose the course that fits their goals, then pay once and get lifetime access.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {courses.map(course => (
            <div
              key={course.slug}
              className="card border-brand-100 bg-gradient-to-br from-white to-brand-50/50 hover:border-brand-300 transition-all duration-300 hover:shadow-xl"
            >
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4 border border-brand-100">
                    {course.badge}
                  </div>
                  <h3 className="text-2xl font-bold text-dark-900 mb-2">{course.title}</h3>
                  <p className="text-dark-600 leading-relaxed">{course.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs uppercase tracking-wider text-dark-500 mb-1">From</div>
                  <div className="text-2xl font-bold text-brand-700">KES {course.priceKes.toLocaleString()}</div>
                  <div className="text-xs text-dark-500 mt-1">{course.duration}</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {course.highlights.map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-brand-600" />
                    </div>
                    <span className="text-dark-600 text-sm leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/?course=${course.slug}#enroll`}
                className="btn-primary w-full inline-flex justify-center text-sm"
              >
                Choose {course.title}
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}