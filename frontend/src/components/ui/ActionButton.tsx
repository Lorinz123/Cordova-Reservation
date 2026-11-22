import type { ButtonHTMLAttributes } from 'react'

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function ActionButton({ variant = 'primary', className = '', ...props }: ActionButtonProps) {
  const variantClass = variant === 'primary'
    ? 'border-[#000c26] bg-[#000c26] text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#263751] hover:shadow-md active:translate-y-0'
    : variant === 'secondary'
      ? 'border-[#d8d1c5] bg-white text-[#172239] shadow-sm hover:-translate-y-0.5 hover:border-[#900000]/50 hover:text-[#900000] hover:shadow-md active:translate-y-0'
      : 'border-red-200 bg-white text-red-800 shadow-sm hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md active:translate-y-0'
  return <button {...props} className={`inline-flex min-h-11 items-center justify-center rounded-lg border px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-55 ${variantClass} ${className}`.trim()} />
}
