export interface CourseOption {
  slug: string
  title: string
  description: string
  priceKes: number
  thumbnail?: string
  duration: string
  badge: string
  highlights: string[]
}

export const COURSE_OPTIONS: CourseOption[] = [
  {
    slug: 'ai-for-beginners',
    title: 'AI for Beginners',
    description: 'Master AI tools, prompt engineering, freelancing, and automation to earn more and work smarter.',
    priceKes: 3000,
    duration: '8 modules',
    badge: 'Featured track',
    highlights: [
      'Prompt engineering and AI workflows',
      'Freelancing, business, and automation',
      'Certificate on completion',
    ],
  },
  {
    slug: 'web-development',
    title: 'Web Development',
    description: 'Learn HTML, CSS, JavaScript, responsive design, and deployment to build and launch real websites.',
    priceKes: 4500,
    duration: '4 modules',
    badge: 'New track',
    highlights: [
      'HTML, CSS, and JavaScript fundamentals',
      'Responsive layouts and interactive pages',
      'Build and publish a portfolio website',
    ],
  },
]

export function getCourseOption(slug?: string | null, courses: CourseOption[] = COURSE_OPTIONS) {
  return courses.find(course => course.slug === slug) || courses[0] || COURSE_OPTIONS[0]
}