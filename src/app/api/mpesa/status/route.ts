// app/api/mpesa/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/server'

// Poll payment status from our database
export async function GET(req: NextRequest) {
  const checkoutRequestId = req.nextUrl.searchParams.get('checkoutRequestId')
  const paymentId = req.nextUrl.searchParams.get('paymentId')

  if (!checkoutRequestId && !paymentId) {
    return NextResponse.json({ error: 'Missing checkoutRequestId or paymentId' }, { status: 400 })
  }

  const supabase = createAdminServerClient()

  const query = supabase
    .from('payments')
    .select('id, status, transaction_id, mpesa_receipt, failure_reason, amount, updated_at')

  if (checkoutRequestId) {
    query.eq('checkout_request_id', checkoutRequestId)
  } else {
    query.eq('id', paymentId)
  }

  const { data: payment, error } = await query.single()

  if (error || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
  }

  return NextResponse.json({
    status: payment.status,
    transactionId: payment.transaction_id,
    receipt: payment.mpesa_receipt,
    amount: payment.amount,
    failureReason: payment.failure_reason,
    updatedAt: payment.updated_at,
  })
}
