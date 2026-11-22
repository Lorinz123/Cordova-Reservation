import ReservationList from '../../components/features/reservations/ReservationList'
import type { Reservation, Role } from '../../types/portal'

export default function ReservationRequestsPage({ reservations, loading, role, onReview }: { reservations: Reservation[]; loading: boolean; role: Role; onReview: (id: string, status: 'approved' | 'rejected') => void }) {
  const isSuperAdmin = role === 'super_admin'
  return <ReservationList title={isSuperAdmin ? 'All reservations' : 'Reservation requests'} subtitle={isSuperAdmin ? 'Reservation activity across all barangays.' : 'Review requests submitted to your barangay.'} reservations={reservations} busy={loading} canReview onReview={onReview} />
}
