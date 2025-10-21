import Image from 'next/image'

interface LogoProps {
  variant?: 'white' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Logo({
  variant = 'blue',
  size = 'md',
  className = ''
}: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }

  const logoSrc = variant === 'white' ? '/images/logo-white.webp' : '/images/logo-blue.webp'

  return (
    <Image
      src={logoSrc}
      alt="ToGather Logo"
      width={64}
      height={64}
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  )
}