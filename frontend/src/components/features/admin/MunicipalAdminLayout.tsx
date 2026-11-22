import type { ReactNode } from 'react'
import municipalitySeal from '../../../assets/figma/raw-image-2.png'
import type { SuperAdminSection, User } from '../../../types/portal'

const sections: { id: SuperAdminSection; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: '▦' },
  { id: 'barangays', label: 'Barangays', icon: '⌂' },
  { id: 'requests', label: 'All requests', icon: '▤' },
  { id: 'equipment', label: 'Equipment', icon: '▣' },
  { id: 'reports', label: 'Reports', icon: '▥' },
]

export default function MunicipalAdminLayout({ user, section, onSectionChange, onSignOut, children }: { user: User; section: SuperAdminSection; onSectionChange: (section: SuperAdminSection) => void; onSignOut: () => void; children: ReactNode }) {
  return <div className="flex min-h-screen bg-gradient-to-br from-[#fff8ee] via-[#fff5e6] to-[#f4ecdf] font-sans text-[#111b31]">
    <aside className="sticky top-0 flex h-screen w-[218px] shrink-0 flex-col border-r border-white/5 bg-[#000c26] px-4 py-5 text-white shadow-xl shadow-[#000c26]/10 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:z-50 max-md:h-[68px] max-md:w-full max-md:flex-row max-md:items-center max-md:overflow-x-auto max-md:border-r-0 max-md:border-t max-md:border-white/10 max-md:px-2 max-md:py-1 max-md:shadow-[0_-12px_30px_rgba(0,12,38,.18)]">
      <div className="mb-8 flex items-center gap-3 px-2 max-md:hidden"><img className="h-11 w-11 shrink-0 object-contain" src={municipalitySeal} alt="Municipality of Cordova seal" /><div className="min-w-0"><p className="truncate text-[10px] font-bold uppercase tracking-[1.1px]">Cordova</p><p className="mt-1 truncate text-xs text-[#c9c9d0]">Municipal admin</p></div></div>
      <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[1.3px] text-[#8f9bb0] max-md:hidden">Workspace</p>
      <nav className="flex flex-col gap-1 max-md:flex-1 max-md:flex-row max-md:items-center max-md:justify-around max-md:gap-0" aria-label="Municipal administration">
        {sections.map((item) => <button key={item.id} type="button" aria-current={section === item.id ? 'page' : undefined} title={item.label} onClick={() => onSectionChange(item.id)} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-xs font-medium transition duration-150 max-md:min-w-[61px] max-md:flex-col max-md:justify-center max-md:gap-0.5 max-md:px-1 max-md:py-1 ${section === item.id ? 'bg-[#900000] text-white shadow-md shadow-black/20' : 'text-[#d0d5de] hover:bg-white/10 hover:text-white'}`}><span className="grid w-5 place-items-center text-base" aria-hidden="true">{item.icon}</span><span className="max-md:block max-md:text-[9px]">{item.label}</span></button>)}
      </nav>
      <div className="mt-auto border-t border-white/10 pt-4 max-md:mt-0 max-md:border-0 max-md:pt-0">
        <div className="mb-4 flex items-center gap-2 px-2 max-md:hidden"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e7dbc9] text-xs font-bold text-[#000c26]">{user.fullName.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{user.fullName}</p><p className="truncate text-[10px] text-[#aeb8c7]">Super admin</p></div></div>
        <button type="button" onClick={onSignOut} className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-xs text-[#d0d5de] transition hover:bg-white/10 hover:text-white max-md:min-w-[58px] max-md:flex-col max-md:justify-center max-md:gap-0.5 max-md:px-1 max-md:py-1" title="Sign out"><span className="grid w-5 place-items-center text-base" aria-hidden="true">↪</span><span className="max-md:text-[9px]">Sign out</span></button>
      </div>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="flex min-h-14 items-center justify-between border-b border-[#e7dfd3]/80 bg-white/45 px-5 backdrop-blur sm:px-8"><p className="text-[9px] font-bold uppercase tracking-[1.1px] text-[#7a7e87] sm:text-[10px]">Municipality of Cordova <span className="mx-1 text-[#b5a994]">/</span> Administration</p><span className="rounded-full border border-[#ded3c5] bg-white/70 px-3 py-1.5 text-[9px] font-semibold text-[#777b84] sm:text-[10px]">Municipal administrator</span></header>
      <main className="mx-auto w-full max-w-[1500px] p-4 pb-24 sm:p-7 sm:pb-24 lg:p-9 lg:pb-24">{children}</main>
    </div>
  </div>
}
