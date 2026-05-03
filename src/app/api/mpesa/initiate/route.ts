// app/api/mpesa/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { initiateSTKPush, isValidKenyanPhone, formatPhone } from '@/lib/mpesa'
import { createAdminServerClient } from '@/lib/supabase/admin'

async function resolveAuthUserId(
  supabase: ReturnType<typeof createAdminServerClient>,
  email: string,
  name: string,
  phone: string
) {
  const { data: createdUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { name, phone: formatPhone(phone) },
  })

  if (createdUser?.user?.id) {
    return createdUser.user.id
  }

  const alreadyExists = createError?.message?.toLowerCase().includes('already')
  if (!alreadyExists && createError) {
    throw createError
  }

  const { data: userList, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (listError) throw listError

  const matchedUser = userList.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())
  if (!matchedUser) {
    throw new Error(`Could not resolve auth user for ${email}`)
  }

  return matchedUser.id
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, courseId } = body

    // --- Validation ---
    if (!name || !email || !phone || !courseId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone, courseId' },
        { status: 400 }
      )
    }

    if (!isValidKenyanPhone(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use format: 07XXXXXXXX or 01XXXXXXXX' },
        { status: 400 }
      )
    }

    const supabase = createAdminServerClient()

    // --- Get course ---
    const { data: course } = await supabase
      .from('courses')
      .select('id, price_kes, title')
      .eq('id', courseId)
      .single()

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // --- Upsert user ---
    let userId: string
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      userId = existingUser.id
      // Check duplicate active enrollment
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('id, course_access')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .eq('payment_status', 'completed')
        .single()

      if (existingEnrollment?.course_access) {
        return NextResponse.json(
          { error: 'You are already enrolled in this course. Check your email for access details.' },
          { status: 409 }
        )
      }
    } else {
      // Create the matching auth user first, then store the public profile
      const authUserId = await resolveAuthUserId(supabase, email, name, phone)

      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({ id: authUserId, name, email, phone: formatPhone(phone), role: 'student' })
        .select('id')
        .single()

      if (userError) throw userError
      userId = newUser.id
    }

    // --- Create pending payment record ---
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        course_id: courseId,
        amount: course.price_kes,
        phone: formatPhone(phone),
        status: 'pending',
        metadata: { name, email },
      })
      .select('id')
      .single()

    if (paymentError) throw paymentError

    // --- Create pending enrollment ---
    await supabase.from('enrollments').upsert({
      user_id: userId,
      course_id: courseId,
      payment_id: payment.id,
      payment_status: 'pending',
      course_access: false,
    }, { onConflict: 'user_id,course_id' })

    // --- Initiate M-Pesa STK Push ---
    const stkResponse = await initiateSTKPush({
      phone,
      amount: course.price_kes,
      accountRef: 'AICOURSE',
      description: 'AI Course Fee',
    })

    // --- Store checkout request ID ---
    await supabase
      .from('payments')
      .update({
        checkout_request_id: stkResponse.CheckoutRequestID,
        merchant_request_id: stkResponse.MerchantRequestID,
      })
      .eq('id', payment.id)

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      paymentId: payment.id,
      message: 'STK Push sent. Check your phone and enter your M-Pesa PIN.',
    })

  } catch (error: unknown) {
    console.error('STK Push error:', error)
    const message =
      error && typeof error === 'object' && 'response' in error
        ? (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
          (error as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message ||
          'Payment initiation failed'
        : error instanceof Error
          ? error.message
          : 'Payment initiation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
