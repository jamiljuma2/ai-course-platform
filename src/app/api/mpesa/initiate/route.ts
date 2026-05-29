// app/api/mpesa/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { initiateSTKPush, isValidKenyanPhone, formatPhone } from '@/lib/mpesa'
import { createAdminServerClient } from '@/lib/supabase/admin'
import { COURSE_OPTIONS } from '@/lib/course-options'

type CourseRecord = {
  id: string
  slug: string
  title: string
  price_kes: number
}

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

async function resolveCourseForPayment(
  supabase: ReturnType<typeof createAdminServerClient>,
  courseRef: string
): Promise<CourseRecord | null> {
  const ref = courseRef.trim()
  if (!ref) return null

  const { data: byId } = await supabase
    .from('courses')
    .select('id, slug, title, price_kes')
    .eq('id', ref)
    .eq('is_active', true)
    .maybeSingle()

  if (byId) return byId

  const { data: bySlug } = await supabase
    .from('courses')
    .select('id, slug, title, price_kes')
    .eq('slug', ref)
    .eq('is_active', true)
    .maybeSingle()

  if (bySlug) return bySlug

  const catalogCourse = COURSE_OPTIONS.find((course) => course.slug === ref)
  if (!catalogCourse) return null

  const { data: upserted } = await supabase
    .from('courses')
    .upsert({
      slug: catalogCourse.slug,
      title: catalogCourse.title,
      description: catalogCourse.description,
      price_kes: catalogCourse.priceKes,
      is_active: true,
    }, { onConflict: 'slug' })
    .select('id, slug, title, price_kes')
    .single()

  return upserted || null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, courseId, courseSlug } = body
    const courseRef = String(courseId || courseSlug || '').trim()

    // --- Validation ---
    if (!name || !email || !phone || !courseRef) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, phone, and course reference' },
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

    // --- Resolve course by id or slug ---
    const course = await resolveCourseForPayment(supabase, courseRef)

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
        .eq('course_id', course.id)
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
        course_id: course.id,
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
      course_id: course.id,
      payment_id: payment.id,
      payment_status: 'pending',
      course_access: false,
    }, { onConflict: 'user_id,course_id' })

    // --- Initiate M-Pesa STK Push ---
    const stkResponse = await initiateSTKPush({
      phone,
      amount: course.price_kes,
      accountRef: 'NEXTGEN',
      description: 'NextGen Academy Fee',
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
