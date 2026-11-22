import ResidentReservationsList from '../../components/features/reservations/ResidentReservationsList'
import type { Reservation } from '../../types/portal'

export default function MyReservationsPage({ reservations, loading, onCancel }: { reservations: Reservation[]; loading: boolean; onCancel: (id: string) => void }) {
  return <ResidentReservationsList reservations={reservations} loading={loading} onCancel={onCancel} />
}
