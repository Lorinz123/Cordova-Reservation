export type Role = 'super_admin' | 'barangay_admin' | 'barangay_staff' | 'resident'
export type AuthMode = 'login' | 'register' | 'verify'

export type User = {
  id: string
  fullName: string
  email: string
  role: Role
  barangayId: string | null
  addressLine: string | null
  subdivision: string | null
  postalCode: string | null
  phoneNumber: string | null
}

export type Barangay = { id: string; name: string }

export type BarangayManagementSummary = Barangay & {
  createdAt: string
  adminId: string | null
  adminName: string | null
  adminEmail: string | null
  residentCount: number
  equipmentCount: number
  requestCount: number
}

export type SuperAdminSection = 'overview' | 'barangays' | 'requests' | 'equipment' | 'reports'
export type BarangayAdminSection = 'requests' | 'inventory' | 'calendar' | 'residents' | 'reports'

export type BarangayResident = {
  id: string
  fullName: string
  email: string
  phoneNumber: string | null
  addressLine: string | null
  subdivision: string | null
  postalCode: string | null
  emailVerifiedAt: string | null
  createdAt: string
}

export type Equipment = {
  id: string
  barangayId: string
  barangayName: string
  name: string
  description: string | null
  imageData: string | null
  totalQuantity: number
  createdAt: string
}

export type Reservation = {
  id: string
  equipmentId: string
  equipmentName: string
  barangayId: string
  barangayName: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string | null
  quantity: number
  startsAt: string
  endsAt: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewNote: string | null
  createdAt: string
}

export type PortalNotification = {
  id: string
  reservationId: string | null
  title: string
  message: string
  readAt: string | null
  createdAt: string
}

export type Envelope<T> = { data: T; message?: string }
