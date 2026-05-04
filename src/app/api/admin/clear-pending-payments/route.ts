import { createAdminServerClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const adminKey = req.headers.get('x-admin-key')
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminServerClient()

  try {
    // Mark all pending payments as cancelled (keep history)
    const now = new Date().toISOString()
    const { data: updatedPayments, error: payError } = await supabase
      .from('payments')
      .update({ status: 'cancelled', failure_reason: 'Cleared by admin', updated_at: now })
      .eq('status', 'pending')
      .select('id')

    if (payError) {
      console.error('Error cancelling payments:', payError)
      return NextResponse.json({ error: payError.message }, { status: 500 })
    }

    // Update related enrollments that are still pending
    const { data: updatedEnrolls, error: enrollError } = await supabase
      .from('enrollments')
      .update({ payment_status: 'failed', course_access: false, payment_id: null })
      .eq('payment_status', 'pending')
      .select('id')

    if (enrollError) {
      console.error('Error updating enrollments:', enrollError)
      return NextResponse.json({ error: enrollError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, paymentsCancelled: updatedPayments?.length || 0, enrollmentsUpdated: updatedEnrolls?.length || 0 })
  } catch (e) {
    console.error('Unexpected error clearing pending payments:', e)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
