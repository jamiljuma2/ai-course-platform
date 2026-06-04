import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'

function isAdminRequest(req: NextRequest) {
  const key = req.headers.get('x-admin-key') || req.nextUrl.searchParams.get('key')
  return key && key === process.env.ADMIN_SECRET_KEY
}

function sanitizeSegment(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'course'
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  const courseSlug = String(formData.get('courseSlug') || 'course')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }

  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 })
  }

  const maxSizeBytes = 5 * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return NextResponse.json({ error: 'Image must be 5 MB or smaller' }, { status: 400 })
  }

  const supabase = createAdminServerClient()
  const bucket = 'course-thumbnails'
  const safeCourseSlug = sanitizeSegment(courseSlug)
  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() || 'jpg' : 'jpg'
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`
  const path = `${safeCourseSlug}/${filename}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message || 'Failed to upload image' }, { status: 500 })
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return NextResponse.json({
    thumbnailUrl: data.publicUrl,
    path,
  })
}