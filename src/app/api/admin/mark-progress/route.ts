import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, lessonId } = await req.json()
  if (!userId || !lessonId) {
    return NextResponse.json({ error: 'Missing userId or lessonId' }, { status: 400 })
  }

  const supabase = await createServerClient()

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
