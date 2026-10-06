import Link from 'next/link'
import { ArrowRight, BookOpen, Award, Check } from 'lucide-react'
import type { CourseOption } from '@/lib/course-options'

export default function CoursesSection({ courses }: { courses: CourseOption[] }) {
  return <section id="courses" className="academy-courses geometric-section"><div className="academy-container">
    <div className="courses-heading"><div><p className="section-label">LEARN SOMETHING NEW</p><h2>Featured courses</h2></div><a href="#enroll" className="btn-primary">All courses <ArrowRight size={14} /></a></div>
    <div className={`course-grid ${courses.length === 2 ? 'course-grid-two' : ''}`}>{courses.map((course) => <article key={course.slug} className="academy-course-card">
      <div className="course-image"><img src={course.thumbnail || (course.slug.includes('web') ? '/images/course-web.png' : '/images/course-ai.png')} alt={course.title} loading="lazy" /><span className="course-price">KES {course.priceKes.toLocaleString()}</span></div>
      <div className="course-body"><p className="course-category">{course.badge}</p><h3>{course.title}</h3><p className="course-description">{course.description}</p>
        <div className="course-stars"><Check size={13} /><span>Practical, project-based learning</span></div>
        <div className="course-meta"><span><BookOpen size={13} /> {course.duration}</span><span><Award size={13} /> Certificate</span></div>
        <Link href={`/?course=${course.slug}#enroll`} className="course-enroll">Enroll now <ArrowRight size={14} /></Link>
      </div>
    </article>)}</div>
    {courses.length === 0 && <p className="section-intro">New courses are coming soon. Contact us to learn more.</p>}
  </div></section>
}
