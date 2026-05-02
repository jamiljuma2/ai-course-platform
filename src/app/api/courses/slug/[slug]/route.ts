// app/api/courses/slug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createAdminServerClient()
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, slug, price_kes, description')
    .eq('slug', params.slug)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
