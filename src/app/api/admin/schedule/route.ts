import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'
import { sendMeetingNotification } from '@/lib/email'

function verifyAdmin(req: NextRequest) {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key')
  return key === process.env.ADMIN_SECRET_KEY
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { title, description, start_time, duration_minutes, meet_link, notify, courseId, course_slug } = body

  if (!title || !start_time || !duration_minutes) {
    return NextResponse.json({ error: 'Missing title, start_time, or duration_minutes' }, { status: 400 })
  }

  const parsedStartTime = new Date(start_time)
  const parsedDurationMinutes = Number(duration_minutes)

  if (Number.isNaN(parsedStartTime.getTime()) || !Number.isFinite(parsedDurationMinutes) || parsedDurationMinutes <= 0) {
    return NextResponse.json({ error: 'Invalid start_time or duration_minutes' }, { status: 400 })
  }

  const endTime = new Date(parsedStartTime.getTime() + parsedDurationMinutes * 60 * 1000)

  const supabase = createAdminServerClient()

  const { data, error } = await supabase
    .from('meetings')
    .insert({
      title,
      description: description || null,
      scheduled_at: parsedStartTime.toISOString(),
      start_time: parsedStartTime.toISOString(),
      duration_minutes: parsedDurationMinutes,
      end_time: endTime.toISOString(),
      meet_link: meet_link || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create meeting', error)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }

  let notifySummary = null
  if (notify) {
    notifySummary = { notifiedCount: 0, notified: [], failed: [] as Array<{ id?: string; email?: string; error: string }> }
    try {
      // resolve course id if slug provided
      let targetCourseId = courseId || null
      if (!targetCourseId && course_slug) {
        const { data: course } = await supabase.from('courses').select('id').eq('slug', course_slug).maybeSingle()
        targetCourseId = course?.id || null
      }

      // fetch enrollments filtered by course if provided
      let enrollmentsQuery = supabase.from('enrollments').select('user_id').eq('course_access', true)
      if (targetCourseId) enrollmentsQuery = enrollmentsQuery.eq('course_id', targetCourseId)

      const { data: enrollments } = await enrollmentsQuery

      if (enrollments && enrollments.length) {
        const userIds = enrollments.map((e: any) => e.user_id)
        const { data: users } = await supabase
          .from('users')
          .select('id, name, email, role, created_at, phone, avatar_url')
          .in('id', userIds)

        if (users && users.length) {
          for (const user of users) {
            if (!user?.email) {
              notifySummary.failed.push({ id: user?.id, error: 'no email' })
              continue
            }
            try {
              await sendMeetingNotification(user, data)
              notifySummary.notified.push(user.id)
            } catch (err: any) {
              console.error('Failed sending meeting to', user.email, err)
              notifySummary.failed.push({ id: user.id, email: user.email, error: String(err?.message || err) })
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Failed to notify users about meeting', err)
      notifySummary.failed.push({ error: String(err?.message || err) } as any)
    }

    notifySummary.notifiedCount = notifySummary.notified.length
  }

  return NextResponse.json({ meeting: data, notify: notifySummary })
}
