import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'

function isAdminRequest(req: NextRequest) {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key')
  return key && key === process.env.ADMIN_SECRET_KEY
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, slug, description, price_kes, thumbnail, is_active, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message || 'Failed to load courses' }, { status: 500 })
  }

  return NextResponse.json({ courses: data || [] })
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const title = String(body.title || '').trim()
  const slug = normalizeSlug(String(body.slug || body.title || ''))
  const description = String(body.description || '').trim() || null
  const priceKes = Number(body.price_kes ?? body.priceKes)
  const isActive = body.is_active ?? body.isActive ?? true

  if (!title || !slug || !Number.isFinite(priceKes) || priceKes <= 0) {
    return NextResponse.json(
      { error: 'Title, slug, and a valid price are required' },
      { status: 400 }
    )
  }

  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('courses')
    .upsert(
      {
        title,
        slug,
        description,
        price_kes: Math.round(priceKes),
        is_active: Boolean(isActive),
      },
      { onConflict: 'slug' }
    )
    .select('id, title, slug, description, price_kes, thumbnail, is_active, created_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to save course' }, { status: 500 })
  }

  return NextResponse.json({ course: data })
}

export async function PATCH(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const courseId = String(body.courseId || body.id || '').trim()
  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}
  if (typeof body.title === 'string') updates.title = body.title.trim()
  if (typeof body.slug === 'string') updates.slug = normalizeSlug(body.slug)
  if (typeof body.description === 'string') updates.description = body.description.trim() || null
  if (body.price_kes !== undefined || body.priceKes !== undefined) {
    const priceKes = Number(body.price_kes ?? body.priceKes)
    if (!Number.isFinite(priceKes) || priceKes <= 0) {
      return NextResponse.json({ error: 'Valid price is required' }, { status: 400 })
    }
    updates.price_kes = Math.round(priceKes)
  }
  if (body.is_active !== undefined || body.isActive !== undefined) {
    updates.is_active = Boolean(body.is_active ?? body.isActive)
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
  }

  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select('id, title, slug, description, price_kes, thumbnail, is_active, created_at')
    .single()

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Failed to update course' }, { status: 500 })
  }

  return NextResponse.json({ course: data })
}