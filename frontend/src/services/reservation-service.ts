import { apiRequest } from '../lib/api'
import type { Envelope, Reservation } from '../types/portal'

export async function getReservationsService() {
  const response = await apiRequest<Envelope<Reservation[]>>('/reservations')
  return response.data
}

export function createReservationService(input: { equipmentId: string; quantity: number; startsAt: string; endsAt: string; purpose: string }) {
  return apiRequest('/reservations', { method: 'POST', body: JSON.stringify(input) })
}

export function createReservationBatchService(input: { items: { equipmentId: string; quantity: number }[]; startsAt: string; endsAt: string; purpose: string }) {
  return apiRequest<{ data: { reservationIds: string[] }; message?: string }>('/reservations/batch', { method: 'POST', body: JSON.stringify(input) })
}

export function cancelReservationService(reservationId: string) {
  return apiRequest(`/reservations/${reservationId}/cancel`, { method: 'POST' })
}

export function reviewReservationService(reservationId: string, status: 'approved' | 'rejected') {
  return apiRequest(`/reservations/${reservationId}/review`, { method: 'POST', body: JSON.stringify({ status }) })
}
