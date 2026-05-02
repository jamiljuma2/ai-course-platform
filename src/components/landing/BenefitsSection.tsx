import { Zap, DollarSign, Globe, Shield, Clock, TrendingUp } from 'lucide-react'

const benefits = [
  {
    icon: Zap,
    title: 'Learn by Doing',
    desc: 'Every module has a real-world practical assignment. No theory without action.',
  },
  {
    icon: DollarSign,
    title: 'Generate Income Fast',
    desc: 'Start offering AI services on Fiverr or Upwork while you\'re still in the course.',
  },
  {
    icon: Globe,
    title: 'Work from Anywhere',
    desc: 'All skills are location-independent. Earn in USD while living in Kenya.',
  },
  {
    icon: Shield,
    title: 'Lifetime Access',
    desc: 'One payment, lifetime access. Including all future updates to course content.',
  },
  {
    icon: Clock,
    title: 'Learn at Your Pace',
    desc: 'Self-paced learning with live weekly Q&A sessions every Saturday.',
  },
  {
    icon: TrendingUp,
    title: 'Certificate of Completion',
    desc: 'Earn a verifiable certificate after completing your capstone project.',
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-24 bg-dark-800/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Why This Course</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for Real Results
          </h2>
          <p className="text-dark-300 text-lg max-w-xl mx-auto">
            Not just AI theory — practical skills you can monetize the same week you learn them.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card group hover:border-brand-500/40 hover:bg-dark-700/50 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4 group-hover:bg-brand-500/20 transition-colors">
                <Icon size={22} className="text-brand-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              <p className="text-dark-300 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
