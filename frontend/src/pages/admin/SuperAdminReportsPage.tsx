import { useMemo, useState } from 'react'
import type { BarangayManagementSummary, Equipment, Reservation } from '../../types/portal'
import { AdminBarChart, AdminPageTitle, AdminPanel, AdminStatCard } from '../../components/features/admin/DashboardPrimitives'

export default function SuperAdminReportsPage({ barangays, reservations, equipment }: { barangays: BarangayManagementSummary[]; reservations: Reservation[]; equipment: Equipment[] }) {
  const [period, setPeriod] = useState('all')
  const filtered = useMemo(() => {
    if (period === 'all') return reservations
    const days = Number(period)
    const cutoff = Date.now() - days * 86_400_000
    return reservations.filter((row) => Date.parse(row.createdAt) >= cutoff)
  }, [reservations, period])
  const counts = (key: 'pending'|'approved'|'rejected'|'cancelled') => filtered.filter((item) => item.status === key).length
  const requestBars = barangays.map((item) => ({ label: item.name, value: filtered.filter((request) => request.barangayId === item.id).length })).sort((a,b) => b.value-a.value).slice(0, 8)
  const equipmentBars = [...new Set(filtered.map((item) => item.equipmentName))].map((name) => ({ label: name, value: filtered.filter((item) => item.equipmentName === name).length })).sort((a,b) => b.value-a.value).slice(0, 8)
  const statusBars = ['Pending','Approved','Rejected','Cancelled'].map((label) => ({ label, value: counts(label.toLowerCase() as 'pending'|'approved'|'rejected'|'cancelled') }))
  const inventoryBars = barangays.map((item) => ({ label: item.name, value: equipment.filter((row) => row.barangayId === item.id).reduce((sum,row) => sum + row.totalQuantity, 0) })).sort((a,b) => b.value-a.value).slice(0, 8)
  function exportCsv() {
    const quote = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
    const header = ['Requester','Email','Equipment','Barangay','Quantity','Start','End','Status','Submitted']
    const lines = filtered.map((row) => [row.requesterName,row.requesterEmail,row.equipmentName,row.barangayName,row.quantity,row.startsAt,row.endsAt,row.status,row.createdAt].map(quote).join(','))
    const blob = new Blob([[header.map(quote).join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `cordova-reservations-${new Date().toISOString().slice(0,10)}.csv`; anchor.click(); URL.revokeObjectURL(url)
  }
  return <>
    <AdminPageTitle eyebrow="Municipal administration" title="Reports" subtitle="Reservation activity and equipment availability across barangays." action={<div className="flex gap-2"><select aria-label="Report date range" className="min-h-9 rounded border border-[#ded6ca] bg-white px-2 text-[10px]" value={period} onChange={(event) => setPeriod(event.target.value)}><option value="all">All time</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option></select><button onClick={exportCsv} className="rounded bg-[#900000] px-3 py-2 text-[10px] font-semibold text-white">Export CSV</button></div>} />
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Requests in period" value={filtered.length} note="All reservation statuses" icon="▤" /><AdminStatCard label="Approved" value={counts('approved')} note="Requests accepted" icon="✓" /><AdminStatCard label="Pending review" value={counts('pending')} note="Awaiting a decision" icon="◷" /><AdminStatCard label="Approval rate" value={filtered.length ? `${Math.round(counts('approved') / filtered.length * 100)}%` : '0%'} note="Approved out of all requests" icon="%" /></div>
    <div className="grid gap-5 xl:grid-cols-2"><AdminPanel title="Requests by barangay"><AdminBarChart items={requestBars} /></AdminPanel><AdminPanel title="Most requested equipment"><AdminBarChart items={equipmentBars} emptyMessage="No equipment requests in this period." /></AdminPanel><AdminPanel title="Request status"><AdminBarChart items={statusBars} /></AdminPanel><AdminPanel title="Available units by barangay"><AdminBarChart items={inventoryBars} emptyMessage="No equipment has been added yet." /></AdminPanel></div>
  </>
}
