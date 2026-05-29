'use client'

import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

export default function RefreshDashboardButton() {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50"
    >
      <RefreshCw size={14} />
      Refresh dashboard
    </button>
  )
}