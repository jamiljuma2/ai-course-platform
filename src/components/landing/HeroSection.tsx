import Image from 'next/image'
import { ArrowRight, BookOpen, Video, MessagesSquare, Award } from 'lucide-react'

const features = [
  { icon: BookOpen, title: 'Online courses', description: 'Practical lessons, wherever you are.' },
  { icon: Video, title: 'Learn at your pace', description: 'Make room for learning in your day.' },
  { icon: MessagesSquare, title: 'Practical projects', description: 'Build confidence through real work.' },
  { icon: Award, title: 'Certification', description: 'Show the skills you have learned.' },
]

export default function HeroSection({ courseCount }: { courseCount: number }) {
  return (
    <>
      <section className="academy-hero">
        <div className="hero-orbit" aria-hidden="true" />
        <div className="academy-container hero-layout">
          <div className="hero-copy">
            <span className="hero-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
            <h1>Upgrade your skills and knowledge with our online courses</h1>
            <p>Discover practical AI and web development skills. Learn at your pace, build real projects, and create new possibilities.</p>
            <div className="hero-actions"><a href="#courses" className="hero-white-button">Explore courses <ArrowRight size={16} /></a><a href="#enroll" className="hero-outline-button">Get started</a></div>
            <span className="hero-note">{courseCount} practical courses · Lifetime access · M-Pesa payments</span>
          </div>
          <div className="hero-photo"><Image width={1374} height={1145} priority sizes="(max-width: 640px) 100vw, 550px" src="/images/academy-students.png" alt="Two students learning together with a laptop and books" /></div>
        </div>
      </section>
      <div className="academy-container feature-strip">
        {features.map(({ icon: Icon, title, description }) => <div className="feature-item" key={title}><span className="feature-icon"><Icon size={22} /></span><div><h2>{title}</h2><p>{description}</p></div></div>)}
      </div>
    </>
  )
}
