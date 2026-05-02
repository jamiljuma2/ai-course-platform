// app/api/admin/stats/route.ts
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

  const [
    { count: totalUsers },
    { count: totalEnrollments },
    { data: payments },
    { data: recentPayments },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('course_access', true),
    supabase.from('payments').select('amount').eq('status', 'completed'),
    supabase
      .from('payments')
      .select('*, users(name, email)')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalEnrollments: totalEnrollments || 0,
    totalRevenue,
    recentPayments: recentPayments || [],
  })
}
