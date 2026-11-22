import { createContext } from 'react'
import type { User } from '../../types/portal'

export type AuthContextValue = {
  user: User | null
  setUser: (user: User | null) => void
  ready: boolean
  sessionError: string
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
