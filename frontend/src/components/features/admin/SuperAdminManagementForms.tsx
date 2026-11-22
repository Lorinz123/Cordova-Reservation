import type { FormEvent } from 'react'
import type { Barangay } from '../../../types/portal'
import ActionButton from '../../ui/ActionButton'

type SuperAdminManagementFormsProps = {
  barangays: Barangay[]
  busy: boolean
  onCreateBarangay: (event: FormEvent<HTMLFormElement>) => void
  onInviteAdmin: (event: FormEvent<HTMLFormElement>) => void
}

export default function SuperAdminManagementForms({ barangays, busy, onCreateBarangay, onInviteAdmin }: SuperAdminManagementFormsProps) {
  return <>
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
      <form className="flex flex-col gap-4 rounded-md border border-[#e9e1d6] bg-white p-5 sm:p-6" onSubmit={onCreateBarangay}><div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#900000]">COMMUNITY SETUP</p><h2 className="font-serif text-xl font-semibold text-[#172239]">Add a barangay</h2></div><label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Barangay name<input className="min-h-11 rounded border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal" name="name" minLength={2} maxLength={120} required placeholder="e.g. Day-as" /></label><ActionButton type="submit" disabled={busy}>Add barangay</ActionButton></form>
      <form className="flex flex-col gap-4 rounded-md border border-[#e9e1d6] bg-white p-5 sm:p-6" onSubmit={onInviteAdmin}><div><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#900000]">ADMIN INVITATION</p><h2 className="font-serif text-xl font-semibold text-[#172239]">Invite a barangay admin</h2></div><label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Barangay<select className="min-h-11 rounded border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal" name="barangayId" required defaultValue=""><option value="" disabled>Select a barangay</option>{barangays.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Resident’s full name<input className="min-h-11 rounded border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal" name="fullName" minLength={2} maxLength={120} required /></label><label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Resident’s account email<input className="min-h-11 rounded border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal" name="email" type="email" required /></label><p className="text-xs leading-relaxed text-[#767b86]">The name and email must match a registered resident account. They’ll receive an email and accept the invitation to become the barangay admin.</p><ActionButton type="submit" disabled={busy || barangays.length === 0}>Send invitation</ActionButton></form>
    </div>
    <div className="mt-7"><h2 className="mb-3 font-serif text-xl font-semibold text-[#172239]">Barangays</h2><div className="overflow-hidden rounded-md border border-[#e9e1d6] bg-white">{barangays.map((item) => <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9e1d6] px-4 py-3 text-sm text-[#30394b] last:border-b-0" key={item.id}><span>{item.name}</span><span className="text-[10px] font-bold uppercase tracking-wide text-[#8b8d93]">Available for admin assignment</span></div>)}</div></div>
  </>
}
