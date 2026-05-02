// supabase/functions/post-payment-automation/index.ts
// Deploy with: supabase functions deploy post-payment-automation
// This runs server-side after payment confirmation as a fallback

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  try {
    const { userId, courseId, paymentId } = await req.json()

    if (!userId || !courseId || !paymentId) {
      return new Response(JSON.stringify({ error: 'Missing params' }), { status: 400 })
    }

    // 1. Verify payment is completed
    const { data: payment } = await supabase
      .from('payments')
      .select('status, amount')
      .eq('id', paymentId)
      .single()

    if (!payment || payment.status !== 'completed') {
      return new Response(JSON.stringify({ error: 'Payment not verified' }), { status: 400 })
    }

    // 2. Grant enrollment access
    const { error: enrollError } = await supabase
      .from('enrollments')
      .upsert({
        user_id: userId,
        course_id: courseId,
        payment_id: paymentId,
        payment_status: 'completed',
        course_access: true,
        enrolled_at: new Date().toISOString(),
      }, { onConflict: 'user_id,course_id' })

    if (enrollError) throw enrollError

    // 3. Note: Auth user creation/invitation removed. Users should sign up via login page with password.

    return new Response(
      JSON.stringify({ success: true, message: 'Enrollment activated' }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Automation error:', error)
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500 }
    )
  }
})
