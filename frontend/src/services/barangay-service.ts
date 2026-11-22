import { apiRequest } from '../lib/api'
import type { Barangay, BarangayManagementSummary, Envelope } from '../types/portal'

export async function getBarangaysService() {
  const response = await apiRequest<Envelope<Barangay[]>>('/barangays')
  return response.data
}

export async function getBarangayManagementService() {
  const response = await apiRequest<Envelope<BarangayManagementSummary[]>>('/barangays/management')
  return response.data
}

export function createBarangayService(name: string) {
  return apiRequest('/barangays', { method: 'POST', body: JSON.stringify({ name }) })
}
