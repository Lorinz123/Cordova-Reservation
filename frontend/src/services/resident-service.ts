import { apiRequest } from '../lib/api'
import type { BarangayResident, Envelope } from '../types/portal'

export async function getBarangayResidentsService() {
  const response = await apiRequest<Envelope<BarangayResident[]>>('/residents')
  return response.data
}
