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
import { getPublicCourseOptions } from '@/lib/public-courses'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const courses = await getPublicCourseOptions()

  return (
    <main className="min-h-screen bg-white overflow-x-hidden text-dark-900">
      <Suspense fallback={<div />}> 
        <NavBar />
        <HeroSection courseCount={courses.length} />
      </Suspense>
      <CoursesSection courses={courses} />
      <BenefitsSection />
      <TestimonialsSection />
      <Suspense fallback={<div />}>{/* Enrollment uses client hooks (search params) */}
        <EnrollmentSection courses={courses} />
      </Suspense>
      <FooterSection />
    </main>
  )
}
