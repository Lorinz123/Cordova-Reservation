import type { Reservation } from '../../../types/portal'
import ActionButton from '../../ui/ActionButton'

type ReservationListProps = {
  title: string
  subtitle: string
  reservations: Reservation[]
  busy: boolean
  canReview?: boolean
  onCancel?: (id: string) => void
  onReview?: (id: string, status: 'approved' | 'rejected') => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export default function ReservationList({ title, subtitle, reservations, busy, canReview, onCancel, onReview }: ReservationListProps) {
  return <section className="w-full">
    <div className="mb-7"><p className="mb-3 text-[10px] font-bold tracking-[1.35px] text-[#900000]">RESERVATION ACTIVITY</p><h1 className="mb-2 font-serif text-4xl font-semibold tracking-tight text-[#000c26]">{title}</h1><p className="text-sm text-[#626a79]">{subtitle}</p></div>
    {busy && <p className="text-sm text-[#747988]">Loading reservation details…</p>}
    {!busy && reservations.length === 0 && <div className="flex min-h-[275px] flex-col items-center justify-center rounded-md border border-[#e9e1d6] bg-white p-8 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#faf2e7] text-xl" aria-hidden="true">⌂</div><h2 className="mb-2 font-serif text-lg font-semibold text-[#172239]">No reservations yet</h2><p className="text-sm text-[#747988]">Reservation requests will appear here after they are submitted.</p></div>}
    <div className="flex flex-col gap-3">{reservations.map((reservation) => <article className="rounded-md border border-[#e9e1d6] bg-white p-5 sm:p-6" key={reservation.id}>
      <div className="flex flex-wrap justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#900000]">{reservation.barangayName} · {reservation.equipmentName}</p><h2 className="font-serif text-lg font-semibold text-[#172239]">{reservation.requesterName}</h2></div><span className={`self-start rounded-full px-3 py-1.5 text-xs font-bold capitalize ${reservation.status === 'approved' ? 'bg-green-100 text-green-800' : reservation.status === 'rejected' || reservation.status === 'cancelled' ? 'bg-red-50 text-red-800' : 'bg-amber-100 text-amber-900'}`}>{reservation.status}</span></div>
      <div className="mt-5 grid grid-cols-1 gap-4 text-xs text-[#666d7b] sm:grid-cols-2 lg:grid-cols-4"><span className="flex flex-col gap-1"><strong className="text-[10px] uppercase text-[#313b4e]">When</strong>{formatDate(reservation.startsAt)} – {formatDate(reservation.endsAt)}</span><span className="flex flex-col gap-1"><strong className="text-[10px] uppercase text-[#313b4e]">Quantity</strong>{reservation.quantity}</span><span className="flex flex-col gap-1"><strong className="text-[10px] uppercase text-[#313b4e]">Purpose</strong>{reservation.purpose}</span>{canReview && <span className="flex flex-col gap-1"><strong className="text-[10px] uppercase text-[#313b4e]">Contact</strong>{reservation.requesterEmail}{reservation.requesterPhone && <span>{reservation.requesterPhone}</span>}</span>}</div>
      {reservation.reviewNote && <p className="mt-4 bg-[#faf7f2] p-3 text-xs text-[#5e6573]">Note: {reservation.reviewNote}</p>}
      <div className="mt-4 flex flex-wrap gap-2">{canReview && reservation.status === 'pending' && <><ActionButton type="button" onClick={() => onReview?.(reservation.id, 'approved')}>Approve request</ActionButton><ActionButton variant="danger" type="button" onClick={() => onReview?.(reservation.id, 'rejected')}>Decline</ActionButton></>}{!canReview && reservation.status === 'pending' && onCancel && <ActionButton variant="danger" type="button" onClick={() => onCancel(reservation.id)}>Cancel request</ActionButton>}</div>
    </article>)}</div>
  </section>
}
