import { useMemo, useState } from 'react'
import type { Reservation } from '../../../types/portal'
import ActionButton from '../../ui/ActionButton'

type StatusFilter = 'all' | Reservation['status']

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

const filters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function ResidentReservationsList({ reservations, loading, onCancel }: {
  reservations: Reservation[]
  loading: boolean
  onCancel: (id: string) => void
}) {
  const [status, setStatus] = useState<StatusFilter>('all')
  const visibleReservations = useMemo(
    () => status === 'all' ? reservations : reservations.filter((reservation) => reservation.status === status),
    [reservations, status],
  )
  const pendingCount = reservations.filter((reservation) => reservation.status === 'pending').length
  const approvedCount = reservations.filter((reservation) => reservation.status === 'approved').length

  return <section className="w-full">
    <div className="mb-7">
      <p className="mb-3 text-[10px] font-bold tracking-[1.35px] text-[#900000]">RESERVATION ACTIVITY</p>
      <h1 className="mb-2 font-serif text-4xl font-semibold tracking-tight text-[#000c26]">My reservations</h1>
      <p className="text-sm text-[#626a79]">Track your requests and see what needs your attention.</p>
    </div>

    <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <article className="rounded-2xl border border-[#e9e1d6] bg-white/85 p-5 shadow-sm shadow-[#312515]/[0.04]">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#626a79]">Total requests</p>
        <p className="mt-2 font-serif text-3xl font-semibold text-[#000c26]">{reservations.length}</p>
      </article>
      <article className="rounded-2xl border border-[#e9e1d6] bg-white/85 p-5 shadow-sm shadow-[#312515]/[0.04]">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#626a79]">Awaiting review</p>
        <p className="mt-2 font-serif text-3xl font-semibold text-[#9a6500]">{pendingCount}</p>
      </article>
      <article className="rounded-2xl border border-[#e9e1d6] bg-white/85 p-5 shadow-sm shadow-[#312515]/[0.04]">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#626a79]">Approved</p>
        <p className="mt-2 font-serif text-3xl font-semibold text-[#287044]">{approvedCount}</p>
      </article>
    </div>

    <div className="overflow-hidden rounded-2xl border border-[#e9e1d6] bg-white shadow-sm shadow-[#312515]/[0.04]">
      <div className="flex gap-3 overflow-x-auto border-b border-[#eee9e1] px-4 sm:gap-5 sm:px-5" role="group" aria-label="Filter reservations by status">
        {filters.map((filter) => <button
          key={filter.value}
          type="button"
          aria-pressed={status === filter.value}
          onClick={() => setStatus(filter.value)}
          className={`relative min-h-14 shrink-0 rounded-md px-1 text-xs transition ${status === filter.value ? 'font-semibold text-[#000c26] after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-[#900000]' : 'text-[#707584] hover:text-[#000c26]'}`}
        >{filter.label}{filter.value === 'pending' && pendingCount > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-900">{pendingCount}</span>}</button>)}
      </div>

      {loading
        ? <div className="p-8 text-center text-sm text-[#747988]" role="status">Loading your reservations…</div>
        : visibleReservations.length === 0
          ? <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#faf2e7] text-xl text-[#900000]" aria-hidden="true">⌂</span>
            <h2 className="mb-2 font-serif text-lg font-semibold text-[#172239]">{status === 'all' ? 'No reservation requests yet' : `No ${filterLabel(status).toLowerCase()} requests`}</h2>
            <p className="max-w-sm text-sm leading-relaxed text-[#747988]">{status === 'all' ? 'When you request equipment, you can follow its review status here.' : 'Choose another status filter to see more of your requests.'}</p>
          </div>
          : <div className="divide-y divide-[#eee9e1]">
            {visibleReservations.map((reservation) => <article className="p-5 transition-colors hover:bg-[#fffdfa] sm:p-6" key={reservation.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#900000]">{reservation.barangayName}</p>
                  <h2 className="font-serif text-lg font-semibold text-[#172239]">{reservation.equipmentName}</h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle(reservation.status)}`}>{displayStatus(reservation.status)}</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 text-xs text-[#626a79] sm:grid-cols-3">
                <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#313b4e]">Schedule</p><p>{formatDate(reservation.startsAt)}</p><p>to {formatDate(reservation.endsAt)}</p></div>
                <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#313b4e]">Quantity</p><p>{reservation.quantity}</p></div>
                <div><p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#313b4e]">Purpose</p><p className="leading-relaxed">{reservation.purpose}</p></div>
              </div>

              {reservation.reviewNote && <p className="mt-4 rounded bg-[#faf7f2] p-3 text-xs leading-relaxed text-[#5e6573]"><strong className="text-[#313b4e]">Barangay note:</strong> {reservation.reviewNote}</p>}
              {reservation.status === 'pending' && <div className="mt-4 border-t border-[#eee9e1] pt-4"><ActionButton variant="danger" type="button" onClick={() => onCancel(reservation.id)}>Cancel request</ActionButton></div>}
            </article>)}
          </div>}
    </div>
  </section>
}

function filterLabel(status: StatusFilter) {
  return filters.find((filter) => filter.value === status)?.label ?? 'All requests'
}

function displayStatus(status: Reservation['status']) {
  return status === 'rejected' ? 'Declined' : status
}

function statusStyle(status: Reservation['status']) {
  if (status === 'approved') return 'bg-green-100 text-green-800'
  if (status === 'rejected' || status === 'cancelled') return 'bg-red-50 text-red-800'
  return 'bg-amber-100 text-amber-900'
}
