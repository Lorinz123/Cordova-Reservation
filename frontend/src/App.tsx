import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from './components/context/use-auth'
import PortalHeader from './components/common/PortalHeader'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import VerifyEmailPage from './pages/auth/VerifyEmailPage'
import EquipmentPage from './pages/user/EquipmentPage'
import ReservationForm from './components/features/reservations/ReservationForm'
import MyReservationsPage from './pages/user/MyReservationsPage'
import NotificationsPage from './pages/user/NotificationsPage'
import ProfilePage from './pages/user/ProfilePage'
import ReservationRequestsPage from './pages/admin/ReservationRequestsPage'
import SuperAdminPage from './pages/admin/SuperAdminPage'
import MunicipalAdminLayout from './components/features/admin/MunicipalAdminLayout'
import SuperAdminOverviewPage from './pages/admin/SuperAdminOverviewPage'
import SuperAdminRequestsPage from './pages/admin/SuperAdminRequestsPage'
import SuperAdminEquipmentPage from './pages/admin/SuperAdminEquipmentPage'
import SuperAdminReportsPage from './pages/admin/SuperAdminReportsPage'
import BarangayAdminLayout from './components/features/admin/BarangayAdminLayout'
import BarangayAdminRequestsPage from './pages/admin/BarangayAdminRequestsPage'
import BarangayAdminCalendarPage from './pages/admin/BarangayAdminCalendarPage'
import BarangayAdminResidentsPage from './pages/admin/BarangayAdminResidentsPage'
import BarangayAdminReportsPage from './pages/admin/BarangayAdminReportsPage'
import HomePage from './pages/public/HomePage'
import { createBarangayService, getBarangaysService, getBarangayManagementService } from './services/barangay-service'
import { inviteBarangayAdminService } from './services/admin-service'
import { loginService, logoutService, registerService, resendVerificationEmailService } from './services/auth-service'
import { createEquipmentService, deleteEquipmentService, getEquipmentService, updateEquipmentService } from './services/equipment-service'
import { cancelReservationService, createReservationBatchService, getReservationsService, reviewReservationService } from './services/reservation-service'
import { getNotificationsService, markNotificationsReadService } from './services/notification-service'
import { updateProfileService } from './services/profile-service'
import { getBarangayResidentsService } from './services/resident-service'
import type { AuthMode, Barangay, BarangayAdminSection, BarangayManagementSummary, BarangayResident, Equipment, PortalNotification, Reservation, Role, SuperAdminSection } from './types/portal'

type View = 'home' | 'auth' | 'equipment' | 'reservation-form' | 'reservations' | 'requests' | 'admin' | 'reports' | 'calendar' | 'residents' | 'notifications' | 'profile'

const roleLabels: Record<Role, string> = {
  super_admin: 'Super Admin',
  barangay_admin: 'Barangay Admin',
  barangay_staff: 'Barangay Staff',
  resident: 'Resident',
}

function errorText(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read that image.'))
    reader.onerror = () => reject(new Error('Could not read that image. Please try another file.'))
    reader.readAsDataURL(file)
  })
}

function App() {
  const { user, setUser, ready: sessionReady, sessionError } = useAuth()
  const [view, setView] = useState<View>('home')
  const [authMode, setAuthMode] = useState<AuthMode>('login')
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [barangayManagement, setBarangayManagement] = useState<BarangayManagementSummary[]>([])
  const [superAdminSection, setSuperAdminSection] = useState<SuperAdminSection>('overview')
  const [barangayAdminSection, setBarangayAdminSection] = useState<BarangayAdminSection>('requests')
  const [residents, setResidents] = useState<BarangayResident[]>([])
  const [loadingResidents, setLoadingResidents] = useState(false)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [revision, setRevision] = useState(0)

  useEffect(() => { if (sessionError) setError(sessionError) }, [sessionError])

  useEffect(() => {
    let active = true
    Promise.all([getBarangaysService(), getEquipmentService()]).then(([barangayResult, equipmentResult]) => {
      if (!active) return
      setBarangays(barangayResult)
      setEquipment(equipmentResult)
    }).catch((requestError: unknown) => {
      if (active) setError(errorText(requestError))
    })
    return () => { active = false }
  }, [revision, view, user?.id])

  useEffect(() => {
    if (user?.role !== 'super_admin') { setBarangayManagement([]); return }
    let active = true
    getBarangayManagementService()
      .then((result) => { if (active) setBarangayManagement(result) })
      .catch((requestError: unknown) => { if (active) setError(errorText(requestError)) })
    return () => { active = false }
  }, [user, revision])

  useEffect(() => {
    if (user?.role !== 'barangay_admin') { setResidents([]); return }
    let active = true
    setLoadingResidents(true)
    getBarangayResidentsService()
      .then((result) => { if (active) setResidents(result) })
      .catch((requestError: unknown) => { if (active) setError(errorText(requestError)) })
      .finally(() => { if (active) setLoadingResidents(false) })
    return () => { active = false }
  }, [user, revision])

  useEffect(() => {
    if (!user || !['reservations', 'requests', 'admin', 'reports', 'calendar'].includes(view)) return
    let active = true
    setLoadingData(true)
    getReservationsService()
      .then((result) => { if (active) setReservations(result) })
      .catch((requestError: unknown) => { if (active) setError(errorText(requestError)) })
      .finally(() => { if (active) setLoadingData(false) })
    return () => { active = false }
  }, [user, view, revision])

  useEffect(() => {
    if (!user) { setNotifications([]); return }
    let active = true
    const refreshNotifications = () => {
      if (view === 'notifications') setLoadingData(true)
      getNotificationsService()
        .then((result) => { if (active) setNotifications(result) })
        .catch((requestError: unknown) => { if (active) setError(errorText(requestError)) })
        .finally(() => { if (active && view === 'notifications') setLoadingData(false) })
    }
    refreshNotifications()
    const timer = window.setInterval(refreshNotifications, 30_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [user, view])

  function showMessage(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 4500)
  }

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError(''); setNotice('')
    const values = new FormData(event.currentTarget)
    const email = String(values.get('email') || '').trim()
    try {
      if (authMode === 'verify') {
        const result = await resendVerificationEmailService(email)
        showMessage(result.message)
      } else if (authMode === 'register') {
        const result = await registerService({
          fullName: String(values.get('fullName') || ''), email,
          password: String(values.get('password') || ''),
          barangayId: String(values.get('barangayId') || ''),
        })
        showMessage(result.message || 'Account created. Check your inbox to verify your email before signing in.')
        setAuthMode('login')
      } else {
        const result = await loginService(email, String(values.get('password') || ''))
        setUser(result.data)
        setView(result.data.role === 'resident' ? 'equipment' : result.data.role === 'super_admin' ? 'admin' : 'requests')
        if (result.data.role === 'super_admin') setSuperAdminSection('overview')
        setRevision((value) => value + 1)
      }
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function signOut() {
    setBusy(true); setError('')
    try {
      await logoutService()
      setUser(null); setView('home'); setReservations([]); setSelectedEquipment([])
      setRevision((value) => value + 1)
      showMessage('You have signed out.')
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedEquipment.length) return
    setBusy(true); setError('')
    const values = new FormData(event.currentTarget)
    try {
      const startsAtDate = String(values.get('startsAtDate') || '')
      const startsAtTime = String(values.get('startsAtTime') || '')
      const endsAtDate = String(values.get('endsAtDate') || '')
      const endsAtTime = String(values.get('endsAtTime') || '')
      const startsAtLocal = new Date(`${startsAtDate}T${startsAtTime}`)
      const endsAtLocal = new Date(`${endsAtDate}T${endsAtTime}`)
      if (Number.isNaN(startsAtLocal.getTime()) || Number.isNaN(endsAtLocal.getTime())) {
        throw new Error('Choose a valid reservation date and time.')
      }
      if (startsAtLocal <= new Date()) {
        throw new Error('The reservation start time must be in the future.')
      }
      if (endsAtLocal <= startsAtLocal) {
        throw new Error('The end time must be later than the start time.')
      }

      await createReservationBatchService({
          items: selectedEquipment.map((item) => ({ equipmentId: item.id, quantity: Number(values.get(`quantity-${item.id}`)) })),
          startsAt: startsAtLocal.toISOString(),
          endsAt: endsAtLocal.toISOString(),
          purpose: String(values.get('purpose') || '').trim(),
      })
      const itemCount = selectedEquipment.length
      setSelectedEquipment([]); setView('reservations'); setRevision((value) => value + 1)
      showMessage(`Your request for ${itemCount} equipment item${itemCount === 1 ? '' : 's'} was sent to the barangay for review.`)
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function cancelReservation(reservationId: string) {
    setBusy(true); setError('')
    try {
      await cancelReservationService(reservationId)
      setRevision((value) => value + 1); showMessage('Reservation cancelled.')
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function reviewReservation(reservationId: string, status: 'approved' | 'rejected') {
    setBusy(true); setError('')
    try {
      await reviewReservationService(reservationId, status)
      setRevision((value) => value + 1); showMessage(`Reservation ${status}.`)
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function markNotificationsRead() {
    setBusy(true); setError('')
    try {
      await markNotificationsReadService()
      const readAt = new Date().toISOString()
      setNotifications((items) => items.map((item) => ({ ...item, readAt: item.readAt || readAt })))
      showMessage('All notifications marked as read.')
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true); setError('')
    const values = new FormData(event.currentTarget)
    try {
      const result = await updateProfileService({
        fullName: String(values.get('fullName') || ''),
        addressLine: String(values.get('addressLine') || ''),
        subdivision: String(values.get('subdivision') || ''),
        postalCode: String(values.get('postalCode') || ''),
        phoneNumber: String(values.get('phoneNumber') || ''),
        ...(values.get('barangayId') ? { barangayId: String(values.get('barangayId')) } : {}),
      })
      setUser(result.data)
      setRevision((value) => value + 1)
      showMessage('Your profile was updated.')
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function createEquipment(event: FormEvent<HTMLFormElement>): Promise<string | null> {
    event.preventDefault(); setBusy(true); setError('')
    const form = event.currentTarget
    const values = new FormData(form)
    try {
      const imageFile = values.get('image')
      if (!(imageFile instanceof File) || !imageFile.size) throw new Error('Choose an equipment photo first.')
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(imageFile.type)) throw new Error('Choose a PNG, JPG, or WebP image.')
      if (imageFile.size > 1_000_000) throw new Error('Choose an image smaller than 1 MB.')
      const imageData = await readImageAsDataUrl(imageFile)
      await createEquipmentService({ name: String(values.get('name') || ''), description: String(values.get('description') || ''), totalQuantity: Number(values.get('totalQuantity')), imageData })
      form.reset(); setRevision((value) => value + 1); showMessage('Equipment added to your barangay catalogue.'); return null
    } catch (requestError) { const message = errorText(requestError); setError(message); return message }
    finally { setBusy(false) }
  }

  async function updateEquipment(id: string, input: { name: string; description: string; totalQuantity: number; imageData?: string }) {
    setBusy(true); setError('')
    try { await updateEquipmentService(id, input); setRevision((value) => value + 1); showMessage('Equipment updated.'); return null }
    catch (requestError) { const message = errorText(requestError); setError(message); return message }
    finally { setBusy(false) }
  }

  async function deleteEquipment(id: string) {
    setBusy(true); setError('')
    try { await deleteEquipmentService(id); setRevision((value) => value + 1); showMessage('Equipment removed from the catalogue.'); return null }
    catch (requestError) { const message = errorText(requestError); setError(message); return message }
    finally { setBusy(false) }
  }

  async function createBarangay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    const form = event.currentTarget
    const values = new FormData(form)
    try {
      await createBarangayService(String(values.get('name') || ''))
      form.reset(); setRevision((value) => value + 1); showMessage('Barangay added.')
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  async function inviteAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('')
    const form = event.currentTarget
    const values = new FormData(form)
    try {
      const result = await inviteBarangayAdminService({ fullName: String(values.get('fullName') || ''), email: String(values.get('email') || ''), barangayId: String(values.get('barangayId') || '') })
      form.reset(); setRevision((value) => value + 1); showMessage(`${result.message || 'Invitation email sent.'} Ask the resident to check Spam if it is not in their inbox.`)
    } catch (requestError) { setError(errorText(requestError)) }
    finally { setBusy(false) }
  }

  const navItems: { view: View; label: string }[] = user?.role === 'super_admin'
    ? [{ view: 'admin', label: 'Barangays & admins' }, { view: 'requests', label: 'Reservations' }, { view: 'equipment', label: 'Equipment' }]
    : user?.role === 'barangay_admin' || user?.role === 'barangay_staff'
      ? [{ view: 'requests', label: 'Reservation requests' }, { view: 'equipment', label: 'Equipment' }]
      : [{ view: 'home', label: 'Home' }, { view: 'equipment', label: 'Equipment' }, ...(user ? [{ view: 'reservations' as const, label: 'My reservations' }] : [])]

  if (!sessionReady) return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#fff5e6] text-sm text-[#666d7b]"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#900000] font-serif font-bold text-white">CR</span><p>Connecting to Cordova Reservation Portal…</p></main>

  function navigate(viewName: string) {
    if (viewName === 'sign-in') { setAuthMode('login'); setView('auth') }
    else if (['home', 'equipment', 'reservation-form', 'reservations', 'requests', 'admin', 'reports', 'notifications', 'profile'].includes(viewName)) setView(viewName as View)
    setError('')
  }

  function selectSuperAdminSection(section: SuperAdminSection) {
    setSuperAdminSection(section)
    setView(section === 'requests' ? 'requests' : section === 'equipment' ? 'equipment' : section === 'reports' ? 'reports' : 'admin')
    setError('')
  }

  function selectBarangayAdminSection(section: BarangayAdminSection) {
    setBarangayAdminSection(section)
    setView(section === 'inventory' ? 'equipment' : section === 'calendar' ? 'calendar' : section === 'residents' ? 'residents' : section === 'reports' ? 'reports' : 'requests')
    setError('')
  }

  const superAdminContent = user?.role === 'super_admin'
    ? <MunicipalAdminLayout user={user} section={superAdminSection} onSectionChange={selectSuperAdminSection} onSignOut={signOut}>
        {error && <div className="mb-4 flex items-center justify-between gap-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}<button className="text-xl" type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
        {notice && <div className="mb-4 flex items-center justify-between gap-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{notice}<button className="text-xl" type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
        {superAdminSection === 'overview' && <SuperAdminOverviewPage barangays={barangayManagement} reservations={reservations} loading={loadingData} onNavigate={selectSuperAdminSection} />}
        {superAdminSection === 'barangays' && <SuperAdminPage barangays={barangayManagement} onCreateBarangay={createBarangay} onInviteAdmin={inviteAdmin} busy={busy} />}
        {superAdminSection === 'requests' && <SuperAdminRequestsPage reservations={reservations} loading={loadingData} busy={busy} onReview={reviewReservation} />}
        {superAdminSection === 'equipment' && <SuperAdminEquipmentPage equipment={equipment} barangays={barangays} />}
        {superAdminSection === 'reports' && <SuperAdminReportsPage barangays={barangayManagement} reservations={reservations} equipment={equipment} />}
      </MunicipalAdminLayout>
    : null

  if (user?.role === 'super_admin') return superAdminContent

  if (user?.role === 'barangay_admin') {
    const barangayName = barangays.find((item) => item.id === user.barangayId)?.name ?? 'Your barangay'
    return <BarangayAdminLayout user={user} barangayName={barangayName} section={barangayAdminSection} onSectionChange={selectBarangayAdminSection} onSignOut={signOut}>
      {error && <div className="mb-4 flex items-center justify-between gap-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}<button className="text-xl" type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
      {notice && <div className="mb-4 flex items-center justify-between gap-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{notice}<button className="text-xl" type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      {barangayAdminSection === 'requests' && <BarangayAdminRequestsPage reservations={reservations} loading={loadingData} busy={busy} onReview={reviewReservation} />}
        {barangayAdminSection === 'inventory' && <EquipmentPage equipment={equipment} user={user} selectedItems={[]} busy={busy} onSelect={() => {}} onContinueReservation={() => {}} onCreateEquipment={createEquipment} onUpdateEquipment={updateEquipment} onDeleteEquipment={deleteEquipment} />}
      {barangayAdminSection === 'calendar' && <BarangayAdminCalendarPage reservations={reservations} />}
      {barangayAdminSection === 'residents' && <BarangayAdminResidentsPage residents={residents} loading={loadingResidents} />}
      {barangayAdminSection === 'reports' && <BarangayAdminReportsPage reservations={reservations} equipment={equipment.filter((item) => item.barangayId === user.barangayId)} />}
    </BarangayAdminLayout>
  }

  return <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#fffaf2] via-[#fff5e6] to-[#f3eadc] font-sans text-[#111b31]">
    <PortalHeader user={user} currentView={view} navItems={navItems} busy={busy} unreadCount={notifications.filter((item) => !item.readAt).length} onNavigate={navigate} onSignOut={signOut} />

    <main className={view === 'home' ? 'w-full flex-1' : view === 'auth' && !user ? 'flex flex-1' : 'mx-auto my-10 w-[min(1248px,calc(100%-40px))] flex-1 space-y-6 sm:my-14 sm:w-[min(1248px,calc(100%-64px))]'}>
      {!user && view === 'auth' && authMode === 'login' && <LoginPage barangays={barangays} error={error} notice={notice} busy={busy} onModeChange={(next) => { setAuthMode(next); setError(''); setNotice('') }} onSubmit={handleAuth} />}
      {!user && view === 'auth' && authMode === 'register' && <SignupPage barangays={barangays} error={error} notice={notice} busy={busy} onModeChange={(next) => { setAuthMode(next); setError(''); setNotice('') }} onSubmit={handleAuth} />}
      {!user && view === 'auth' && authMode === 'verify' && <VerifyEmailPage barangays={barangays} error={error} notice={notice} busy={busy} onModeChange={(next) => { setAuthMode(next); setError(''); setNotice('') }} onSubmit={handleAuth} />}
      {user && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e9e1d6] bg-white/70 p-4 shadow-sm shadow-[#312515]/[0.035] sm:p-5"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#000c26] font-serif text-base font-semibold text-[#f0c47c] shadow-sm">{user.fullName.split(/\s+/).slice(0,2).map((part)=>part[0]?.toUpperCase()).join('')}</span><div className="min-w-0"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[9px] font-bold tracking-[1.2px] text-[#900000]">{roleLabels[user.role].toUpperCase()}</span>{user.barangayId && <span className="rounded-full bg-[#f4ecdf] px-2 py-0.5 text-[9px] font-medium text-[#6f7480]">{barangays.find((item) => item.id === user.barangayId)?.name || 'Your barangay'}</span>}</div><h1 className="truncate font-serif text-xl font-semibold text-[#000c26] sm:text-2xl">Welcome, {user.fullName.split(' ')[0]}</h1></div></div><p className="truncate pl-14 text-[10px] text-[#6f7480] sm:pl-0">Signed in as <strong className="font-semibold text-[#343c4b]">{user.email}</strong></p></div>}
      {view !== 'auth' && error && <div className="flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert">{error}<button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xl transition hover:bg-red-100" type="button" aria-label="Dismiss error" onClick={() => setError('')}>×</button></div>}
      {view !== 'auth' && notice && <div className="flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50/90 px-4 py-3 text-sm text-green-800 shadow-sm" role="status">{notice}<button className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xl transition hover:bg-green-100" type="button" aria-label="Dismiss message" onClick={() => setNotice('')}>×</button></div>}
      {view === 'home' && <HomePage equipment={equipment} user={user} onBrowse={() => setView('equipment')} onSignIn={() => { setAuthMode('login'); setView('auth'); setError('') }} />}
      {view === 'equipment' && <EquipmentPage equipment={equipment} user={user} selectedItems={selectedEquipment} busy={busy} onSelect={(item) => {
        if (user?.role === 'resident' && !user.addressLine?.trim()) {
          setError('Add your home address in Profile before requesting equipment.')
          setView('profile')
          return
        }
        setSelectedEquipment((items) => items.some((selected) => selected.id === item.id) ? items.filter((selected) => selected.id !== item.id) : items.length < 3 ? [...items, item] : items)
      }} onContinueReservation={() => setView('reservation-form')} onCreateEquipment={createEquipment} onUpdateEquipment={updateEquipment} onDeleteEquipment={deleteEquipment} />}
      {view === 'reservation-form' && user?.role === 'resident' && selectedEquipment.length > 0 && <ReservationForm equipment={selectedEquipment} user={user} busy={busy} onBack={() => setView('equipment')} onSubmit={submitReservation} />}
      {view === 'reservations' && user && <MyReservationsPage reservations={reservations.filter((item) => item.requesterEmail.toLowerCase() === user.email.toLowerCase())} loading={loadingData || busy} onCancel={cancelReservation} />}
      {view === 'requests' && user && <ReservationRequestsPage reservations={reservations} loading={loadingData || busy} role={user.role} onReview={reviewReservation} />}
      {view === 'notifications' && <NotificationsPage notifications={notifications} loading={loadingData} busy={busy} onMarkAllRead={markNotificationsRead} />}
      {view === 'profile' && user && <ProfilePage user={user} barangays={barangays} busy={busy} onSave={updateProfile} />}
    </main>

    {view !== 'auth' && <footer className={`flex min-h-[68px] items-center justify-center gap-2 border-t border-[#eee8df] text-[11px] text-[#878b94] ${view === 'home' ? 'mt-0 border-0 bg-[#000c26] text-[#e3e3e9]' : 'mt-12'}`}><span>Municipality of Cordova</span><span className="text-[#a2382f]">·</span><span>Reservation System</span></footer>}
  </div>
}

export default App
