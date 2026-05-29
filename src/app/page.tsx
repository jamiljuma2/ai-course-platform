// app/page.tsx — Full Landing Page
import React, { Suspense } from 'react'
import HeroSection from '@/components/landing/HeroSection'
import CoursesSection from '@/components/landing/CoursesSection'
import BenefitsSection from '@/components/landing/BenefitsSection'
// ModulesSection intentionally omitted from public landing to avoid exposing module details to users
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import EnrollmentSection from '@/components/landing/EnrollmentSection'
import FooterSection from '@/components/landing/FooterSection'
import NavBar from '@/components/landing/NavBar'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden text-dark-900">
      <Suspense fallback={<div />}> 
        <NavBar />
        <HeroSection />
      </Suspense>
      <CoursesSection />
      <BenefitsSection />
      <TestimonialsSection />
      <Suspense fallback={<div />}>{/* Enrollment uses client hooks (search params) */}
        <EnrollmentSection />
      </Suspense>
      <FooterSection />
    </main>
  )
}
