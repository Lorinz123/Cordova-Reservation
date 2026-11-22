import { useMemo, useState } from 'react'
import type { Barangay, Equipment } from '../../types/portal'
import { AdminPageTitle, AdminPanel, AdminStatCard } from '../../components/features/admin/DashboardPrimitives'

export default function SuperAdminEquipmentPage({ equipment, barangays }: { equipment: Equipment[]; barangays: Barangay[] }) {
  const [query, setQuery] = useState('')
  const [barangay, setBarangay] = useState('all')
  const rows = useMemo(() => equipment.filter((item) => `${item.name} ${item.description ?? ''} ${item.barangayName}`.toLowerCase().includes(query.toLowerCase()) && (barangay === 'all' || item.barangayId === barangay)), [equipment, query, barangay])
  const totalUnits = equipment.reduce((sum, item) => sum + item.totalQuantity, 0)
  return <>
    <AdminPageTitle eyebrow="Municipal administration" title="Equipment" subtitle="View the active equipment catalogue across every barangay." />
    <div className="mb-5 grid gap-3 sm:grid-cols-3"><AdminStatCard label="Equipment types" value={equipment.length} note="Active catalogue records" icon="▣" /><AdminStatCard label="Total units" value={totalUnits} note="Units listed across barangays" icon="▤" /><AdminStatCard label="Communities" value={new Set(equipment.map((item) => item.barangayId)).size} note="Barangays with equipment" icon="⌂" /></div>
    <AdminPanel title="Equipment catalogue">
      <div className="mb-4 grid gap-2 sm:grid-cols-2"><input aria-label="Search equipment" className="min-h-10 rounded border border-[#ded6ca] bg-white px-3 text-xs" placeholder="Search equipment name or barangay" value={query} onChange={(event) => setQuery(event.target.value)} /><select aria-label="Filter equipment by barangay" className="min-h-10 rounded border border-[#ded6ca] bg-white px-3 text-xs" value={barangay} onChange={(event) => setBarangay(event.target.value)}><option value="all">All barangays</option>{barangays.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-[10px]"><thead className="bg-[#f7efe3] text-[#646b78]"><tr>{['Item','Description','Barangay','Quantity','Added'].map((label) => <th key={label} className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{rows.map((item) => <tr key={item.id} className="border-b border-[#eee6da] last:border-0"><td className="px-3 py-3"><div className="flex items-center gap-2">{item.imageData ? <img className="h-10 w-12 rounded object-cover" src={item.imageData} alt="" /> : <span className="grid h-10 w-12 place-items-center rounded bg-[#eee6da] text-[#8c8170]">▣</span>}<span className="font-semibold text-[#253047]">{item.name}</span></div></td><td className="max-w-[240px] px-3 py-3 text-[#717680]">{item.description || '—'}</td><td className="px-3 py-3">{item.barangayName}</td><td className="px-3 py-3">{item.totalQuantity}</td><td className="px-3 py-3">{new Date(item.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table>{!rows.length && <p className="py-12 text-center text-xs text-[#858892]">No equipment matches this search.</p>}</div>
    </AdminPanel>
  </>
}
