import Image from 'next/image'
import { BookOpen, TrendingUp, Award } from 'lucide-react'
const benefits = [
  { icon: BookOpen, title: 'Online courses', description: 'Explore focused courses in AI and web development, with lessons you can revisit anytime.' },
  { icon: TrendingUp, title: 'Upgrade personal skills', description: 'Put each lesson into practice with assignments that help you build useful, real-world skills.' },
  { icon: Award, title: 'Certification', description: 'Complete your course and capstone project to earn a verifiable certificate.' },
]
export default function BenefitsSection() {
  return <section id="about" className="academy-about geometric-section"><div className="academy-container about-layout">
    <div className="about-photo"><span className="student-badge"><strong>Learn</strong><span>without limits</span></span><Image width={1222} height={1287} sizes="(max-width: 640px) 100vw, 500px" src="/images/academy-learner.png" alt="Student sitting comfortably with her laptop" /></div>
    <div className="about-copy"><p className="section-label">WHY NEXTGEN</p><h2>Quality instruction.<br />A brighter future.</h2><p className="section-intro">Take the next step with accessible online education built around practical skills, meaningful projects, and your ambitions.</p>
      <div className="about-benefits">{benefits.map(({ icon: Icon, title, description }) => <div className="about-benefit" key={title}><span className="feature-icon"><Icon size={23} /></span><div><h3>{title}</h3><p>{description}</p></div></div>)}</div>
    </div>
  </div></section>
}
