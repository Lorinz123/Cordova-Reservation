import type { ReactNode } from 'react'

export function AdminPageTitle({ eyebrow, title, subtitle, action }: { eyebrow: string; title: string; subtitle?: string; action?: ReactNode }) {
  return <div className="relative mb-7 flex flex-wrap items-end justify-between gap-4 overflow-hidden rounded-2xl border border-[#e8dfd1] bg-gradient-to-br from-white via-white to-[#f7efe3] px-5 py-5 shadow-sm shadow-[#312515]/[0.03] sm:px-7 sm:py-6"><div className="relative z-10"><p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[1.7px] text-[#900000]"><span className="h-1.5 w-1.5 rounded-full bg-[#a20b0b]" />{eyebrow}</p><h1 className="font-serif text-3xl font-semibold tracking-tight text-[#000c26] sm:text-4xl">{title}</h1>{subtitle && <p className="mt-2 max-w-2xl text-xs leading-relaxed text-[#737783] sm:text-sm">{subtitle}</p>}</div>{action && <div className="relative z-10">{action}</div>}<div className="pointer-events-none absolute -right-6 -top-12 h-40 w-40 rounded-full border-[22px] border-[#900000]/[0.035]" /></div>
}

export function AdminStatCard({ label, value, note, icon }: { label: string; value: string | number; note: string; icon: string }) {
  return <article className="group relative overflow-hidden rounded-2xl border border-[#e8dfd1] bg-white p-4 shadow-sm shadow-[#312515]/[0.035] transition duration-200 hover:-translate-y-0.5 hover:border-[#d6c8b4] hover:shadow-lg hover:shadow-[#312515]/[0.07] sm:p-5"><div className="mb-4 flex items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#717680]">{label}</span><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f7efe3] text-base text-[#900000] transition group-hover:bg-[#900000] group-hover:text-white" aria-hidden="true">{icon}</span></div><p className="break-words font-serif text-3xl font-semibold leading-none text-[#000c26]">{value}</p><p className="mt-2 text-[10px] text-[#858892]">{note}</p><span className="pointer-events-none absolute -bottom-7 -right-5 h-20 w-20 rounded-full bg-[#f7efe3]/70 transition group-hover:scale-125" /></article>
}

export function AdminPanel({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return <section className="rounded-2xl border border-[#e8dfd1] bg-white p-4 shadow-sm shadow-[#312515]/[0.035] sm:p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-lg font-semibold text-[#000c26]">{title}</h2>{action}</div>{children}</section>
}

export function AdminBarChart({ items, emptyMessage = 'No data to show yet.' }: { items: { label: string; value: number }[]; emptyMessage?: string }) {
  const max = Math.max(1, ...items.map((item) => item.value))
  if (!items.length || items.every((item) => item.value === 0)) return <p className="py-10 text-center text-xs text-[#858892]">{emptyMessage}</p>
  return <div className="flex h-40 items-end gap-2 border-b border-[#ded4c5] px-1 pt-3 sm:gap-4">{items.map((item) => <div key={item.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="flex h-32 w-full items-end justify-center"><div className="w-[min(34px,70%)] rounded-t-sm bg-[#a20b0b] transition-all" style={{ height: `${Math.max(5, (item.value / max) * 100)}%` }} title={`${item.label}: ${item.value}`} /></div><span className="w-full truncate text-center text-[8px] text-[#6f7480] sm:text-[9px]" title={item.label}>{item.label}</span></div>)}</div>
}
