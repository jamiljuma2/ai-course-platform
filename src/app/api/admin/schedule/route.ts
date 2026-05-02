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
  const { title, description, scheduled_at, meet_link, notify } = body

  if (!title || !scheduled_at) {
    return NextResponse.json({ error: 'Missing title or scheduled_at' }, { status: 400 })
  }

  const supabase = createAdminServerClient()

  const { data, error } = await supabase
    .from('meetings')
    .insert({ title, description: description || null, scheduled_at, meet_link: meet_link || null })
    .select()
    .single()

  if (error) {
    console.error('Failed to create meeting', error)
    return NextResponse.json({ error: 'Failed to create meeting' }, { status: 500 })
  }

  if (notify) {
    try {
      // fetch enrolled users with course access
      const { data: users } = await supabase
        .from('enrollments')
        .select('users(id, name, email)')
        .eq('course_access', true)

      if (users && users.length) {
        for (const u of users) {
          const user = u.users
          if (user?.email) {
            await sendMeetingNotification(user, data)
          }
        }
      }
    } catch (err) {
      console.error('Failed to notify users about meeting', err)
    }
  }

  return NextResponse.json({ meeting: data })
}
