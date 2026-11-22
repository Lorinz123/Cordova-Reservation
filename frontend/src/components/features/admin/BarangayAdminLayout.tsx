import type { ReactNode } from 'react'
import municipalitySeal from '../../../assets/figma/raw-image-2.png'
import type { BarangayAdminSection, User } from '../../../types/portal'

const sections: { id: BarangayAdminSection; label: string; icon: string }[] = [
  { id: 'requests', label: 'Requests', icon: '▤' },
  { id: 'inventory', label: 'Inventory', icon: '▣' },
  { id: 'calendar', label: 'Calendar', icon: '▦' },
  { id: 'residents', label: 'Residents', icon: '♙' },
  { id: 'reports', label: 'Reports', icon: '▥' },
]

export default function BarangayAdminLayout({ user, barangayName, section, onSectionChange, onSignOut, children }: { user: User; barangayName: string; section: BarangayAdminSection; onSectionChange: (section: BarangayAdminSection) => void; onSignOut: () => void; children: ReactNode }) {
  return <div className="flex min-h-screen bg-gradient-to-br from-[#fff8ee] via-[#fff5e6] to-[#f4ecdf] font-sans text-[#111b31]">
    <aside className="sticky top-0 flex h-screen w-[218px] shrink-0 flex-col border-r border-white/5 bg-[#000c26] px-4 py-5 text-white shadow-xl shadow-[#000c26]/10 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-50 max-md:h-[68px] max-md:w-full max-md:flex-row max-md:items-center max-md:overflow-x-auto max-md:border-r-0 max-md:border-t max-md:border-white/10 max-md:px-2 max-md:py-1 max-md:shadow-[0_-12px_30px_rgba(0,12,38,.18)]">
      <div className="mb-7 flex items-center gap-3 px-2 max-md:hidden"><img className="h-11 w-11 shrink-0 object-contain" src={municipalitySeal} alt="Municipality of Cordova seal" /><div className="min-w-0"><p className="truncate text-[10px] font-bold uppercase tracking-[1px]">Cordova</p><p className="mt-1 truncate text-xs text-[#c9c9d0]">{barangayName || 'Barangay admin'}</p></div></div>
      <div className="mb-5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 max-md:hidden"><p className="text-[9px] uppercase tracking-wide text-[#aeb8c7]">Signed in as</p><p className="mt-1 truncate text-[10px] font-semibold">{user.fullName}</p></div>
      <nav className="flex flex-col gap-1 max-md:flex-1 max-md:flex-row max-md:items-center max-md:justify-around max-md:gap-0" aria-label={`${barangayName} administration`}>
        {sections.map((item) => <button key={item.id} type="button" aria-current={section === item.id ? 'page' : undefined} title={item.label} onClick={() => onSectionChange(item.id)} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-xs font-medium transition duration-150 max-md:min-w-[58px] max-md:flex-col max-md:justify-center max-md:gap-0.5 max-md:px-1 max-md:py-1 ${section === item.id ? 'bg-[#900000] text-white shadow-md shadow-black/20' : 'text-[#d0d5de] hover:bg-white/10 hover:text-white'}`}><span className="grid w-5 place-items-center text-base" aria-hidden="true">{item.icon}</span><span className="max-md:text-[9px]">{item.label}</span></button>)}
      </nav>
      <button type="button" onClick={onSignOut} className="mt-auto flex min-h-10 items-center gap-3 rounded-lg border-t border-white/10 px-3 pt-3 text-xs text-[#d0d5de] transition hover:bg-white/10 hover:text-white max-md:mt-0 max-md:min-w-[58px] max-md:flex-col max-md:justify-center max-md:gap-0.5 max-md:border-0 max-md:px-1 max-md:py-1" title="Sign out"><span className="grid w-5 place-items-center text-base" aria-hidden="true">↪</span><span className="max-md:text-[9px]">Sign out</span></button>
    </aside>
    <div className="min-w-0 flex-1"><header className="flex min-h-14 items-center justify-between border-b border-[#e7dfd3]/80 bg-white/45 px-4 backdrop-blur sm:px-8"><p className="truncate text-[9px] font-bold uppercase tracking-[1px] text-[#7a7e87] sm:text-[10px]">{barangayName} <span className="mx-1 text-[#b5a994]">/</span> Administration</p><span className="ml-3 shrink-0 rounded-full border border-[#ded3c5] bg-white/70 px-3 py-1.5 text-[9px] font-semibold text-[#777b84] sm:text-[10px]">Barangay administrator</span></header><main className="mx-auto w-full max-w-[1500px] p-4 pb-24 sm:p-7 sm:pb-24 lg:p-9 lg:pb-24">{children}</main></div>
  </div>
}
