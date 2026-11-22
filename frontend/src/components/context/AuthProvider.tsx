import { useEffect, useState, type ReactNode } from 'react'
import { ApiError } from '../../lib/api'
import { getCurrentUserService } from '../../services/auth-service'
import type { User } from '../../types/portal'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    let active = true
    async function restoreSession() {
      try {
        const result = await getCurrentUserService()
        if (active) setUser(result.data)
      } catch (error) {
        if (active && !(error instanceof ApiError && error.status === 401)) {
          setSessionError(error instanceof Error ? error.message : 'Unable to check your sign-in session.')
        }
      } finally {
        if (active) setReady(true)
      }
    }
    void restoreSession()
    return () => { active = false }
  }, [])

  return <AuthContext.Provider value={{ user, setUser, ready, sessionError }}>{children}</AuthContext.Provider>
}
