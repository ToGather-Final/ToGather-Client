import { ButtonHTMLAttributes } from "react"

interface MainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export default function MainButton({ 
  children, 
  className = "", 
  disabled = false,
  ...props 
}: MainButtonProps) {
  return (
    <button
      className={`w-full h-14 text-white text-base font-medium rounded-3xl transition-all shadow-lg ${
        disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-[#4078FF] to-[#6A89D4] hover:opacity-90'
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
