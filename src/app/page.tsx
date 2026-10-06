// app/page.tsx — Full Landing Page
import React, { Suspense } from 'react'
import HeroSection from '@/components/landing/HeroSection'
import CoursesSection from '@/components/landing/CoursesSection'
import BenefitsSection from '@/components/landing/BenefitsSection'
import LearningBanner from '@/components/landing/LearningBanner'
// ModulesSection intentionally omitted from public landing to avoid exposing module details to users
import TestimonialsSection from '@/components/landing/TestimonialsSection'
import EnrollmentSection from '@/components/landing/EnrollmentSection'
import FooterSection from '@/components/landing/FooterSection'
import NavBar from '@/components/landing/NavBar'
import { getPublicCourseOptions } from '@/lib/public-courses'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const courses = await getPublicCourseOptions()

  return (
    <main className="landing-page min-h-screen bg-white overflow-x-clip text-dark-900">
      <Suspense fallback={<div />}> 
        <NavBar />
        <HeroSection courseCount={courses.length} />
      </Suspense>
      <BenefitsSection />
      <LearningBanner />
      <CoursesSection courses={courses} />
      <TestimonialsSection />
      <Suspense fallback={<div />}>{/* Enrollment uses client hooks (search params) */}
        <EnrollmentSection courses={courses} />
      </Suspense>
      <FooterSection />
    </main>
  )
}
