// app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Mark a lesson as complete
export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { lessonId, completed, watchTime } = await req.json()

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('progress')
    .upsert({
      user_id: user.id,
      lesson_id: lessonId,
      completed: completed ?? true,
      watch_time: watchTime ?? 0,
      completed_at: completed ? new Date().toISOString() : null,
    }, { onConflict: 'user_id,lesson_id' })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, progress: data })
}

// Get progress for a course
export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const courseId = req.nextUrl.searchParams.get('courseId')
  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 })
  }

  const { data: progress } = await supabase
    .from('progress')
    .select('lesson_id, completed, watch_time, completed_at')
    .eq('user_id', user.id)

  // Get course progress percentage via RPC
  const { data: percentage } = await supabase.rpc('get_course_progress', {
    p_user_id: user.id,
    p_course_id: courseId,
  })

  return NextResponse.json({
    progress: progress || [],
    percentage: percentage || 0,
  })
}
