// app/api/webhook/mpesa/route.ts
// ============================================================
// M-PESA CALLBACK HANDLER
// This is called by Safaricom after STK Push completes/fails
// Must be publicly accessible (no auth required from Safaricom)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminServerClient } from '@/lib/supabase/admin'
import { parseCallbackMetadata, verifyLipanaSignature } from '@/lib/mpesa'
import { sendEnrollmentEmail, sendPaymentFailedEmail, sendAdminNotification } from '@/lib/email'
import type { MpesaCallbackBody } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    // Read raw body for signature verification (required by Lipana)
    const raw = await req.text()
    const lipanaSignature = req.headers.get('x-lipana-signature') || req.headers.get('X-Lipana-Signature')

    // Handle Lipana webhooks if signature header present
    if (lipanaSignature) {
      if (!verifyLipanaSignature(raw, lipanaSignature)) {
        console.error('[LIPANA WEBHOOK] Signature verification failed')
        return new NextResponse('Unauthorized', { status: 401 })
      }

      const parsed = JSON.parse(raw)
      console.log('[LIPANA WEBHOOK]', JSON.stringify(parsed, null, 2))

      const event = parsed.event
      const eventData = parsed.data || {}

      const supabase = createAdminServerClient()

      // Try to locate payment by checkout_request_id (Lipana uses checkoutRequestID)
      const checkoutId = eventData.checkoutRequestID || eventData.checkout_request_id || eventData.checkoutRequestId || null

      if (!checkoutId) {
        console.error('[LIPANA WEBHOOK] Missing checkoutRequestID in payload')
        return NextResponse.json({ received: true })
      }

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('id, user_id, course_id, amount, metadata')
        .eq('checkout_request_id', checkoutId)
        .single()

      if (paymentError || !payment) {
        console.error('[LIPANA WEBHOOK] Payment not found:', checkoutId)
        return NextResponse.json({ received: true })
      }

      if (event === 'payment.success' || event === 'transaction.success') {
        const transactionId = eventData.transactionId || eventData.transaction_id || null
        const amount = eventData.amount || null
        const phone = eventData.phone || null

        await supabase
          .from('payments')
          .update({
            status: 'completed',
            transaction_id: transactionId,
            mpesa_receipt: transactionId,
            metadata: { ...payment.metadata, rawWebhook: parsed },
          })
          .eq('id', payment.id)

        await supabase
          .from('enrollments')
          .update({
            payment_status: 'completed',
            course_access: true,
            enrolled_at: new Date().toISOString(),
            expires_at: null,
          })
          .eq('user_id', payment.user_id)
          .eq('course_id', payment.course_id)

        const [{ data: user }, { data: course }] = await Promise.all([
          supabase.from('users').select('*').eq('id', payment.user_id).single(),
          supabase.from('courses').select('*').eq('id', payment.course_id).single(),
        ])

        if (user && course) {
          await sendEnrollmentEmail(user, course).catch(err => console.error('Email send failed:', err))
        }

        await sendAdminNotification(
          `New Enrollment: ${user?.name}`,
          `User: ${user?.name} (${user?.email})\nPhone: ${phone}\nAmount: KES ${amount}\nReceipt: ${transactionId}\nCourse: ${course?.title}`
        ).catch(() => {})

        console.log(`[LIPANA WEBHOOK] ✅ Payment confirmed: ${transactionId} | User: ${payment.user_id}`)
      } else {
        // treat other events as failure/pending
        await supabase
          .from('payments')
          .update({ status: event === 'payment.pending' ? 'pending' : 'failed', failure_reason: event })
          .eq('id', payment.id)

        await supabase
          .from('enrollments')
          .update({ payment_status: event === 'payment.pending' ? 'pending' : 'failed' })
          .eq('user_id', payment.user_id)
          .eq('course_id', payment.course_id)

        const { data: user } = await supabase
          .from('users')
          .select('email, name')
          .eq('id', payment.user_id)
          .single()

        if (user && event !== 'payment.pending') {
          await sendPaymentFailedEmail(user.email, user.name, `Event: ${event}`).catch(() => {})
        }

        console.log(`[LIPANA WEBHOOK] Event: ${event} | User: ${payment.user_id}`)
      }

      return NextResponse.json({ received: true })
    }

    // If no Lipana signature header, treat as Daraja (Safaricom) callback
    const body: MpesaCallbackBody = JSON.parse(raw)

    console.log('[MPESA WEBHOOK]', JSON.stringify(body, null, 2))

    const callback = body?.Body?.stkCallback
    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Success' })
    }

    const {
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = callback

    const supabase = createAdminServerClient()

    // Find payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, user_id, course_id, amount, metadata')
      .eq('checkout_request_id', CheckoutRequestID)
      .single()

    if (paymentError || !payment) {
      console.error('[MPESA WEBHOOK] Payment not found:', CheckoutRequestID)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // --- SUCCESSFUL PAYMENT (ResultCode === 0) ---
    if (ResultCode === 0 && CallbackMetadata) {
      const meta = parseCallbackMetadata(CallbackMetadata.Item)
      const transactionId = meta.MpesaReceiptNumber as string
      const amount = meta.Amount as number
      const phone = meta.PhoneNumber as string

      // Update payment to completed
      await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          mpesa_receipt: transactionId,
          metadata: { ...payment.metadata, rawCallback: meta },
        })
        .eq('id', payment.id)

      // Grant course access via enrollment
      await supabase
        .from('enrollments')
        .update({
          payment_status: 'completed',
          course_access: true,
          enrolled_at: new Date().toISOString(),
          // Lifetime access — no expiry
          expires_at: null,
        })
        .eq('user_id', payment.user_id)
        .eq('course_id', payment.course_id)

      // Fetch user and course for email
      const [{ data: user }, { data: course }] = await Promise.all([
        supabase.from('users').select('*').eq('id', payment.user_id).single(),
        supabase.from('courses').select('*').eq('id', payment.course_id).single(),
      ])

      // Send welcome email
      if (user && course) {
        await sendEnrollmentEmail(user, course)
          .catch(err => console.error('Email send failed:', err))
      }

      // Notify admin
      await sendAdminNotification(
        `New Enrollment: ${user?.name}`,
        `User: ${user?.name} (${user?.email})\nPhone: ${phone}\nAmount: KES ${amount}\nReceipt: ${transactionId}\nCourse: ${course?.title}`
      ).catch(() => {})

      console.log(`[MPESA WEBHOOK] ✅ Payment confirmed: ${transactionId} | User: ${payment.user_id}`)

    } else {
      // --- FAILED PAYMENT ---
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: ResultDesc,
        })
        .eq('id', payment.id)

      await supabase
        .from('enrollments')
        .update({ payment_status: 'failed' })
        .eq('user_id', payment.user_id)
        .eq('course_id', payment.course_id)

      // Fetch user info for failure email
      const { data: user } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', payment.user_id)
        .single()

      if (user) {
        await sendPaymentFailedEmail(user.email, user.name, ResultDesc)
          .catch(() => {})
      }

      console.log(`[MPESA WEBHOOK] ❌ Payment failed: ${ResultDesc} | User: ${payment.user_id}`)
    }

    // Safaricom requires this exact response
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (error) {
    console.error('[MPESA WEBHOOK] Error:', error)
    // Still return 200 to Safaricom to prevent retries
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
