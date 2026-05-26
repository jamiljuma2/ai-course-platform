import type { Metadata } from 'next'
import { Sora, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI for Beginners – Practical AI Skills | Kenya',
  description: 'Master AI tools to earn more, work smarter, and build a profitable digital career. Enroll for KES 3,000. Pay with M-Pesa.',
  keywords: 'AI course Kenya, ChatGPT training, freelancing AI, M-Pesa course, online learning Kenya',
  openGraph: {
    title: 'AI for Beginners – Practical AI Skills',
    description: 'Join 500+ Kenyans mastering AI for income and career growth.',
    type: 'website',
    images: [
      {
        url: '/og-image.svg',
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jetbrains.variable}`}>
      <body className="bg-white text-dark-900 antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: { background: '#ffffff', color: '#0f172a', border: '1px solid #dcfbe3' },
            success: { iconTheme: { primary: '#2fb85c', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  )
}
