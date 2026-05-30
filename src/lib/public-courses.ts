import { createAdminServerClient } from '@/lib/supabase/admin'
import type { Course } from '@/types'
import { COURSE_OPTIONS, type CourseOption } from '@/lib/course-options'

const FALLBACK_BY_SLUG = new Map(COURSE_OPTIONS.map(course => [course.slug, course]))

function toCourseOption(course: Pick<Course, 'slug' | 'title' | 'description' | 'price_kes'>): CourseOption {
  const fallback = FALLBACK_BY_SLUG.get(course.slug)

  return {
    slug: course.slug,
    title: course.title,
    description: course.description || fallback?.description || '',
    priceKes: course.price_kes,
    duration: fallback?.duration || 'Practical track',
    badge: fallback?.badge || 'Course',
    highlights: fallback?.highlights || [],
  }
}

export async function getPublicCourseOptions(): Promise<CourseOption[]> {
  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('courses')
    .select('slug, title, description, price_kes')
    .eq('is_active', true)
    .order('created_at', { ascending: true })

  if (error || !data || data.length === 0) {
    return COURSE_OPTIONS
  }

  return data.map(toCourseOption)
}

export function getPublicCourseOption(courses: CourseOption[], slug?: string | null) {
  return courses.find(course => course.slug === slug) || courses[0] || COURSE_OPTIONS[0]
}