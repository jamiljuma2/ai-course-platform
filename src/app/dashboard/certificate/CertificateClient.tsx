'use client'

import { useMemo, useRef } from 'react'
import { Award, Download, Printer, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Props = {
  certificateId: string
  name: string
  courseTitle: string
  issueDate: string
  progressPct: number
  verificationCode: string
}

export default function CertificateClient({
  certificateId,
  name,
  courseTitle,
  issueDate,
  progressPct,
  verificationCode,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  const sanitizedName = useMemo(() => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), [name])

  const downloadCertificate = () => {
    const svg = svgRef.current
    if (!svg) return

    const serializer = new XMLSerializer()
    const svgText = serializer.serializeToString(svg)
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${sanitizedName || 'certificate'}-${certificateId}.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success('Certificate downloaded')
  }

  const printCertificate = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-dark-900 px-4 py-8">
      <div className="max-w-6xl mx-auto print:max-w-none">
        <div className="flex items-center gap-3 mb-6 print:hidden">
          <Link href="/dashboard" className="text-dark-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Award className="text-brand-400" size={24} />
              Certificate Generator
            </h1>
            <p className="text-dark-400 text-sm mt-1">Download or print your completion certificate</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start print:block">
          <div className="card overflow-hidden bg-[#07111f] border border-white/10 shadow-2xl print:shadow-none print:border-0 print:bg-white">
            <svg
              ref={svgRef}
              viewBox="0 0 1200 850"
              className="w-full h-auto block"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="certBg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#08111f" />
                  <stop offset="100%" stopColor="#0d1f33" />
                </linearGradient>
                <linearGradient id="certAccent" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>

              <rect width="1200" height="850" fill="url(#certBg)" />
              <rect x="42" y="42" width="1116" height="766" rx="28" fill="none" stroke="rgba(251,191,36,0.35)" strokeWidth="2" />
              <rect x="58" y="58" width="1084" height="734" rx="24" fill="none" stroke="rgba(255,255,255,0.08)" />

              <circle cx="130" cy="130" r="70" fill="rgba(245,158,11,0.08)" />
              <circle cx="1075" cy="710" r="110" fill="rgba(245,158,11,0.08)" />

              <text x="600" y="150" textAnchor="middle" fill="#fbbf24" fontSize="22" letterSpacing="6" fontWeight="700">
                AI FOR BEGINNERS
              </text>
              <text x="600" y="230" textAnchor="middle" fill="#ffffff" fontSize="56" fontWeight="800">
                Certificate of Completion
              </text>
              <text x="600" y="275" textAnchor="middle" fill="#94a3b8" fontSize="22">
                This is awarded to
              </text>
              <text x="600" y="360" textAnchor="middle" fill="#ffffff" fontSize="48" fontWeight="700">
                {name}
              </text>
              <line x1="240" y1="390" x2="960" y2="390" stroke="rgba(251,191,36,0.35)" strokeWidth="2" />
              <text x="600" y="455" textAnchor="middle" fill="#cbd5e1" fontSize="24">
                for successfully completing
              </text>
              <text x="600" y="520" textAnchor="middle" fill="#ffffff" fontSize="40" fontWeight="700">
                {courseTitle}
              </text>
              <text x="600" y="570" textAnchor="middle" fill="#94a3b8" fontSize="20">
                and submitting a verified capstone project
              </text>

              <rect x="260" y="620" width="680" height="88" rx="18" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" />
              <text x="320" y="655" fill="#f8fafc" fontSize="18" fontWeight="700">
                Certificate ID
              </text>
              <text x="320" y="688" fill="#fbbf24" fontSize="28" fontWeight="800">
                {certificateId}
              </text>

              <text x="885" y="655" fill="#f8fafc" fontSize="18" fontWeight="700" textAnchor="end">
                Issue Date
              </text>
              <text x="885" y="688" fill="#cbd5e1" fontSize="24" textAnchor="end">
                {issueDate}
              </text>

              <g transform="translate(120, 740)">
                <text x="0" y="0" fill="#f8fafc" fontSize="16" fontWeight="700">
                  Verification Code
                </text>
                <text x="0" y="28" fill="#94a3b8" fontSize="16">
                  {verificationCode}
                </text>
              </g>

              <g transform="translate(850, 735)">
                <circle cx="0" cy="0" r="36" fill="rgba(245,158,11,0.12)" stroke="rgba(251,191,36,0.45)" />
                <text x="0" y="9" textAnchor="middle" fill="#fbbf24" fontSize="20" fontWeight="800">
                  {progressPct}%
                </text>
                <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="12">
                  completion
                </text>
              </g>
            </svg>
          </div>

          <div className="space-y-4 print:hidden">
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-400" />
                Certificate Details
              </h2>
              <p className="text-dark-300 text-sm mb-4">
                Your certificate is ready as a vector SVG. You can download it, print it, or share the verification code.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-dark-400">Learner</span>
                  <span className="text-white text-right">{name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-dark-400">Course</span>
                  <span className="text-white text-right">{courseTitle}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-dark-400">Certificate ID</span>
                  <span className="text-white text-right">{certificateId}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-dark-400">Verification</span>
                  <span className="text-white text-right break-all">{verificationCode}</span>
                </div>
              </div>
            </div>

            <button onClick={downloadCertificate} className="btn-primary w-full">
              <Download size={18} /> Download SVG
            </button>
            <button onClick={printCertificate} className="btn-secondary w-full">
              <Printer size={18} /> Print / Save as PDF
            </button>
            <Link href="/dashboard/capstone" className="btn-secondary w-full inline-flex justify-center">
              Improve Capstone
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}