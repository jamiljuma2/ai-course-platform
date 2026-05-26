import { createAdminServerClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminServerClient()

  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', 'ai-for-beginners')
    .single()

  if (courseError || !course) {
    return NextResponse.json({ error: courseError?.message || 'Course not found' }, { status: 500 })
  }

  const courseId = course.id

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, role')
    .order('name', { ascending: true })

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 })
  }

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
  const students = (users || [])
    .filter(user => user.role !== 'admin')
    .map(user => ({
      id: user.id,
      name: user.name || 'Unknown',
      email: user.email || '',
    }))

  return NextResponse.json({ students, modules })
}
