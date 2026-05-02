import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = String(body?.name || '').trim()
    const email = String(body?.email || '').trim()
    const password = String(body?.password || '')

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password' },
        { status: 400 }
      )
    }

    const supabase = createAdminServerClient()
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'student' },
    })

    if (error) {
      const message = error.message.toLowerCase()
      const status = message.includes('already') || message.includes('duplicate') ? 409 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    return NextResponse.json({
      success: true,
      userId: data.user?.id,
      emailConfirmed: true,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}