import Image from 'next/image'

export default function Logo({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <Image
      src="/logo.webp"
      alt=""
      width={1254}
      height={1254}
      className={`shrink-0 object-contain ${className}`}
    />
  )
}
