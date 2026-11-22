import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import EquipmentCard from '../../components/features/equipment/EquipmentCard'
import type { Equipment, User } from '../../types/portal'

type EquipmentPageProps = {
  equipment: Equipment[]
  user: User | null
  selectedItems: Equipment[]
  busy: boolean
  onSelect: (item: Equipment) => void
  onContinueReservation: () => void
  onCreateEquipment: (event: FormEvent<HTMLFormElement>) => Promise<string | null>
  onUpdateEquipment: (id: string, input: { name: string; description: string; totalQuantity: number; imageData?: string }) => Promise<string | null>
  onDeleteEquipment: (id: string) => Promise<string | null>
}

const categories = ['All', 'Seating', 'Tables', 'Tents', 'Sounds']
const categoryKeywords: Record<string, string[]> = {
  Seating: ['chair', 'seat'],
  Tables: ['table'],
  Tents: ['tent', 'canopy'],
  Sounds: ['sound', 'speaker', 'audio'],
}

export default function EquipmentPage({ equipment, user, selectedItems, busy, onSelect, onContinueReservation, onCreateEquipment, onUpdateEquipment, onDeleteEquipment }: EquipmentPageProps) {
  const [category, setCategory] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  const [formError, setFormError] = useState('')
  const [editing, setEditing] = useState<Equipment | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  useEffect(() => {
    if (!isAddModalOpen) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !busy) setIsAddModalOpen(false) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isAddModalOpen, busy])
  useEffect(() => { if (imagePreview) return () => URL.revokeObjectURL(imagePreview) }, [imagePreview])
  const canManageEquipment = user?.role === 'barangay_admin' || user?.role === 'barangay_staff'
  const isBarangayScoped = user?.role === 'resident' || canManageEquipment
  const barangayEquipment = isBarangayScoped
    ? user?.barangayId ? equipment.filter((item) => item.barangayId === user.barangayId) : []
    : equipment
  const filteredEquipment = barangayEquipment.filter((item) => {
    if (category === 'All') return true
    const keywords = categoryKeywords[category] ?? []
    return keywords.some((word) => item.name.toLowerCase().includes(word))
  })

  return <>
    <section className="min-w-0">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5 rounded-2xl border border-[#e8dfd1] bg-gradient-to-br from-white to-[#f7efe3] px-5 py-5 sm:px-7 sm:py-6">
        <div>
          <p className="mb-3 text-[9px] font-bold tracking-[1.5px] text-[#900000]">COMMUNITY EQUIPMENT</p>
          <h1 className="mb-2 font-serif text-3xl font-semibold tracking-tight text-[#000c26] sm:text-4xl">{canManageEquipment ? 'Equipment catalogue' : 'Find equipment'}</h1>
          <p className="max-w-2xl text-xs leading-relaxed text-[#626a79] sm:text-sm">{user?.role === 'resident' ? 'Showing equipment available from your assigned barangay.' : canManageEquipment ? 'Manage equipment available from your assigned barangay.' : 'Explore equipment available for reservation from Cordova barangays.'}</p>
        </div>
        {canManageEquipment && <button type="button" onClick={() => { setFormError(''); setIsAddModalOpen(true) }} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#900000] px-5 text-sm font-semibold text-white shadow-md shadow-[#900000]/15 transition hover:-translate-y-0.5 hover:bg-[#740000] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#900000]/20"><span className="text-xl leading-none" aria-hidden="true">+</span>Add equipment</button>}
      </div>

      <div className="mb-6 flex flex-wrap gap-2 sm:gap-3" aria-label="Filter equipment by category">
        {categories.map((item) => <button
          key={item}
          type="button"
          className={`min-h-10 min-w-[82px] cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition duration-150 sm:px-5 ${category === item ? 'border-[#000c26] bg-[#000c26] text-white shadow-md shadow-[#000c26]/15' : 'border-[#d9cfbf] bg-white/70 text-[#4b5361] hover:border-[#000c26]/40 hover:bg-white hover:text-[#000c26]'}`}
          aria-pressed={category === item}
          onClick={() => setCategory(item)}
        >{item}</button>)}
      </div>
      {user?.role === 'resident' && <p className="mb-4 text-xs text-[#626a79]">Select up to 3 different items for one request. {selectedItems.length}/3 selected{selectedItems.length === 3 ? ' · Maximum reached' : ''}</p>}

      {!user && <div className="mb-5 rounded border border-[#eee1d1] bg-[#f8efe3] px-4 py-3 text-xs text-[#656b78]">You can browse equipment now. <strong className="text-[#900000]">Sign in or create an account</strong> to request a reservation.</div>}

      {filteredEquipment.length === 0
        ? <div className="flex min-h-[275px] flex-col items-center justify-center rounded-md border border-[#e9e1d6] bg-white p-8 text-center"><div className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#faf2e7] text-xl" aria-hidden="true">⌂</div><h2 className="mb-2 font-serif text-lg font-semibold text-[#172239]">No equipment in this category</h2><p className="text-sm leading-relaxed text-[#747988]">Try another category or check back later for new equipment.</p></div>
        : <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredEquipment.map((item) => <EquipmentCard key={item.id} item={item} user={user} selected={selectedItems.some((selected) => selected.id === item.id)} selectionDisabled={selectedItems.length >= 3} onReserve={onSelect} onEdit={canManageEquipment ? setEditing : undefined} />)}</div>}
    </section>
    {isAddModalOpen && canManageEquipment && <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#000c26]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setIsAddModalOpen(false) }}>
      <section role="dialog" aria-modal="true" aria-labelledby="add-equipment-title" className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[#fffdf9] shadow-2xl shadow-black/25 sm:rounded-3xl">
        <div className="relative overflow-hidden bg-[#000c26] px-6 py-6 text-white sm:px-8"><div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 rounded-full border-[24px] border-white/[0.06]" /><div className="relative flex items-start justify-between gap-4"><div><p className="mb-2 text-[10px] font-bold uppercase tracking-[1.7px] text-[#f1c89e]">Barangay inventory</p><h2 id="add-equipment-title" className="font-serif text-2xl font-semibold sm:text-3xl">Add equipment</h2><p className="mt-2 max-w-md text-xs leading-relaxed text-white/70">Add an item to your barangay catalogue. Residents will see it as soon as it is saved.</p></div><button type="button" aria-label="Close add equipment dialog" disabled={busy} onClick={() => setIsAddModalOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/20 disabled:opacity-50">×</button></div></div>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={async (event) => { event.preventDefault(); setFormError(''); const message = await onCreateEquipment(event); if (message) setFormError(message); else { setImagePreview(''); setFormError(''); setIsAddModalOpen(false) } }}>
          <div className="grid flex-1 gap-6 overflow-y-auto p-5 sm:grid-cols-[1fr_220px] sm:p-8">
            <div className="space-y-5">
              <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[1.4px] text-[#900000]">Item details</p><label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Equipment name <span className="text-[#900000]">*</span><input className="min-h-12 rounded-xl border border-[#ded6ca] bg-white px-4 text-sm font-normal outline-none transition placeholder:text-[#a2a3a7] focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/[0.08]" name="name" minLength={2} maxLength={160} placeholder="e.g. Folding chairs" required /></label></div>
              <label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Description <span className="text-[11px] font-normal text-[#818590]">Optional details to help residents choose</span><textarea className="min-h-28 resize-y rounded-xl border border-[#ded6ca] bg-white px-4 py-3 text-sm font-normal outline-none transition placeholder:text-[#a2a3a7] focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/[0.08]" name="description" maxLength={1000} placeholder="Add condition, size, or included accessories…" /></label>
              <div className="rounded-2xl border border-[#eee6da] bg-[#faf7f1] p-4"><label className="flex flex-col gap-2 text-xs font-semibold text-[#30394b]">Available quantity <span className="text-[11px] font-normal text-[#818590]">Total units residents can request</span><div className="relative max-w-[190px]"><input className="min-h-12 w-full rounded-xl border border-[#ded6ca] bg-white px-4 pr-16 text-lg font-semibold text-[#000c26] outline-none transition focus:border-[#900000] focus:ring-4 focus:ring-[#900000]/[0.08]" name="totalQuantity" type="number" min={1} max={10000} defaultValue={1} required /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#858892]">units</span></div></label></div>
            </div>
            <div><p className="mb-3 text-[10px] font-bold uppercase tracking-[1.4px] text-[#900000]">Equipment photo <span className="text-[#b42318">*</span></p><label className="group relative flex min-h-[230px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#d8c9b5] bg-[#faf7f1] text-center transition hover:border-[#900000]/60 hover:bg-[#f7efe3]">{imagePreview ? <><img src={imagePreview} alt="Equipment preview" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-x-3 bottom-3 rounded-lg bg-[#000c26]/80 px-3 py-2 text-[10px] font-semibold text-white backdrop-blur-sm">Click to change photo</span></> : <span className="px-5"><span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl text-[#900000] shadow-sm">↑</span><span className="block text-sm font-semibold text-[#273148]">Choose an image</span><span className="mt-2 block text-[11px] leading-relaxed text-[#777d88]">PNG, JPG, or WebP<br />Up to 1 MB</span></span>}<input className="sr-only" name="image" type="file" accept="image/png,image/jpeg,image/webp" required onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; setImagePreview(file ? URL.createObjectURL(file) : '') }} /></label><p className="mt-3 text-[10px] leading-relaxed text-[#858892]">Use a clear photo of the item so residents can identify it.</p></div>
          </div>
          {formError && <div className="mx-5 mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 sm:mx-8" role="alert"><span className="font-bold">!</span><span>{formError}</span></div>}
          <div className="flex flex-col-reverse gap-2 border-t border-[#eee6da] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-8"><button type="button" disabled={busy} onClick={() => { setIsAddModalOpen(false); setFormError(''); setImagePreview('') }} className="min-h-11 rounded-xl border border-[#ded6ca] px-5 text-sm font-semibold text-[#525967] transition hover:bg-[#faf7f1] disabled:opacity-50">Cancel</button><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#900000] px-6 text-sm font-semibold text-white shadow-md shadow-[#900000]/15 transition hover:bg-[#740000] disabled:cursor-wait disabled:opacity-60"><span aria-hidden="true">{busy ? '◌' : '+'}</span>{busy ? 'Saving equipment…' : 'Save equipment'}</button></div>
        </form>
      </section>
    </div>}
    {editing && canManageEquipment && <div className="fixed inset-0 z-[85] flex items-end justify-center bg-[#000c26]/65 p-0 backdrop-blur-md sm:items-center sm:p-5"><section role="dialog" aria-modal="true" aria-labelledby="edit-equipment-title" className="w-full max-w-xl overflow-hidden rounded-t-3xl bg-[#fffdf9] shadow-2xl sm:rounded-3xl"><header className="flex items-center justify-between bg-[#000c26] p-6 text-white"><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#f1c89e]">Inventory item</p><h2 id="edit-equipment-title" className="mt-1 font-serif text-2xl">Edit equipment</h2></div><button type="button" onClick={() => { setEditing(null); setConfirmDelete(false); setFormError('') }} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-xl">×</button></header><form className="space-y-4 p-6" onSubmit={async (event) => { event.preventDefault(); setFormError(''); const data = new FormData(event.currentTarget); const file = data.get('image'); let imageData: string | undefined; if (file instanceof File && file.size) { if (file.size > 1_000_000) { setFormError('Choose an image smaller than 1 MB.'); return } imageData = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error('Could not read image.')); reader.readAsDataURL(file) }) } const error = await onUpdateEquipment(editing.id, { name: String(data.get('name')), description: String(data.get('description')), totalQuantity: Number(data.get('totalQuantity')), ...(imageData ? { imageData } : {}) }); if (error) setFormError(error); else setEditing(null) }}><div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-2 text-xs font-semibold">Equipment name<input name="name" required minLength={2} maxLength={160} defaultValue={editing.name} className="min-h-11 rounded-xl border border-[#ded6ca] px-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-semibold">Available quantity<input name="totalQuantity" type="number" min={1} max={10000} required defaultValue={editing.totalQuantity} className="min-h-11 rounded-xl border border-[#ded6ca] px-3 text-sm font-normal" /></label></div><label className="grid gap-2 text-xs font-semibold">Description<textarea name="description" maxLength={1000} defaultValue={editing.description ?? ''} rows={3} className="rounded-xl border border-[#ded6ca] p-3 text-sm font-normal" /></label><label className="grid gap-2 text-xs font-semibold">Replace photo <span className="text-[10px] font-normal text-[#777d88]">Optional · PNG/JPG/WebP up to 1 MB</span><input name="image" type="file" accept="image/png,image/jpeg,image/webp" className="rounded-xl border border-dashed border-[#d8c9b5] bg-[#faf7f1] p-3 text-xs" /></label>{formError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-xs text-red-800">{formError}</p>}<footer className="flex flex-col-reverse justify-between gap-2 border-t border-[#eee6da] pt-4 sm:flex-row"><button type="button" onClick={() => setConfirmDelete(true)} className="min-h-11 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-700 hover:bg-red-50">Delete equipment</button><div className="flex gap-2"><button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-xl border px-4 text-sm">Cancel</button><button disabled={busy} className="min-h-11 rounded-xl bg-[#900000] px-5 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Saving…' : 'Save changes'}</button></div></footer></form></section></div>}
    {editing && confirmDelete && <div className="fixed inset-0 z-[90] grid place-items-center bg-[#000c26]/70 p-4 backdrop-blur-xl"><section role="alertdialog" aria-modal="true" aria-labelledby="confirm-delete-title" className="w-full max-w-sm rounded-3xl border border-white/20 bg-white p-6 text-center shadow-2xl"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-2xl text-red-700">!</div><h2 id="confirm-delete-title" className="font-serif text-2xl font-semibold text-[#000c26]">Remove this item?</h2><p className="mt-2 text-sm leading-relaxed text-[#687080]"><strong>{editing.name}</strong> will no longer appear in the equipment catalogue.</p>{formError && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">{formError}</p>}<div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={busy} onClick={() => { setConfirmDelete(false); setFormError('') }} className="min-h-11 rounded-xl border border-[#ded6ca] text-sm font-semibold">Keep item</button><button type="button" disabled={busy} onClick={async () => { const error = await onDeleteEquipment(editing.id); if (error) setFormError(error); else { setEditing(null); setConfirmDelete(false) } }} className="min-h-11 rounded-xl bg-red-700 text-sm font-semibold text-white disabled:opacity-50">{busy ? 'Removing…' : 'Yes, remove'}</button></div></section></div>}
    {user?.role === 'resident' && selectedItems.length > 0 && <div className="sticky bottom-4 z-10 mx-auto mt-5 flex w-full max-w-3xl flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d8c8ae] bg-[#fffaf2] p-4 shadow-lg"><div><p className="text-sm font-semibold text-[#000c26]">{selectedItems.length} of 3 equipment items selected</p><p className="mt-1 text-[11px] text-[#6f7480]">Choose your dates and submit them together.</p></div><button type="button" onClick={onContinueReservation} disabled={busy} className="min-h-10 rounded bg-[#900000] px-4 text-xs font-semibold text-white hover:bg-[#740000] disabled:opacity-50">Continue to request →</button></div>}
  </>
}
