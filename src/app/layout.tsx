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
  title: 'Practical Skills Courses | Kenya',
  description: 'Choose practical courses in AI and web development. Pay with M-Pesa and start learning with lifetime access.',
  keywords: 'online courses Kenya, AI course Kenya, web development course, M-Pesa course, practical skills',
  openGraph: {
    title: 'Practical Skills Courses',
    description: 'Choose a practical course and start building job-ready skills.',
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
      <head>
        {/* Fallback precompiled CSS to ensure styles load even if Tailwind build fails */}
        <link rel="stylesheet" href="/tailwind.css" />
      </head>
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
