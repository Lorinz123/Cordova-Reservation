import { apiRequest } from '../lib/api'
import type { Envelope, PortalNotification } from '../types/portal'

export async function getNotificationsService() {
  const response = await apiRequest<Envelope<PortalNotification[]>>('/notifications')
  return response.data
}

export function markNotificationsReadService() {
  return apiRequest('/notifications/read-all', { method: 'POST' })
}
