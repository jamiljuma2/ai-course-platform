import { createHash } from 'crypto'

export type CertificateStatus = 'locked' | 'ready' | 'issued'

export function buildCertificateId(userId: string, courseId: string) {
  const digest = createHash('sha256').update(`${userId}:${courseId}`).digest('hex').slice(0, 10).toUpperCase()
  return `AIB-${digest}`
}

export function getCertificateStatus(progressPct: number, capstoneStatus?: string | null): CertificateStatus {
  if (progressPct >= 80 && (capstoneStatus === 'submitted' || capstoneStatus === 'approved')) {
    return 'ready'
  }

  return 'locked'
}

export function formatCertificateDate(isoDate?: string | null) {
  const date = isoDate ? new Date(isoDate) : new Date()
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}