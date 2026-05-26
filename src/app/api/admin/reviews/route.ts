import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'

function verifyAdmin(req: NextRequest): boolean {
  const key = req.headers.get('x-admin-key')
  return key === process.env.ADMIN_SECRET_KEY
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, role, rating, comment, avatar_initials, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to load admin reviews', error)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }

  return NextResponse.json({ reviews: data || [] })
}

export async function PATCH(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const reviewId = typeof body.reviewId === 'string' ? body.reviewId.trim() : ''
  const status = typeof body.status === 'string' ? body.status.trim() : ''

  if (!reviewId) {
    return NextResponse.json({ error: 'Missing reviewId' }, { status: 400 })
  }

  if (!['published', 'pending', 'hidden'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('reviews')
    .update({ status })
    .eq('id', reviewId)
    .select('id, name, role, rating, comment, avatar_initials, status, created_at')
    .single()

  if (error) {
    console.error('Failed to update review', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }

  return NextResponse.json({ review: data })
}