import Link from 'next/link'

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-dark-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-dark-600 mb-8">Answers to common questions about courses, payments, and access.</p>

        <section className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-2">How do I enroll?</h2>
            <p className="text-dark-600">Choose a course from the homepage, complete payment via M-Pesa, and your access will be activated automatically once payment is confirmed.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">What payment methods are accepted?</h2>
            <p className="text-dark-600">We accept M-Pesa payments (Lipa Na M-Pesa). Follow the on-screen payment instructions during enrollment.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Will I get a certificate?</h2>
            <p className="text-dark-600">Yes — upon completing course requirements and the capstone project you will be issued a certificate downloadable from your dashboard.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Can I get a refund?</h2>
            <p className="text-dark-600">Refunds are handled case-by-case. Contact our support at <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@nextgenacademy.com'}`} className="text-brand-700">support</a>.</p>
          </div>
        </section>

        <div className="mt-12">
          <Link href="/" className="text-brand-700 hover:underline">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}
