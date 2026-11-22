import { useMemo, useState } from 'react'
import type { Reservation } from '../../types/portal'
import { AdminPageTitle, AdminPanel } from '../../components/features/admin/DashboardPrimitives'

const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const keyOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`

export default function BarangayAdminCalendarPage({ reservations }: { reservations: Reservation[] }) {
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))
  const [selectedDay, setSelectedDay] = useState(keyOf(new Date()))
  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1)
    const end = new Date(month.getFullYear(), month.getMonth()+1, 0)
    const calendarStart = new Date(start); calendarStart.setDate(start.getDate()-start.getDay())
    const calendarEnd = new Date(end); calendarEnd.setDate(end.getDate()+(6-end.getDay()))
    const result: Date[] = []
    for (const d = new Date(calendarStart); d <= calendarEnd; d.setDate(d.getDate()+1)) result.push(new Date(d))
    return result
  }, [month])
  const dayEvents = (date: Date) => reservations.filter((item) => {
    if (!['pending','approved'].includes(item.status)) return false
    const day = keyOf(date)
    return keyOf(new Date(item.startsAt)) <= day && keyOf(new Date(item.endsAt)) >= day
  })
  const selectedEvents = reservations.filter((item) => keyOf(new Date(item.startsAt)) <= selectedDay && keyOf(new Date(item.endsAt)) >= selectedDay && ['pending','approved'].includes(item.status)).sort((a,b) => Date.parse(a.startsAt)-Date.parse(b.startsAt))
  const monthName = month.toLocaleDateString(undefined,{month:'long',year:'numeric'})
  return <>
    <AdminPageTitle eyebrow="Barangay administration" title="Calendar" subtitle="See approved and pending reservations scheduled for your barangay." />
    <AdminPanel title={monthName} action={<div className="flex gap-1"><button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="grid h-8 w-8 place-items-center rounded border border-[#ded6ca]">‹</button><button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="grid h-8 w-8 place-items-center rounded border border-[#ded6ca]">›</button></div>}>
      <div className="grid grid-cols-7 border-l border-t border-[#e7ddce]">{weekdays.map((day) => <div key={day} className="border-b border-r border-[#e7ddce] bg-[#f7efe3] py-2 text-center text-[9px] font-semibold text-[#656b78]">{day}</div>)}{days.map((date) => { const events = dayEvents(date); const key = keyOf(date); const currentMonth = date.getMonth() === month.getMonth(); return <button type="button" key={key} onClick={() => setSelectedDay(key)} className={`min-h-[78px] border-b border-r border-[#e7ddce] p-1.5 text-left transition sm:min-h-[105px] ${!currentMonth?'bg-[#faf7f0] text-[#b1b1b1]':'bg-[#fffaf2]'} ${selectedDay===key?'ring-2 ring-inset ring-[#900000]':''}`}><span className={`mb-1 grid h-5 w-5 place-items-center rounded-full text-[9px] ${key===keyOf(new Date())?'bg-[#000c26] text-white':'text-[#42495a]'}`}>{date.getDate()}</span><div className="space-y-1">{events.slice(0,2).map((event) => <span key={event.id} className={`block truncate rounded px-1 py-0.5 text-[8px] font-medium ${event.status==='approved'?'bg-blue-100 text-blue-800':'bg-amber-100 text-amber-900'}`}>{event.equipmentName} · {event.requesterName}</span>)}{events.length>2&&<span className="block text-[8px] text-[#757b86]">+{events.length-2} more</span>}</div></button>})}</div>
      <div className="mt-4 flex gap-4 text-[9px] text-[#656b78]"><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400"/>Pending</span><span><i className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-500"/>Approved</span></div>
    </AdminPanel>
    <div className="mt-5"><AdminPanel title={new Date(`${selectedDay}T12:00:00`).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}>{selectedEvents.length?<div className="divide-y divide-[#eee6da]">{selectedEvents.map((item)=><div key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="text-xs font-semibold">{item.equipmentName} · {item.requesterName}</p><p className="mt-1 text-[10px] text-[#777d88]">{new Date(item.startsAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}–{new Date(item.endsAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})} · {item.quantity} unit(s)</p></div><span className="rounded-full bg-[#f3e6c3] px-2 py-1 text-[9px] font-semibold capitalize">{item.status}</span></div>)}</div>:<p className="text-xs text-[#858892]">No reservations scheduled for this day.</p>}</AdminPanel></div>
  </>
}
