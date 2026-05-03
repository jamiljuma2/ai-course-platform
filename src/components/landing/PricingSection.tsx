import { Check, ArrowRight } from 'lucide-react'

const features = [
  '8 structured modules + 40+ lessons',
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
    <section id="pricing" className="py-24 bg-dark-900">
      <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
        <p className="section-label mb-3">Simple Pricing</p>
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          One Price. All Access.
        </h2>
        <p className="text-dark-300 text-lg mb-12">
          No subscriptions. No hidden fees. Pay once, learn forever.
        </p>

        <div className="card border-brand-500/30 bg-gradient-to-b from-dark-800 to-dark-800/50 relative overflow-hidden">
          {/* Popular badge */}
          <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl">
            MOST POPULAR
          </div>

          {/* Price */}
          <div className="mb-8">
            <div className="text-dark-400 text-sm mb-2">One-time payment</div>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-dark-400 text-2xl">KES</span>
              <span className="text-6xl font-bold text-white">3,000</span>
            </div>
            <div className="text-dark-400 text-sm mt-2 line-through">KES 7,500</div>
            <div className="text-brand-400 text-sm font-medium">60% off — Limited time offer</div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            {features.map(feature => (
              <div key={feature} className="flex items-start gap-3">
                <Check size={16} className="text-brand-400 mt-0.5 shrink-0" />
                <span className="text-dark-300 text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <a href="#enroll" className="btn-primary w-full text-base glow-brand">
            Enroll Now — Pay with M-Pesa
            <ArrowRight size={18} />
          </a>

          <p className="text-dark-400 text-xs mt-4">
            Secure payment via M-Pesa Lipa Na M-Pesa. No card required.
          </p>
        </div>

        {/* Trust badge */}
        <div className="flex items-center justify-center gap-6 mt-8 text-dark-400 text-sm">
          <span>🔒 Secure Payment</span>
          <span>📱 M-Pesa Only</span>
          <span>♾️ Lifetime Access</span>
        </div>
      </div>
    </section>
  )
}
