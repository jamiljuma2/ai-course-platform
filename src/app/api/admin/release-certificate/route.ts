import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'
import { sendCertificateEmail } from '@/lib/email'

function verifyAdmin(req: NextRequest) {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key')
  return key === process.env.ADMIN_SECRET_KEY
}

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { email, course_id, enrollment_id, user_id } = body

  if (!email && !enrollment_id && !user_id) {
    return NextResponse.json({ error: 'Provide email, user_id, or enrollment_id' }, { status: 400 })
  }

  const supabase = createAdminServerClient()

  // Resolve enrollment
  let enrollment: any = null
  if (enrollment_id) {
    const { data } = await supabase.from('enrollments').select('*').eq('id', enrollment_id).single()
    enrollment = data
  } else if (user_id) {
    let query = supabase.from('enrollments').select('*').eq('user_id', user_id)
    if (course_id) {
      query = query.eq('course_id', course_id)
    }
    const { data } = await query.order('created_at', { ascending: false }).limit(1)
    enrollment = data?.[0]
  } else if (email) {
    const { data: users } = await supabase.from('users').select('id').ilike('email', email.trim()).limit(1)
    const userId = users?.[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    let query = supabase.from('enrollments').select('*').eq('user_id', userId)
    if (course_id) {
      query = query.eq('course_id', course_id)
    }
    const { data } = await query.order('created_at', { ascending: false }).limit(1)
    enrollment = data?.[0]
  }

  if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).replace(/\/$/, '')
  const certificateUrl = `${appUrl}/dashboard/certificate`

  const issuedAt = enrollment.completed_at || new Date().toISOString()

  const { error } = await supabase
    .from('enrollments')
    .update({ certificate_url: certificateUrl, completed_at: issuedAt })
    .eq('id', enrollment.id)

  if (error) {
    console.error('Failed to update enrollment certificate', error)
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }

  await supabase
    .from('capstone_projects')
    .update({ certificate_issued: true, reviewed_at: issuedAt })
    .eq('user_id', enrollment.user_id)
    .eq('course_id', enrollment.course_id)

  // fetch user
  const { data: user } = await supabase.from('users').select('*').eq('id', enrollment.user_id).limit(1).single()

  try {
    if (user?.email) await sendCertificateEmail(user, certificateUrl)
  } catch (err) {
    console.error('Failed to send certificate email', err)
  }

  return NextResponse.json({ certificateUrl })
}
