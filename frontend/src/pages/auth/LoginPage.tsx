import type { FormEvent } from 'react'
import AuthPanel from '../../components/features/auth/AuthPanel'
import type { AuthMode, Barangay } from '../../types/portal'

type LoginPageProps = { barangays: Barangay[]; error: string; notice: string; busy: boolean; onModeChange: (mode: AuthMode) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }

export default function LoginPage(props: LoginPageProps) {
  return <AuthPanel {...props} mode="login" onModeChange={props.onModeChange} />
}
