// ============================================================
// EMAIL SERVICE - Powered by Resend
// ============================================================
import { Resend } from 'resend'
import { createAdminServerClient } from '@/lib/supabase/server'
import type { User, Course } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM || 'AI Course <noreply@aicourse.co.ke>'

// --- ENROLLMENT CONFIRMATION EMAIL ---
export async function sendEnrollmentEmail(user: User, course: Course) {
  const meetLink = process.env.NEXT_PUBLIC_GOOGLE_MEET_LINK
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI for Beginners!</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#111113;border-radius:16px;overflow:hidden;border:1px solid #27272a;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#e8820f,#f7982d);padding:40px 40px 30px;text-align:center;">
            <p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.8);text-transform:uppercase;letter-spacing:2px;">YOU'RE IN!</p>
            <h1 style="margin:0;font-size:28px;font-weight:700;color:#fff;">Welcome to AI for Beginners 🎉</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 20px;font-size:16px;color:#a1a1aa;line-height:1.7;">
              Hi <strong style="color:#fff;">${user.name}</strong>,
            </p>
            <p style="margin:0 0 24px;font-size:16px;color:#a1a1aa;line-height:1.7;">
              Your enrollment is confirmed and payment received. You now have <strong style="color:#f7982d;">full access</strong> to all 8 modules, lessons, and practical assignments.
            </p>

            <!-- CTA -->
            <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
              <tr>
                <td style="background:#e8820f;border-radius:10px;padding:14px 32px;text-align:center;">
                  <a href="${appUrl}/dashboard" style="color:#fff;text-decoration:none;font-size:16px;font-weight:600;">
                    Start Learning Now →
                  </a>
                </td>
              </tr>
            </table>

            <!-- What's Inside -->
            <div style="background:#18181b;border-radius:12px;padding:24px;margin-bottom:24px;">
              <h3 style="margin:0 0 16px;color:#fff;font-size:16px;">📚 What You'll Learn</h3>
              <ul style="margin:0;padding:0 0 0 20px;color:#a1a1aa;line-height:2;">
                <li>Introduction to AI & the Digital Economy</li>
                <li>Mastering ChatGPT & Prompt Engineering</li>
                <li>AI for Content Creation & Social Media</li>
                <li>AI for Freelancing & Income Generation</li>
                <li>AI for Business & Entrepreneurship</li>
                <li>AI Automation with Zapier & Make</li>
                <li>Building AI Tools & Apps</li>
                <li>Monetization Strategies & Career Paths</li>
              </ul>
            </div>

            <!-- Schedule -->
            <div style="background:#18181b;border-radius:12px;padding:24px;margin-bottom:24px;">
              <h3 style="margin:0 0 12px;color:#fff;font-size:16px;">📅 Live Session Link</h3>
              <p style="margin:0 0 12px;color:#a1a1aa;font-size:14px;">Join our weekly live Q&A sessions:</p>
              <a href="${meetLink}" style="color:#f7982d;font-size:14px;word-break:break-all;">${meetLink}</a>
            </div>

            <!-- Support -->
            <div style="border-top:1px solid #27272a;padding-top:24px;text-align:center;">
              <p style="margin:0;color:#52525b;font-size:14px;">
                Need help? Email us at
                <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color:#f7982d;">${process.env.SUPPORT_EMAIL}</a>
              </p>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
  `

  try {
    const result = await resend.emails.send({
      from: FROM,
      to: user.email,
      subject: `You're Enrolled – AI for Beginners 🎉`,
      html,
    })

    // Log email
    const supabase = createAdminServerClient()
    await supabase.from('email_logs').insert({
      user_id: user.id,
      type: 'enrollment_confirmation',
      recipient: user.email,
      subject: `You're Enrolled – AI for Beginners 🎉`,
      status: 'sent',
      provider_id: result.data?.id,
    })

    return result
  } catch (error) {
    console.error('Failed to send enrollment email:', error)
    throw error
  }
}

// --- PAYMENT FAILED EMAIL ---
export async function sendPaymentFailedEmail(email: string, name: string, reason?: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Payment Issue – AI for Beginners',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">
        <h2 style="color:#e8820f;">Payment Not Completed</h2>
        <p>Hi ${name},</p>
        <p>Your M-Pesa payment was not completed${reason ? `: <em>${reason}</em>` : '.'}.</p>
        <p>Please try again or contact us at <a href="mailto:${process.env.SUPPORT_EMAIL}">${process.env.SUPPORT_EMAIL}</a></p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/#enroll" 
           style="display:inline-block;background:#e8820f;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:16px;">
          Try Again
        </a>
      </div>
    `,
  })
}

// --- ADMIN NOTIFICATION ---
export async function sendAdminNotification(subject: string, message: string) {
  if (!process.env.SUPPORT_EMAIL) return
  await resend.emails.send({
    from: FROM,
    to: process.env.SUPPORT_EMAIL,
    subject: `[Admin] ${subject}`,
    html: `<div style="font-family:monospace;padding:20px;background:#f5f5f5;">
      <h3>${subject}</h3>
      <pre>${message}</pre>
      <p style="color:#666;font-size:12px;">Sent: ${new Date().toISOString()}</p>
    </div>`,
  })
}
