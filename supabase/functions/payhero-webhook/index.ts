import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

const successStatuses = new Set(['success', 'successful', 'completed', 'paid'])
const failureStatuses = new Set(['failed', 'cancelled', 'reversed'])

function isPayHeroSuccess(status: unknown) {
  return successStatuses.has(String(status || '').toLowerCase())
}

function isPayHeroFailure(status: unknown) {
  return failureStatuses.has(String(status || '').toLowerCase())
}

function getSecret(request: Request, url: URL) {
  return request.headers.get('x-payhero-secret') || url.searchParams.get('secret') || ''
}

serve(async (request) => {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const url = new URL(request.url)
  const webhookSecret = Deno.env.get('PAYHERO_WEBHOOK_SECRET')
  if (webhookSecret && getSecret(request, url) !== webhookSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload = await request.json()
    const externalReference = String(payload.external_reference || '')
    const providerReference = String(payload.reference || payload.payment_id || payload.id || '')

    if (!externalReference && !providerReference) {
      return new Response(JSON.stringify({ received: true, ignored: 'Missing payment reference' }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const paymentQuery = supabase
      .from('payments')
      .select('id, user_id, course_id, amount, status, metadata')

    const { data: payment, error: paymentError } = externalReference
      ? await paymentQuery.eq('id', externalReference).maybeSingle()
      : await paymentQuery.eq('checkout_request_id', providerReference).maybeSingle()

    if (paymentError) throw paymentError
    if (!payment) {
      console.error('PayHero payment not found', externalReference || providerReference)
      return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const status = String(payload.status || '').toLowerCase()
    const transactionId = String(
      payload.receipt_number || payload.mpesa_receipt || payload.transaction_id || providerReference,
    )

    if (isPayHeroSuccess(status)) {
      if (payment.status !== 'completed') {
        const { error: paymentUpdateError } = await supabase
          .from('payments')
          .update({
            status: 'completed',
            checkout_request_id: providerReference || null,
            transaction_id: transactionId,
            mpesa_receipt: transactionId,
            metadata: { ...payment.metadata, provider: 'payhero', rawWebhook: payload },
          })
          .eq('id', payment.id)

        if (paymentUpdateError) throw paymentUpdateError
      }

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({
          payment_status: 'completed',
          course_access: true,
          enrolled_at: new Date().toISOString(),
          expires_at: null,
        })
        .eq('user_id', payment.user_id)
        .eq('course_id', payment.course_id)

      if (enrollmentError) throw enrollmentError
    } else if (isPayHeroFailure(status)) {
      const failureReason = String(payload.failure_reason || payload.message || status)
      const { error: paymentUpdateError } = await supabase
        .from('payments')
        .update({ status: 'failed', failure_reason: failureReason })
        .eq('id', payment.id)

      if (paymentUpdateError) throw paymentUpdateError

      const { error: enrollmentError } = await supabase
        .from('enrollments')
        .update({ payment_status: 'failed' })
        .eq('user_id', payment.user_id)
        .eq('course_id', payment.course_id)

      if (enrollmentError) throw enrollmentError
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('PayHero webhook error', error)
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
