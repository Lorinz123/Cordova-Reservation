import type { FormEvent } from 'react'
import SuperAdminManagementForms from '../../components/features/admin/SuperAdminManagementForms'
import type { BarangayManagementSummary } from '../../types/portal'
import { AdminPageTitle, AdminPanel, AdminStatCard } from '../../components/features/admin/DashboardPrimitives'

type SuperAdminPageProps = {
  barangays: BarangayManagementSummary[]
  busy: boolean
  onCreateBarangay: (event: FormEvent<HTMLFormElement>) => void
  onInviteAdmin: (event: FormEvent<HTMLFormElement>) => void
}

export default function SuperAdminPage({ barangays, busy, onCreateBarangay, onInviteAdmin }: SuperAdminPageProps) {
  return <section className="w-full">
    <AdminPageTitle eyebrow="Municipal administration" title="Barangays" subtitle="Manage communities, view service coverage, and invite one admin for each barangay." />
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Barangays" value={barangays.length} note="Communities in the portal" icon="⌂" /><AdminStatCard label="Admins assigned" value={barangays.filter((item) => item.adminId).length} note="Barangays with an active admin" icon="♙" /><AdminStatCard label="Residents" value={barangays.reduce((sum, item) => sum + item.residentCount, 0)} note="Registered residents" icon="♧" /><AdminStatCard label="Equipment types" value={barangays.reduce((sum, item) => sum + item.equipmentCount, 0)} note="Active equipment records" icon="▣" /></div>
    <SuperAdminManagementForms barangays={barangays} busy={busy} onCreateBarangay={onCreateBarangay} onInviteAdmin={onInviteAdmin} />
    <div className="mt-5"><AdminPanel title="Barangay directory"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[10px]"><thead className="bg-[#f7efe3] text-[#646b78]"><tr>{['Barangay','Admin','Residents','Equipment','Requests'].map((label) => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{barangays.map((item) => <tr key={item.id} className="border-b border-[#eee6da] last:border-0"><td className="px-3 py-3 font-semibold text-[#253047]">{item.name}</td><td className="px-3 py-3">{item.adminId ? <><p className="font-medium">{item.adminName}</p><p className="text-[#7b8089]">{item.adminEmail}</p></> : <span className="text-[#900000]">Admin not assigned</span>}</td><td className="px-3 py-3">{item.residentCount}</td><td className="px-3 py-3">{item.equipmentCount}</td><td className="px-3 py-3">{item.requestCount}</td></tr>)}</tbody></table>{!barangays.length && <p className="py-8 text-center text-xs text-[#858892]">No barangays are registered yet.</p>}</div></AdminPanel></div>
  </section>
}
