import { ButtonHTMLAttributes } from "react"

interface MainButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary'
}

export default function MainButton({ 
  children, 
  className = "", 
  disabled = false,
  variant = 'primary',
  ...props 
}: MainButtonProps) {
  const base = 'w-full h-14 text-base font-medium rounded-3xl transition-all shadow-lg';
  const primaryEnabled = 'text-white bg-gradient-to-r from-[#4078FF] to-[#6A89D4] hover:opacity-90';
  const secondaryEnabled = 'text-gray-700 bg-gray-100 hover:bg-gray-200';
  const disabledCls = 'cursor-not-allowed bg-gray-400 text-white';

  const variantEnabled = variant === 'secondary' ? secondaryEnabled : primaryEnabled;

  return (
    <button
      className={`${base} ${disabled ? disabledCls : variantEnabled} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
