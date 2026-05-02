// app/api/admin/export/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('key')
  if (key !== process.env.ADMIN_SECRET_KEY) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const supabase = createAdminServerClient()

  const { data: users } = await supabase
    .from('users')
    .select(`
      name, email, phone, created_at,
      enrollments(payment_status, course_access, enrolled_at, completed_at),
      payments(amount, status, mpesa_receipt, created_at)
    `)
    .order('created_at', { ascending: false })

  const rows = [
    ['Name', 'Email', 'Phone', 'Registered', 'Enrolled At', 'Course Access', 'Completed', 'Amount Paid', 'M-Pesa Receipt', 'Payment Status'],
    ...(users || []).map(u => {
      const en = u.enrollments?.[0]
      const pay = u.payments?.[0]
      return [
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.phone || ''}"`,
        `"${new Date(u.created_at).toLocaleDateString('en-KE')}"`,
        `"${en?.enrolled_at ? new Date(en.enrolled_at).toLocaleDateString('en-KE') : ''}"`,
        `"${en?.course_access ? 'Yes' : 'No'}"`,
        `"${en?.completed_at ? new Date(en.completed_at).toLocaleDateString('en-KE') : ''}"`,
        `"${pay?.amount || ''}"`,
        `"${pay?.mpesa_receipt || ''}"`,
        `"${pay?.status || ''}"`,
      ]
    }),
  ]

  const csv = rows.map(r => r.join(',')).join('\n')
  const filename = `ai-course-students-${new Date().toISOString().split('T')[0]}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
