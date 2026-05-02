// app/page.tsx — Full Landing Page
import HeroSection from '@/components/landing/HeroSection'
import BenefitsSection from '@/components/landing/BenefitsSection'
import ModulesSection from '@/components/landing/ModulesSection'
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import PricingSection from '@/components/landing/PricingSection'
import EnrollmentSection from '@/components/landing/EnrollmentSection'
import FooterSection from '@/components/landing/FooterSection'
import NavBar from '@/components/landing/NavBar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-dark-900 overflow-x-hidden">
      <NavBar />
      <HeroSection />
      <BenefitsSection />
      <ModulesSection />
      <TestimonialsSection />
      <PricingSection />
      <EnrollmentSection />
      <FooterSection />
    </main>
  )
}
