import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServerClient()

  // Get all enrolled users with the course
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select('id, user_id, users:user_id(id, name, email), course_id')
    .eq('course_access', true)

  if (enrollError) {
    return NextResponse.json({ error: enrollError.message }, { status: 500 })
  }

  if (!enrollments || enrollments.length === 0) {
    return NextResponse.json({ students: [], modules: [] })
  }

  // Get the course_id from first enrollment
  const courseId = enrollments[0].course_id

  // Get all modules for the course
  const { data: modules, error: modError } = await supabase
    .from('modules')
    .select('id, title, order_index')
    .eq('course_id', courseId)
    .eq('is_active', true)
    .order('order_index')

  if (modError) {
    return NextResponse.json({ error: modError.message }, { status: 500 })
  }

  // Get all lessons for each module
  let modulesWithLessons = modules || []
  if (modulesWithLessons.length > 0) {
    const moduleIds = modulesWithLessons.map(m => m.id)
    const { data: allLessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('id, title, order_index, module_id')
      .in('module_id', moduleIds)
      .eq('is_active', true)
      .order('order_index')

    if (!lessonsError) {
      // Group lessons by module_id
      const lessonsByModule: Record<string, any[]> = {}
      allLessons?.forEach(lesson => {
        if (!lessonsByModule[lesson.module_id]) {
          lessonsByModule[lesson.module_id] = []
        }
        lessonsByModule[lesson.module_id].push({
          id: lesson.id,
          title: lesson.title,
          order_index: lesson.order_index
        })
      })

      // Add lessons to each module
      modulesWithLessons = modulesWithLessons.map(m => ({
        ...m,
        lessons: lessonsByModule[m.id] || []
      }))
    }
  }

  // Map to simple structure
  const students = enrollments.map(e => ({
    id: e.user_id,
    name: (() => {
      const user = Array.isArray(e.users) ? e.users[0] : e.users
      return (user as { name?: string } | null | undefined)?.name || 'Unknown'
    })(),
    email: (() => {
      const user = Array.isArray(e.users) ? e.users[0] : e.users
      return (user as { email?: string } | null | undefined)?.email || ''
    })(),
  }))

  return NextResponse.json({ students, modules })
}
