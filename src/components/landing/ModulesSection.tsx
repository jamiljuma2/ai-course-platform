'use client'
import { useState } from 'react'
import { Briefcase, Brain, Rocket, Settings, Code, TrendingUp, PenTool } from 'lucide-react'

const modules = [
  {
    num: 1, icon: Brain,
    title: 'Introduction to AI & Digital Economy',
    desc: 'Understand AI fundamentals, types, real-world use cases, and how AI is reshaping jobs and creating opportunities.',
    practical: 'Identify 5 AI tools relevant to your work + write your personal AI opportunity statement',
    duration: '~3 hours',
  },
  {
    num: 2, icon: Brain,
    title: 'Mastering ChatGPT',
    desc: 'Deep dive into prompt engineering, role-based prompting, custom GPTs, and building an AI assistant system.',
    practical: 'Build a custom AI assistant tailored to your niche or workflow',
    duration: '~5 hours',
  },
  {
    num: 3, icon: PenTool,
    title: 'AI for Content Creation',
    desc: 'Use AI to write compelling content, manage social media, and grow any audience consistently.',
    practical: 'Create a 30-day content calendar with 30 pieces of AI-assisted content',
    duration: '~4 hours',
  },
  {
    num: 4, icon: Briefcase,
    title: 'AI for Freelancing & Income',
    desc: 'Build a profitable freelance career on Fiverr and Upwork using AI to deliver faster, at higher quality.',
    practical: 'Create and publish a freelance service offer using AI tools',
    duration: '~4 hours',
  },
  {
    num: 5, icon: Rocket,
    title: 'AI for Business',
    desc: 'Generate business ideas, conduct market research, and build a brand using AI as your business analyst.',
    practical: 'Build a complete business concept with research, branding, and go-to-market plan',
    duration: '~4 hours',
  },
  {
    num: 6, icon: Settings,
    title: 'AI Automation',
    desc: 'Automate repetitive tasks using Zapier and Make, and build workflows that save 10+ hours per week.',
    practical: 'Build and deploy 2 real automations for your business or workflow',
    duration: '~5 hours',
  },
  {
    num: 7, icon: Code,
    title: 'Building AI Tools',
    desc: 'Understand APIs, AI architecture, and how to design sellable AI-powered applications.',
    practical: 'Design a complete AI app concept with specs, user flow, and monetization plan',
    duration: '~5 hours',
  },
  {
    num: 8, icon: TrendingUp,
    title: 'Monetization & Career Paths',
    desc: 'Turn your AI skills into sustainable income. Build a portfolio and create your personalized 30-day plan.',
    practical: 'Submit your complete capstone: portfolio + service + business + automation',
    duration: '~4 hours',
  },
]

export default function ModulesSection() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section id="modules" className="py-24 bg-brand-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Course Curriculum</p>
          <h2 className="text-4xl md:text-5xl font-bold text-dark-900 mb-4">
            8 Modules, Practical Outcomes
          </h2>
          <p className="text-dark-600 text-lg">
            From complete beginner to earning with AI — in 8 structured modules.
          </p>
        </div>

        <div className="space-y-3">
          {modules.map((mod) => {
            const Icon = mod.icon
            return (
              <div
                key={mod.num}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  'border-brand-100 bg-white hover:border-brand-300 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="w-full flex items-center gap-4 p-5 text-left">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 border border-brand-100">
                    <span className="text-brand-700 font-bold text-sm">{mod.num < 10 ? `0${mod.num}` : mod.num}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-dark-900">{mod.title}</div>
                    <div className="text-sm text-dark-500 mt-0.5">{mod.duration} · practical project-based learning</div>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <p className="text-dark-600 text-sm mb-4 leading-relaxed">{mod.desc}</p>
                  <div className="bg-brand-50 border border-brand-100 rounded-lg p-4">
                    <div className="text-xs text-brand-700 font-semibold uppercase tracking-wider mb-1">
                      🎯 Practical Outcome
                    </div>
                    <div className="text-sm text-dark-900">{mod.practical}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Capstone */}
        <div className="mt-8 card border-brand-100 bg-gradient-to-br from-brand-50 to-white">
          <div className="text-center">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-dark-900 mb-2">Final Capstone Project</h3>
            <p className="text-dark-600 text-sm mb-4">Submit your complete portfolio to earn your certificate:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {['Portfolio', 'Freelance Service', 'Business Idea', 'Content Samples', 'Automation Workflow'].map(item => (
                <span key={item} className="px-3 py-1 bg-white border border-brand-100 rounded-full text-brand-700 text-xs font-medium shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
