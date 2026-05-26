import { Check, ArrowRight } from 'lucide-react'

const features = [
  '8 structured modules with practical outcomes',
  'Practical assignment per module',
  'Final capstone project',
  'Certificate of completion',
  'Lifetime access (no expiry)',
  'Weekly live Q&A sessions',
  'Private student community',
  'All future content updates',
  'M-Pesa payment — no card needed',
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white/80 border-y border-brand-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
        <p className="section-label mb-3">Simple Pricing</p>
        <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4">
          One Price. All Access.
        </h2>
        <p className="text-dark-600 text-lg mb-12">
          No subscriptions. No hidden fees. Pay once, learn forever.
        </p>

        <div className="card border-brand-100 bg-gradient-to-b from-white to-brand-50/60 relative overflow-hidden soft-glow">
          {/* Popular badge */}
          <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-lg shadow-brand-500/25">
            MOST POPULAR
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="text-dark-500 text-sm mb-2">One-time payment</div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-dark-500 text-2xl">KES</span>
              <span className="text-6xl font-bold text-dark-900">3,000</span>
            </div>
            <div className="text-dark-500 text-sm mt-2 line-through">KES 7,500</div>
            <div className="text-brand-700 text-sm font-medium">60% off — Limited time offer</div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            {features.map(feature => (
              <div key={feature} className="flex items-start gap-3">
                <Check size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <span className="text-dark-600 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a href="#enroll" className="btn-primary w-full text-base glow-brand">
            Enroll Now — Pay with M-Pesa
            <ArrowRight size={18} />
          </a>

          <p className="text-dark-500 text-xs mt-4">
            Secure payment via M-Pesa Lipa Na M-Pesa. No card required.
          </p>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-6 mt-8 text-dark-500 text-sm">
          <span>🔒 Secure Payment</span>
          <span>📱 M-Pesa Only</span>
          <span>♾️ Lifetime Access</span>
        </div>
      </div>
    </section>
  )
}
