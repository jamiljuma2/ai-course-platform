import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-dark-900 mb-4">Terms of Service</h1>
        <p className="text-dark-600 mb-8">Please read these terms before using the platform.</p>

        <section className="space-y-6 text-dark-600">
          <div>
            <h2 className="text-lg font-semibold">Service Access</h2>
            <p className="mt-2">By using this platform you agree to our rules for conduct and payment. Access to course content is provided after successful payment and subject to our enrollment terms.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Payments and Refunds</h2>
            <p className="mt-2">Payments are processed via M-Pesa. Refunds are considered on a case-by-case basis; contact support for requests.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Intellectual Property</h2>
            <p className="mt-2">Course materials are the intellectual property of the platform or its partners. You may not redistribute course content without permission.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Limitation of Liability</h2>
            <p className="mt-2">We make reasonable efforts to provide the service but are not liable for indirect damages. See full policy and contact support for concerns.</p>
          </div>
        </section>

        <div className="mt-12">
          <Link href="/" className="text-brand-700 hover:underline">← Back to home</Link>
        </div>
      </div>
    </main>
  )
}
