import { apiRequest } from '../lib/api'
import type { Envelope, User } from '../types/portal'

export function updateProfileService(input: { fullName: string; addressLine: string; subdivision: string; postalCode: string; phoneNumber: string; barangayId?: string }) {
  return apiRequest<Envelope<User>>('/auth/profile', { method: 'PATCH', body: JSON.stringify(input) })
}
