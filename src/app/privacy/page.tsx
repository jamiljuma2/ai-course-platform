import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-dark-900 mb-4">Privacy Policy</h1>
        <p className="text-dark-600 mb-8">We value your privacy. This page explains what data we collect and how we use it.</p>

        <section className="space-y-6 text-dark-600">
          <div>
            <h2 className="text-lg font-semibold">Information We Collect</h2>
            <p className="mt-2">We collect the personal information you provide during registration and payments (name, email, phone), as well as course progress data to enable learning features.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">How We Use Your Data</h2>
            <p className="mt-2">Your data is used to provide the service (enrollments, progress tracking, certificate issuance), to process payments, and to send transactional emails. We do not sell personal data to third parties.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Third-Party Services</h2>
            <p className="mt-2">We use Supabase for hosting and authentication, and Resend for email delivery. These providers may process data under their own policies — consult their docs for details.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Your Rights</h2>
            <p className="mt-2">You can request access to or deletion of your data by contacting support at <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@nextgenacademy.com'}`} className="text-brand-700">support</a>.</p>
          </div>
        </section>

        <div className="mt-12">
          <Link href="/" className="text-brand-700 hover:underline">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}
