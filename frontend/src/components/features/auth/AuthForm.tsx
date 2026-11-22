import { useState, type FormEvent } from 'react'
import type { AuthMode, Barangay } from '../../../types/portal'
import ActionButton from '../../ui/ActionButton'

type AuthFormProps = {
  mode: AuthMode
  barangays: Barangay[]
  busy: boolean
  onModeChange: (mode: AuthMode) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function AuthForm({ mode, barangays, busy, onModeChange, onSubmit }: AuthFormProps) {
  const [validationMessage, setValidationMessage] = useState('')
  const [passwordVisible, setPasswordVisible] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const missing: string[] = []
    const fullName = String(values.get('fullName') || '').trim()
    const email = String(values.get('email') || '').trim()
    const password = String(values.get('password') || '')
    const barangayId = String(values.get('barangayId') || '')

    if (mode === 'register' && !fullName) missing.push('full name')
    if (mode === 'register' && !barangayId) missing.push('barangay')
    if (!email) missing.push('email address')
    if (mode !== 'verify' && !password) missing.push('password')

    if (missing.length) {
      setValidationMessage(`Please fill in your ${missing.join(' and ')}.`)
      return
    }
    if (mode === 'register' && fullName.length < 2) {
      setValidationMessage('Please enter a full name with at least 2 characters.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationMessage('Please enter a valid email address.')
      return
    }
    if (mode !== 'verify' && password.length < 8) {
      setValidationMessage('Your password must be at least 8 characters long.')
      return
    }

    setValidationMessage('')
    onSubmit(event)
  }

  return <>
    <form noValidate onSubmit={handleSubmit} onChange={() => setValidationMessage('')} className="flex flex-col gap-4">
      {mode === 'register' && <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Full name<input className="min-h-12 w-full rounded-lg border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal text-[#172239] shadow-sm outline-none transition placeholder:text-[#9a9ca3] focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/10" name="fullName" autoComplete="name" minLength={2} maxLength={120} placeholder="Your first and last name" /></label>}
      <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Email address<input className="min-h-12 w-full rounded-lg border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal text-[#172239] shadow-sm outline-none transition placeholder:text-[#9a9ca3] focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/10" name="email" type="email" autoComplete="email" placeholder="you@example.com" /></label>
      {mode !== 'verify' && <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Password<div className="relative"><input className="min-h-12 w-full rounded-lg border border-[#dcd8d0] bg-white py-2 pl-3 pr-12 text-sm font-normal text-[#172239] shadow-sm outline-none transition focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/10" name="password" type={passwordVisible ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={8} maxLength={72} placeholder="Enter your password" /><button className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-lg text-[#697184] hover:text-[#900000] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#900000]" type="button" aria-label={passwordVisible ? 'Password is visible; release to hide' : 'Hold to show password'} aria-pressed={passwordVisible} onPointerDown={(event) => { event.preventDefault(); setPasswordVisible(true) }} onPointerUp={() => setPasswordVisible(false)} onPointerCancel={() => setPasswordVisible(false)} onPointerLeave={() => setPasswordVisible(false)} onContextMenu={(event) => event.preventDefault()}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">{passwordVisible ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 002.8 2.8" /><path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.2-2.3 3.2M6.2 6.2C3.9 7.7 2.8 10 2.5 12c.6 1.6 3.9 7 9.5 7 1 0 1.9-.2 2.8-.5" /></> : <><path d="M2.5 12S6 5 12 5s9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" /><circle cx="12" cy="12" r="2.5" /></>}</svg></button></div></label>}
      {mode === 'register' && <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Barangay *<select className="min-h-12 w-full rounded-lg border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal text-[#172239] shadow-sm outline-none transition focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/10" name="barangayId" defaultValue=""><option value="">Select your barangay</option>{barangays.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      {validationMessage && <div className="rounded border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-800" role="alert">{validationMessage}</div>}
      <ActionButton type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send verification email'}</ActionButton>
    </form>
    <div className="mt-5 flex flex-wrap justify-between gap-3">
      {mode === 'login' && <><button className="text-left text-xs text-[#900000] hover:underline" type="button" onClick={() => onModeChange('register')}>Create a resident account</button><button className="text-left text-xs text-[#900000] hover:underline" type="button" onClick={() => onModeChange('verify')}>Resend email verification</button></>}
      {mode !== 'login' && <button className="text-left text-xs text-[#900000] hover:underline" type="button" onClick={() => onModeChange('login')}>Back to sign in</button>}
      {mode === 'register' && <button className="text-left text-xs text-[#900000] hover:underline" type="button" onClick={() => onModeChange('verify')}>Already registered? Verify email</button>}
    </div>
  </>
}
