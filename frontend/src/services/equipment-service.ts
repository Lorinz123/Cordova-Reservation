import { apiRequest } from '../lib/api'
import type { Equipment, Envelope } from '../types/portal'

export async function getEquipmentService() {
  const response = await apiRequest<Envelope<Equipment[]>>('/equipment')
  return response.data
}

export function createEquipmentService(input: { name: string; description?: string; totalQuantity: number; imageData: string }) {
  return apiRequest('/equipment', { method: 'POST', body: JSON.stringify(input) })
}


export function updateEquipmentService(id: string, input: { name: string; description?: string; totalQuantity: number; imageData?: string }) {
  return apiRequest(`/equipment/${id}`, { method: 'PATCH', body: JSON.stringify(input) })
}

export function deleteEquipmentService(id: string) {
  return apiRequest(`/equipment/${id}`, { method: 'DELETE' })
}
