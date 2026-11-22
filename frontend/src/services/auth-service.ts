import { apiRequest } from '../lib/api'
import type { Envelope, User } from '../types/portal'

export function getCurrentUserService() {
  return apiRequest<Envelope<User>>('/auth/me')
}

export function loginService(email: string, password: string) {
  return apiRequest<Envelope<User>>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

export function registerService(input: { fullName: string; email: string; password: string; barangayId: string }) {
  return apiRequest<Envelope<User>>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
}

export function resendVerificationEmailService(email: string) {
  return apiRequest<{ message: string }>('/auth/verification/resend', { method: 'POST', body: JSON.stringify({ email }) })
}

export function logoutService() {
  return apiRequest('/auth/logout', { method: 'POST' })
}
