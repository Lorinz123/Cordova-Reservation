import { useState, type FormEvent } from 'react'
import type { Equipment, User } from '../../../types/portal'
import ActionButton from '../../ui/ActionButton'
import EquipmentImage from '../equipment/EquipmentImage'

type ReservationFormProps = {
  equipment: Equipment[]
  user: User
  busy: boolean
  onBack: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function localDateValue(daysAhead = 0) {
  const now = new Date()
  return localDateValueFromDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead))
}
function localDateValueFromDate(date: Date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}` }
function datePlusDays(date: string, days: number) { const [year,month,day]=date.split('-').map(Number); return localDateValueFromDate(new Date(year,month-1,day+days)) }

export default function ReservationForm({ equipment, user, busy, onBack, onSubmit }: ReservationFormProps) {
  const [startsAtDate, setStartsAtDate] = useState(localDateValue(7))
  const [endsAtDate, setEndsAtDate] = useState(localDateValue(7))
  const earliestStartDate = localDateValue(7)
  const latestEndDate = datePlusDays(startsAtDate,14)
  const barangayName = equipment[0]?.barangayName ?? 'your barangay'
  return <section className="mx-auto w-full max-w-6xl">
    <button className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#900000] hover:underline" type="button" onClick={onBack}>← Back to equipment</button>
    <div className="mb-6"><p className="mb-2 text-[10px] font-bold tracking-[1.35px] text-[#900000]">RESERVATION REQUEST</p><h1 className="mb-2 font-serif text-3xl font-semibold text-[#000c26] sm:text-4xl">Review your request</h1><p className="text-sm text-[#626a79]">Send up to three equipment items together to {barangayName} for review.</p></div>
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
      <form className="space-y-5" onSubmit={onSubmit}>
        <section className="rounded-md border border-[#e9e1d6] bg-white p-5 sm:p-6" aria-labelledby="reservation-information-title"><div className="mb-5 border-b border-[#eee9e1] pb-3"><h2 id="reservation-information-title" className="font-serif text-xl font-semibold text-[#172239]">Equipment and schedule</h2><p className="mt-1 text-xs text-[#747988]">The start date must be at least 7 days away. The end date can be up to 14 days after it.</p></div>
          <div className="mb-5 divide-y divide-[#eee9e1]">{equipment.map((item,index)=><div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0" key={item.id}><div className="flex items-center gap-3"><span className="grid h-12 w-14 place-items-center overflow-hidden rounded bg-[#fff5e6]"><EquipmentImage imageData={item.imageData} alt={item.name} className="h-full w-full object-cover"/></span><div><p className="text-xs font-semibold text-[#172239]">{item.name}</p><p className="mt-1 text-[10px] text-[#747988]">{item.barangayName} · {item.totalQuantity} available</p></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#30394b]">Quantity<input className="h-9 w-20 rounded border border-[#dcd8d0] px-2 text-xs" type="number" name={`quantity-${item.id}`} min={1} max={item.totalQuantity} defaultValue={1} required/><span className="sr-only">Selected item {index+1}</span></label></div>)}</div>
          <div className="grid grid-cols-1 gap-4 border-t border-[#eee9e1] pt-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Start date *<input className="min-h-11 rounded border border-[#dcd8d0] px-3 py-2 text-sm font-normal" type="date" name="startsAtDate" min={earliestStartDate} value={startsAtDate} onChange={(event)=>{const value=event.target.value;const max=datePlusDays(value,14);setStartsAtDate(value);if(endsAtDate<value)setEndsAtDate(value);else if(endsAtDate>max)setEndsAtDate(max)}} required/></label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Start time *<input className="min-h-11 rounded border border-[#dcd8d0] px-3 py-2 text-sm font-normal" type="time" name="startsAtTime" required/></label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">End date *<input className="min-h-11 rounded border border-[#dcd8d0] px-3 py-2 text-sm font-normal" type="date" name="endsAtDate" min={startsAtDate} max={latestEndDate} value={endsAtDate} onChange={(event)=>setEndsAtDate(event.target.value)} required/></label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">End time *<input className="min-h-11 rounded border border-[#dcd8d0] px-3 py-2 text-sm font-normal" type="time" name="endsAtTime" required/></label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b] sm:col-span-2">Event or purpose *<textarea className="min-h-24 rounded border border-[#dcd8d0] px-3 py-2 text-sm font-normal" name="purpose" minLength={5} maxLength={1000} placeholder="Tell the barangay what the equipment will be used for" required/></label>
          </div>
        </section>
        <section className="rounded-md border border-[#e9e1d6] bg-white p-5 sm:p-6"><h2 className="mb-4 font-serif text-xl font-semibold text-[#172239]">Contact information</h2><div className="grid gap-4 sm:grid-cols-3">{[['Full name',user.fullName],['Email address',user.email],['Phone number',user.phoneNumber||'Add a phone number in Profile']].map(([label,value])=><label key={label} className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">{label}<input className="min-h-11 rounded border border-[#dcd8d0] bg-[#f8f5ef] px-3 py-2 text-sm font-normal text-[#172239]" value={value} readOnly/></label>)}</div></section>
        <div className="flex flex-col gap-3 border-t border-[#e9e1d6] pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-relaxed text-[#747988]">Each item can be approved or declined separately. Requests are not confirmed until approved.</p><ActionButton type="submit" disabled={busy} className="shrink-0 border-[#900000] bg-[#900000] hover:bg-[#740000]">{busy?'Sending…':'➤ Send request'}</ActionButton></div>
      </form>
      <aside className="rounded-md border border-[#e9e1d6] bg-white p-5"><h2 className="mb-4 font-serif text-lg font-semibold text-[#172239]">Your request</h2><p className="mb-4 text-xs text-[#626a79]">{equipment.length} equipment item{equipment.length===1?'':'s'} selected</p><ol className="space-y-3 text-xs text-[#424b5d]">{equipment.map((item,i)=><li key={item.id} className="flex gap-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#000c26] text-[10px] font-semibold text-white">{i+1}</span><span>{item.name}</span></li>)}</ol><p className="mt-5 border-t border-[#eee9e1] pt-4 text-[11px] leading-relaxed text-[#747988]">The barangay reviews the schedule and availability for each item. Check My Reservations for updates.</p></aside>
    </div>
  </section>
}
