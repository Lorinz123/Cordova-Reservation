import type { FormEvent } from 'react'
import AuthPanel from '../../components/features/auth/AuthPanel'
import type { AuthMode, Barangay } from '../../types/portal'

type SignupPageProps = { barangays: Barangay[]; error: string; notice: string; busy: boolean; onModeChange: (mode: AuthMode) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }

export default function SignupPage(props: SignupPageProps) {
  return <AuthPanel {...props} mode="register" onModeChange={props.onModeChange} />
}
