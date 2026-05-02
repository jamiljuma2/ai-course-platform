import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import LoginPageClient from './LoginPageClient'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  )
}
