import type { BarangayManagementSummary, Reservation } from '../../types/portal'
import { AdminBarChart, AdminPageTitle, AdminPanel, AdminStatCard } from '../../components/features/admin/DashboardPrimitives'

export default function SuperAdminOverviewPage({ barangays, reservations, loading, onNavigate }: { barangays: BarangayManagementSummary[]; reservations: Reservation[]; loading: boolean; onNavigate: (section: 'barangays' | 'requests' | 'equipment' | 'reports') => void }) {
  const pending = reservations.filter((item) => item.status === 'pending')
  const totalEquipment = barangays.reduce((sum, item) => sum + item.equipmentCount, 0)
  const assignedAdmins = barangays.filter((item) => item.adminId).length
  const byBarangay = barangays.map((item) => ({ label: item.name, value: item.requestCount })).sort((a, b) => b.value - a.value).slice(0, 8)
  const recent = [...reservations].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 5)
  return <>
    <AdminPageTitle eyebrow="Municipal administration" title="Overview" subtitle="A snapshot of barangay services and equipment reservations." />
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Barangays" value={barangays.length} note="Communities in the portal" icon="⌂" />
      <AdminStatCard label="Pending requests" value={loading ? '—' : pending.length} note="Waiting for a decision" icon="◷" />
      <AdminStatCard label="Equipment items" value={totalEquipment} note="Active catalogue entries" icon="▣" />
      <AdminStatCard label="Barangay admins" value={`${assignedAdmins} / ${barangays.length}`} note="Communities with an assigned admin" icon="♙" />
    </div>
    <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
      <AdminPanel title="Recent requests" action={<button className="rounded-lg px-3 py-2 text-[10px] font-bold text-[#900000] transition hover:bg-[#f7efe3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#900000]" onClick={() => onNavigate('requests')}>View all →</button>}>
        {recent.length ? <div className="overflow-x-auto rounded-xl border border-[#eee6da]"><table className="w-full min-w-[590px] text-left text-xs"><thead className="bg-[#faf7f1] text-[#747987]"><tr><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide">Resident</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide">Equipment</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide">Barangay</th><th className="px-3 py-3 text-[10px] font-bold uppercase tracking-wide">Status</th></tr></thead><tbody>{recent.map((row) => <tr className="border-t border-[#eee6da] transition hover:bg-[#fcfaf6]" key={row.id}><td className="px-3 py-3 font-semibold text-[#273148]">{row.requesterName}</td><td className="px-3 py-3">{row.equipmentName}</td><td className="px-3 py-3">{row.barangayName}</td><td className="px-3 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${row.status === 'approved' ? 'bg-green-100 text-green-800' : row.status === 'rejected' || row.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-900'}`}>{row.status}</span></td></tr>)}</tbody></table></div> : <div className="rounded-xl bg-[#faf7f1] px-4 py-12 text-center"><p className="text-sm font-semibold text-[#273148]">{loading ? 'Loading requests…' : 'No requests yet'}</p><p className="mt-1 text-xs text-[#858892]">{loading ? 'Fetching the latest reservation activity.' : 'New resident requests will appear here.'}</p></div>}
      </AdminPanel>
      <AdminPanel title="Requests by barangay" action={<button className="text-[10px] font-semibold text-[#900000]" onClick={() => onNavigate('reports')}>Open reports →</button>}>
        <AdminBarChart items={byBarangay} />
      </AdminPanel>
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <AdminPanel title="Barangay coverage"><div className="space-y-2">{barangays.slice(0, 5).map((row) => <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#faf7f1] px-3 py-3 text-xs"><span className="font-semibold text-[#273148]">{row.name}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${row.adminId ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>{row.adminId ? row.adminName : 'Admin needed'}</span></div>)}</div><button className="mt-4 rounded-lg px-3 py-2 text-[10px] font-bold text-[#900000] transition hover:bg-[#f7efe3]" onClick={() => onNavigate('barangays')}>Manage barangays →</button></AdminPanel>
      <AdminPanel title="Quick actions"><div className="grid gap-2 sm:grid-cols-3"><button className="rounded-xl bg-[#900000] px-3 py-3 text-left text-[11px] font-bold text-white shadow-sm transition hover:bg-[#760000]" onClick={() => onNavigate('barangays')}><span className="mb-1 block text-base">⌂</span>Manage barangays</button><button className="rounded-xl border border-[#e6ded2] bg-white px-3 py-3 text-left text-[11px] font-bold text-[#273148] transition hover:border-[#d6c8b4] hover:bg-[#faf7f1]" onClick={() => onNavigate('requests')}><span className="mb-1 block text-base text-[#900000]">◷</span>Review requests</button><button className="rounded-xl border border-[#e6ded2] bg-white px-3 py-3 text-left text-[11px] font-bold text-[#273148] transition hover:border-[#d6c8b4] hover:bg-[#faf7f1]" onClick={() => onNavigate('reports')}><span className="mb-1 block text-base text-[#900000]">▤</span>View reports</button></div></AdminPanel>
    </div>
  </>
}
