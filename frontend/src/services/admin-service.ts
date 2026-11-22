import { apiRequest } from '../lib/api'

export function inviteBarangayAdminService(input: { fullName: string; email: string; barangayId: string }) {
  return apiRequest<{ message: string }>('/admin-invitations', { method: 'POST', body: JSON.stringify(input) })
}
