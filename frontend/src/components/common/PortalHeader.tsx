import municipalitySeal from '../../assets/figma/raw-image-2.png'
import notificationBell from '../../assets/figma/icon-1.svg'
import brandDivider from '../../assets/figma/icon-2.svg'
import accountDivider from '../../assets/figma/icon-3.svg'
import type { User } from '../../types/portal'
import { useRef } from 'react'

export type NavigationItem = { view: string; label: string }

type PortalHeaderProps = {
  user: User | null
  currentView: string
  navItems: NavigationItem[]
  busy: boolean
  unreadCount: number
  onNavigate: (view: string) => void
  onSignOut: () => void
}

export default function PortalHeader({ user, currentView, navItems, busy, unreadCount, onNavigate, onSignOut }: PortalHeaderProps) {
  const accountMenu = useRef<HTMLDetailsElement>(null)
  const guestAuth = !user && currentView === 'auth'
  return <header className={guestAuth ? 'hidden' : 'sticky top-0 z-40 flex min-h-[76px] flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#000c26]/95 px-4 text-[#fff5e6] shadow-lg shadow-[#000c26]/10 backdrop-blur-xl sm:px-8 lg:px-14'}>
    <button className="flex shrink-0 items-center gap-3 bg-transparent text-left" type="button" onClick={() => onNavigate('home')} aria-label="Cordova Reservation Portal home">
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-white/10 p-1 shadow-inner"><img className="h-full w-full object-contain" src={municipalitySeal} alt="Municipality of Cordova seal" /></span>
      <span className="hidden h-9 w-px items-center justify-center overflow-hidden sm:flex"><img className="w-12 rotate-90 opacity-60" src={brandDivider} alt="" /></span>
      <span className="flex flex-col gap-0.5 leading-tight"><strong className="font-serif text-sm font-semibold sm:text-base">Municipality of Cordova</strong><span className="text-[10px] tracking-wide text-[#c9c9d0] sm:text-xs">Reservation System</span></span>
    </button>
    <nav className="order-3 -mx-4 flex w-[calc(100%+2rem)] items-center gap-1 overflow-x-auto border-t border-white/10 px-4 sm:order-none sm:mx-0 sm:w-auto sm:border-0 sm:bg-white/[0.04] sm:p-1 sm:rounded-xl" aria-label="Main navigation">
      {navItems.map((item) => <button key={item.view} aria-current={currentView === item.view ? 'page' : undefined} className={`relative shrink-0 rounded-lg px-3 py-3 text-[11px] font-semibold transition duration-150 sm:px-3.5 sm:py-2.5 ${currentView === item.view ? 'bg-white/10 text-[#f0c47c] shadow-inner' : 'text-[#e1e4ea] hover:bg-white/[0.07] hover:text-white'}`} type="button" onClick={() => onNavigate(item.view)}>{item.label}</button>)}
      {user && <button aria-current={currentView === 'notifications' ? 'page' : undefined} className={`relative shrink-0 rounded-lg px-3 py-3 text-[11px] font-semibold transition duration-150 sm:px-3.5 sm:py-2.5 ${currentView === 'notifications' ? 'bg-white/10 text-[#f0c47c] shadow-inner' : 'text-[#e1e4ea] hover:bg-white/[0.07] hover:text-white'}`} type="button" onClick={() => onNavigate('notifications')}>Notifications</button>}
    </nav>
    <div className="ml-auto flex shrink-0 items-center gap-4 sm:ml-0">
      {user && <>
        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#d4a45d]" type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} onClick={() => onNavigate('notifications')}>
          <img className="h-6 w-6" src={notificationBell} alt="" />
          {unreadCount > 0 && <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-[#000c26] bg-[#c33b32] px-1 text-[10px] font-bold leading-none text-white" aria-hidden="true">{unreadCount > 99 ? '99+' : unreadCount}</span>}
        </button>
        <img className="hidden h-8 w-px sm:block" src={accountDivider} alt="" />
        <details ref={accountMenu} className="relative">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2 text-xs text-[#fff5e6] outline-none transition hover:bg-white/10 focus:ring-2 focus:ring-[#d4a45d]" aria-label="Open account menu">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#f0c47c] text-[11px] font-bold text-[#000c26]">{user.fullName.split(/\s+/).slice(0,2).map((part)=>part[0]?.toUpperCase()).join('')}</span>
            <span className="hidden sm:inline">{user.fullName.split(' ')[0]}</span>
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m2 4 4 4 4-4" /></svg>
          </summary>
          <div className="absolute right-0 z-50 mt-3 w-52 overflow-hidden rounded-md border border-[#e9e1d6] bg-white py-2 text-[#172239] shadow-xl">
            <div className="border-b border-[#eee9e1] px-4 py-2"><p className="truncate text-xs font-semibold">{user.fullName}</p><p className="truncate text-[11px] text-[#747988]">{user.email}</p></div>
            <button className="block w-full px-4 py-3 text-left text-sm hover:bg-[#fff5e6]" type="button" onClick={() => { accountMenu.current?.removeAttribute('open'); onNavigate('profile') }}>Profile</button>
            <button className="block w-full px-4 py-3 text-left text-sm text-[#900000] hover:bg-[#fff5e6] disabled:opacity-50" type="button" onClick={onSignOut} disabled={busy}>Sign out</button>
          </div>
        </details>
      </>}
      {!user && <button className="rounded border border-[#fff5e6]/60 px-4 py-2 text-xs font-semibold text-[#fff5e6] hover:bg-white/10" type="button" onClick={() => onNavigate('sign-in')}>Sign in</button>}
    </div>
  </header>
}
