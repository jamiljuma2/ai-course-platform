import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = String(body?.email || '').trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const supabase = createAdminServerClient()
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const exists = data.users.some((user) => user.email?.toLowerCase() === email)
    return NextResponse.json({ exists })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unable to check account'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}