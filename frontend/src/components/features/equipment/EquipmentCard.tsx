import type { Equipment, User } from '../../../types/portal'
import ActionButton from '../../ui/ActionButton'
import EquipmentImage from './EquipmentImage'
import tentImage from '../../../assets/figma/category-tent.png'
import seatingImage from '../../../assets/figma/category-seating.png'
import audioImage from '../../../assets/figma/category-audio.png'

function getEquipmentImage(name: string) {
  const itemName = name.toLowerCase()

  if (itemName.includes('tent') || itemName.includes('canopy')) return tentImage
  if (itemName.includes('chair') || itemName.includes('table') || itemName.includes('seat')) return seatingImage
  if (itemName.includes('sound') || itemName.includes('speaker') || itemName.includes('audio') || itemName.includes('light')) return audioImage

  return null
}

export default function EquipmentCard({ item, user, onReserve, onEdit, selected = false, selectionDisabled = false }: { item: Equipment; user: User | null; onReserve: (item: Equipment) => void; onEdit?: (item: Equipment) => void; selected?: boolean; selectionDisabled?: boolean }) {
  const image = getEquipmentImage(item.name)
  const isInventoryAdmin = user?.role === 'barangay_admin' || user?.role === 'barangay_staff'

  return <article onClick={isInventoryAdmin ? () => onEdit?.(item) : undefined} onKeyDown={isInventoryAdmin ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onEdit?.(item) } } : undefined} role={isInventoryAdmin ? 'button' : undefined} tabIndex={isInventoryAdmin ? 0 : undefined} aria-label={isInventoryAdmin ? `Edit ${item.name}` : undefined} className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl ${isInventoryAdmin ? 'cursor-pointer border-[#e5dac9] shadow-[#312515]/[0.05] hover:border-[#c9b69b] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#900000]/20' : 'border-[#e9e1d6] shadow-[#312515]/[0.035] hover:border-[#d6c8b4]'}`}>
    <div className={`relative grid place-items-center overflow-hidden ${isInventoryAdmin ? 'h-48 bg-[#f7efe3] p-0 sm:h-52' : 'm-4 mb-4 h-36 rounded-xl bg-gradient-to-br from-[#faf3e9] to-[#f3e7d6] p-2 sm:h-40'}`}>
      <EquipmentImage imageData={item.imageData} alt={item.name} fallback={image} className={`h-full w-full ${isInventoryAdmin ? 'object-contain p-3 transition duration-300 group-hover:scale-[1.02]' : 'object-contain'}`} />
      {isInventoryAdmin && <><span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.12em] text-[#26334b] shadow-sm backdrop-blur">Inventory</span><span className={`absolute right-3 top-3 rounded-full px-3 py-1.5 text-[10px] font-bold shadow-sm ${item.totalQuantity > 0 ? 'bg-[#e7f3e8] text-[#25643a]' : 'bg-[#fbe7e7] text-[#a12222]'}`}>{item.totalQuantity > 0 ? `${item.totalQuantity} in stock` : 'Out of stock'}</span></>}
    </div>
    <div className={`flex flex-1 flex-col ${isInventoryAdmin ? 'p-5 pt-4' : 'px-4 pb-4 sm:px-5 sm:pb-5'}`}>
      <p className="mb-2 text-[9px] font-bold uppercase tracking-[1.15px] text-[#900000]">{item.barangayName}</p>
      <h2 className="mb-2 font-serif text-xl font-semibold tracking-tight text-[#000c26]">{item.name}</h2>
      <p className={`mb-4 text-xs leading-relaxed text-[#707584] ${isInventoryAdmin ? 'min-h-10 line-clamp-2' : 'min-h-9'}`}>{item.description || 'Contact your barangay for more information about this item.'}</p>
      <div className={`mt-auto flex items-center justify-between gap-3 ${isInventoryAdmin ? 'border-t border-[#eee6da] pt-3' : 'mb-4'}`}>
        <p className="flex items-center gap-2 text-[11px] font-medium text-[#43694c]"><span className="h-2 w-2 rounded-full bg-[#4b9360]" aria-hidden="true" />{item.totalQuantity} available</p>
      </div>
      {user?.role === 'resident' && <ActionButton variant={selected ? 'primary' : 'secondary'} className="mt-4 w-full" type="button" disabled={!selected && selectionDisabled} onClick={() => onReserve(item)}>{selected ? '✓ Added · Remove' : '＋ Add to request'}</ActionButton>}
    </div>
  </article>
}
