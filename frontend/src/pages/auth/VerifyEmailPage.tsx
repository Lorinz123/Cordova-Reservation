import type { FormEvent } from 'react'
import AuthPanel from '../../components/features/auth/AuthPanel'
import type { AuthMode, Barangay } from '../../types/portal'

type VerifyEmailPageProps = { barangays: Barangay[]; error: string; notice: string; busy: boolean; onModeChange: (mode: AuthMode) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }

export default function VerifyEmailPage(props: VerifyEmailPageProps) {
  return <AuthPanel {...props} mode="verify" onModeChange={props.onModeChange} />
}
