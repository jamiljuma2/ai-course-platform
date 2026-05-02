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
  const { email, course_id, enrollment_id } = body

  if (!email && !enrollment_id) {
    return NextResponse.json({ error: 'Provide email or enrollment_id' }, { status: 400 })
  }

  const supabase = createAdminServerClient()

  // Resolve enrollment
  let enrollment: any = null
  if (enrollment_id) {
    const { data } = await supabase.from('enrollments').select('*').eq('id', enrollment_id).single()
    enrollment = data
  } else if (email) {
    const { data: users } = await supabase.from('users').select('id').eq('email', email).limit(1)
    const userId = users?.[0]?.id
    if (!userId) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    const { data } = await supabase.from('enrollments').select('*').eq('user_id', userId).limit(1)
    enrollment = data?.[0]
  }

  if (!enrollment) return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 })

  // generate certificate url (placeholder)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const certificateUrl = `${appUrl}/certificates/${enrollment.id}.pdf`

  const { error } = await supabase.from('enrollments').update({ certificate_url: certificateUrl, completed_at: enrollment.completed_at || new Date().toISOString() }).eq('id', enrollment.id)

  if (error) {
    console.error('Failed to update enrollment certificate', error)
    return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 })
  }

  // fetch user
  const { data: user } = await supabase.from('users').select('*').eq('id', enrollment.user_id).limit(1).single()

  try {
    if (user?.email) await sendCertificateEmail(user, certificateUrl)
  } catch (err) {
    console.error('Failed to send certificate email', err)
  }

  return NextResponse.json({ certificateUrl })
}
