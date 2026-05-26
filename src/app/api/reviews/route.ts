import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'

function buildInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('')
    .slice(0, 2) || 'U'
}

export async function GET() {
  const supabase = createAdminServerClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('id, name, role, rating, comment, avatar_initials, status, created_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(12)

  if (error) {
    console.error('Failed to load reviews', error)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }

  return NextResponse.json({ reviews: data || [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const role = typeof body.role === 'string' ? body.role.trim() : ''
  const comment = typeof body.comment === 'string' ? body.comment.trim() : ''
  const rating = Number(body.rating)

  if (name.length < 2) {
    return NextResponse.json({ error: 'Please enter your name' }, { status: 400 })
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Please choose a rating from 1 to 5' }, { status: 400 })
  }

  if (comment.length < 20) {
    return NextResponse.json({ error: 'Please write at least 20 characters' }, { status: 400 })
  }

  const supabase = createAdminServerClient()
  const review = {
    name,
    role: role || null,
    rating,
    comment,
    avatar_initials: buildInitials(name),
    status: 'pending' as const,
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select('id, name, role, rating, comment, avatar_initials, status, created_at')
    .single()

  if (error) {
    console.error('Failed to save review', error)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }

  return NextResponse.json({ review: data, message: 'Review submitted for moderation' })
}