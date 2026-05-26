import { createAdminServerClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { userId, lessonId, lessonIds, completedLessonIds, batch } = body

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  const supabase = createAdminServerClient()

  if (batch) {
    if (!Array.isArray(lessonIds) || !Array.isArray(completedLessonIds)) {
      return NextResponse.json({ error: 'Missing lessonIds or completedLessonIds' }, { status: 400 })
    }

    const completedSet = new Set(completedLessonIds)
    const payload = lessonIds.map((currentLessonId: string) => ({
      user_id: userId,
      lesson_id: currentLessonId,
      completed: completedSet.has(currentLessonId),
      completed_at: completedSet.has(currentLessonId) ? new Date().toISOString() : null,
    }))

    const { error } = await supabase
      .from('progress')
      .upsert(payload, { onConflict: 'user_id,lesson_id' })

    if (error) {
      console.error('Error saving batch progress:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count: payload.length })
  }

  if (!lessonId) {
    return NextResponse.json({ error: 'Missing lessonId' }, { status: 400 })
  }

  // Insert or update progress record
  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error marking progress:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
