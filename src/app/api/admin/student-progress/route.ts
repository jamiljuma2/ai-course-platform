import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  const studentId = req.nextUrl.searchParams.get('studentId')

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!studentId) {
    return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
  }

  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id, completed')
    .eq('user_id', studentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const completedLessonIds = (data || [])
    .filter(row => row.completed)
    .map(row => row.lesson_id)

  return NextResponse.json({ completedLessonIds })
}
