import type { FormEvent } from 'react'
import AuthForm from './AuthForm'
import municipalitySeal from '../../../assets/figma/raw-image-2.png'
import loginBackground from '../../../assets/figma/login-background.png'
import type { AuthMode, Barangay } from '../../../types/portal'

type AuthPageProps = {
  mode: AuthMode
  barangays: Barangay[]
  error: string
  notice: string
  busy: boolean
  onModeChange: (mode: AuthMode) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function AuthPage({ mode, barangays, error, notice, busy, onModeChange, onSubmit }: AuthPageProps) {
  const titles = { login: 'Welcome back', register: 'Create your resident account', verify: 'Resend verification email' }
  return <div className="relative flex min-h-screen w-full flex-col justify-center overflow-hidden px-5 py-10">
    <img className="absolute inset-0 h-full w-full object-cover" src={loginBackground} alt="" />
    <div className="absolute inset-0 bg-gradient-to-br from-[#000c26]/80 via-[#000c26]/55 to-[#000c26]/70" />
    <div className="relative mx-auto w-full max-w-[1200px]">
      <div className="mb-8 flex items-center gap-3 text-[#fff5e6] sm:mb-10">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-lg backdrop-blur"><img className="h-full w-full object-contain" src={municipalitySeal} alt="" /></span>
        <span className="flex flex-col gap-1"><strong className="font-serif text-xl font-semibold">Municipality of Cordova</strong><small className="text-xs text-[#f4eadb]">Barangay Reservation Portal</small></span>
      </div>
      <section className="mx-auto w-full max-w-[460px] rounded-3xl border border-white/75 bg-[#fffaf2]/95 p-6 shadow-[0_30px_90px_rgba(0,12,38,.3)] backdrop-blur-xl sm:p-10" aria-labelledby="auth-title">
      <p className="mb-3 text-[10px] font-bold tracking-[1.35px] text-[#900000]">CORDOVA RESERVATION PORTAL</p>
      <h1 id="auth-title" className="mb-3 text-center font-serif text-3xl font-semibold text-[#000c26]">{titles[mode]}</h1>
      <p className="mb-6 text-center text-sm leading-relaxed text-[#626a79]">{mode === 'login' ? 'Sign in to your barangay portal.' : mode === 'register' ? 'Create an account to request equipment from your barangay.' : 'Enter the email address you registered with and we’ll send a fresh verification link if needed.'}</p>
      {error && <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800" role="alert">{error}</div>}
      {notice && <div className="mb-4 rounded border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-800" role="status">{notice}</div>}
      <AuthForm mode={mode} barangays={barangays} busy={busy} onModeChange={onModeChange} onSubmit={onSubmit} />
      </section>
    </div>
  </div>
}
