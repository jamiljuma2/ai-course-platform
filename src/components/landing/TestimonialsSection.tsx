import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Amina Wanjiku',
    role: 'Virtual Assistant, Nairobi',
    avatar: 'AW',
    rating: 5,
    text: 'Within 3 weeks of starting this course, I landed my first $200 AI writing client on Upwork. The prompt engineering module alone was worth 10x the price.',
  },
  {
    name: 'Brian Otieno',
    role: 'Marketing Manager, Mombasa',
    avatar: 'BO',
    rating: 5,
    text: 'I use AI to do my team\'s work in half the time now. I\'ve also started a content agency using what I learned. This course completely changed my trajectory.',
  },
  {
    name: 'Faith Muthoni',
    role: 'Freelance Designer, Nakuru',
    avatar: 'FM',
    rating: 5,
    text: 'The automation module is incredible. I set up Zapier workflows that now run my entire client onboarding process automatically. Saved 15 hours a week!',
  },
  {
    name: 'David Kamau',
    role: 'Student, Kenyatta University',
    avatar: 'DK',
    rating: 5,
    text: 'I was skeptical at first, but the practical assignments made everything click. I now help local businesses with their AI tools and charge KES 5,000 per setup.',
  },
  {
    name: 'Grace Njeri',
    role: 'Entrepreneur, Kisumu',
    avatar: 'GN',
    rating: 5,
    text: 'Built my entire business concept using Module 5. Had AI do the market research, branding, and even my business plan. Absolutely worth every shilling.',
  },
  {
    name: 'Samuel Odhiambo',
    role: 'Content Creator, Eldoret',
    avatar: 'SO',
    rating: 5,
    text: 'The content calendar practical changed my YouTube channel. Went from 0 to 2,000 subscribers in 60 days by posting consistently with AI-generated ideas.',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Student Success Stories</p>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4">
            Real Results from Real Students
          </h2>
          <p className="text-dark-600 text-lg">
            Join hundreds of Kenyans who are already earning with AI.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(({ name, role, avatar, rating, text }) => (
            <div key={name} className="card flex flex-col gap-4 hover:border-brand-200 transition-colors">
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-brand-500 fill-brand-500" />
                ))}
              </div>

              {/* Text */}
              <p className="text-dark-600 text-sm leading-relaxed flex-1">"{text}"</p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t border-brand-100">
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-xs font-bold border border-brand-100">
                  {avatar}
                </div>
                <div>
                  <div className="text-dark-900 text-sm font-semibold">{name}</div>
                  <div className="text-dark-500 text-xs">{role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
