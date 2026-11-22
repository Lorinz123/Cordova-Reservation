import type { FormEvent } from 'react'
import type { Barangay, User } from '../../types/portal'
import ActionButton from '../../components/ui/ActionButton'

const inputClass = 'min-h-12 w-full rounded-lg border border-[#dcd8d0] bg-white px-3 py-2 text-sm font-normal text-[#172239] shadow-sm outline-none transition focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/10'
const fixedInputClass = 'min-h-12 w-full cursor-not-allowed rounded-lg border border-[#dedbd5] bg-[#f3f1ed] px-3 py-2 text-sm font-normal text-[#747988]'

export default function ProfilePage({ user, barangays, busy, onSave }: { user: User; barangays: Barangay[]; busy: boolean; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  const barangayName = barangays.find((item) => item.id === user.barangayId)?.name || ''

  return <section className="mx-auto w-full max-w-3xl">
    <p className="mb-3 text-[10px] font-bold tracking-[1.35px] text-[#900000]">YOUR ACCOUNT</p>
    <h1 className="mb-2 font-serif text-4xl font-semibold text-[#000c26]">Profile</h1>
    <p className="mb-7 text-sm text-[#626a79]">Keep your contact and address details current. A complete home address is required before you can request equipment.</p>
    <form className="space-y-6 rounded-2xl border border-[#e9e1d6] bg-white p-5 shadow-sm shadow-[#312515]/[0.04] sm:p-7" onSubmit={onSave}>
      <section className="space-y-4" aria-labelledby="personal-details-title">
        <div className="border-b border-[#eee9e1] pb-3"><h2 id="personal-details-title" className="font-serif text-xl font-semibold text-[#172239]">Personal details</h2><p className="mt-1 text-xs text-[#747988]">Email is kept read-only to protect your verified sign-in address.</p></div>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Full name *<input className={inputClass} name="fullName" defaultValue={user.fullName} minLength={2} maxLength={120} required /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Email address<input className={fixedInputClass} value={user.email} readOnly /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Phone number<input className={inputClass} name="phoneNumber" type="tel" defaultValue={user.phoneNumber || ''} placeholder="e.g. 09171234567" maxLength={24} pattern="[+]?[0-9 ()-]{7,24}" /><span className="text-xs font-normal text-[#747988]">Optional contact number for reservation questions.</span></label>
      </section>

      <section className="space-y-4" aria-labelledby="home-address-title">
        <div className="border-b border-[#eee9e1] pb-3"><h2 id="home-address-title" className="font-serif text-xl font-semibold text-[#172239]">Home address</h2><p className="mt-1 text-xs text-[#747988]">Your address is used for reservation requests. Municipality and country are fixed for this portal.</p></div>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">House / unit / block / lot and street *<input className={inputClass} name="addressLine" defaultValue={user.addressLine || ''} placeholder="e.g. Blk 2 Lot 4, Rizal Street" maxLength={200} required /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Subdivision / village <input className={inputClass} name="subdivision" defaultValue={user.subdivision || ''} placeholder="Optional" maxLength={120} /></label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Barangay *
            {user.role === 'resident' && !user.barangayId
              ? <select className={inputClass} name="barangayId" defaultValue="" required><option value="" disabled>Select your barangay</option>{barangays.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
              : <input className={fixedInputClass} value={barangayName || 'Not assigned'} readOnly />}
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Postal code<input className={inputClass} name="postalCode" inputMode="numeric" defaultValue={user.postalCode || ''} placeholder="e.g. 6017" maxLength={4} pattern="[0-9]{4}" /></label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Municipality<input className={fixedInputClass} value="Cordova" readOnly /></label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b]">Province<input className={fixedInputClass} value="Cebu" readOnly /></label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-[#30394b] sm:col-span-2">Country<input className={fixedInputClass} value="Philippines" readOnly /></label>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eee9e1] pt-4"><p className="text-xs text-[#747988]">Account type: <span className="font-semibold capitalize text-[#30394b]">{user.role.replaceAll('_', ' ')}</span></p><ActionButton type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</ActionButton></div>
    </form>
  </section>
}
