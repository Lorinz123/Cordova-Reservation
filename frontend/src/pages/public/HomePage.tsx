import heroImage from '../../assets/figma/homepage-hero.png'
import type { Equipment, User } from '../../types/portal'
import EquipmentImage from '../../components/features/equipment/EquipmentImage'

type HomePageProps = {
  equipment: Equipment[]
  user: User | null
  onBrowse: () => void
  onSignIn: () => void
}

export default function HomePage({ equipment, user, onBrowse, onSignIn }: HomePageProps) {
  const barangayEquipment = user?.role === 'resident' && user.barangayId
    ? equipment.filter((item) => item.barangayId === user.barangayId).slice(0, 4)
    : []
  return <div className="overflow-hidden bg-[#fffaf2]">
    <section className="relative flex min-h-[540px] items-center overflow-hidden px-6 py-16 sm:min-h-[620px] sm:px-12 lg:px-24">
      <img className="absolute inset-0 h-full w-full object-cover object-center" src={heroImage} alt="" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#000c26]/95 via-[#000c26]/75 to-[#000c26]/20" />
      <div className="relative max-w-xl text-[#fff5e6]">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f0c47c]/30 bg-white/10 px-3 py-1.5 text-[9px] font-bold tracking-[1.5px] text-[#f0c47c] backdrop-blur">CORDOVA · COMMUNITY EQUIPMENT</p>
        <h1 className="mb-5 max-w-2xl font-serif text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Borrow barangay equipment without the paperwork.</h1>
        <p className="mb-7 max-w-lg text-sm leading-7 text-[#f8f2e9] sm:text-base">Reserve tents, chairs, tables and sound systems from your barangay in Cordova. Choose a schedule, send your request, and track the approval.</p>
        <button className="inline-flex min-h-12 items-center gap-4 rounded-xl border border-white/15 bg-[#900000] px-5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#740000] hover:shadow-xl" type="button" onClick={onBrowse}>Browse equipment <span aria-hidden="true">→</span></button>
      </div>
    </section>

    <section className="mx-auto w-[min(1240px,calc(100%-40px))] py-12 sm:py-16" aria-labelledby="popular-categories-title">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-[10px] font-bold tracking-[1.35px] text-[#900000]">BORROW FOR YOUR NEXT EVENT</p><h2 id="popular-categories-title" className="mb-2 font-serif text-3xl font-semibold text-[#000c26] sm:text-4xl">{user ? 'Equipment in your barangay' : 'Explore barangay equipment'}</h2><p className="text-sm text-[#626a79]">{user ? 'These are the actual items listed by your assigned barangay.' : 'Sign in to see the equipment available from your barangay.'}</p></div>{user && <button className="py-2 text-sm font-semibold text-[#900000] hover:underline" type="button" onClick={onBrowse}>View all equipment <span aria-hidden="true">→</span></button>}</div>
      {user ? barangayEquipment.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{barangayEquipment.map((item) => <button className="group flex flex-col gap-3 rounded-2xl border border-[#ded3c5] bg-white p-3 text-left text-[#000c26] shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#cdbb9f] hover:shadow-xl sm:p-4" key={item.id} type="button" onClick={onBrowse}>
        <span className="grid h-28 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[#faf3e9] to-[#f3e7d6] p-2 text-3xl text-[#9d8f7b] sm:h-36"><EquipmentImage imageData={item.imageData} alt={item.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" /></span>
        <span className="flex min-w-0 flex-col gap-1 px-1 pb-1"><strong className="truncate font-serif text-sm font-semibold sm:text-base">{item.name}</strong><small className="text-[10px] font-medium text-[#6f6d70]">{item.totalQuantity} available · {item.barangayName}</small></span>
      </button>)}</div> : <div className="rounded-lg border border-dashed border-[#d9cdbb] bg-[#fffaf2] px-6 py-10 text-center"><p className="font-serif text-lg font-semibold text-[#000c26]">No equipment listed yet</p><p className="mt-2 text-xs text-[#626a79]">Your barangay’s equipment will appear here when it is added.</p></div>
      : <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">{Array.from({length:4},(_,index)=><button key={index} type="button" onClick={onSignIn} className="group flex flex-col gap-3 rounded-2xl border border-[#ded3c5] bg-white p-3 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl sm:p-4"><span className="grid h-28 place-items-center rounded-xl bg-gradient-to-br from-[#f3ede4] to-[#eae0d2] text-3xl text-[#aa9e8e] sm:h-36"><span aria-hidden="true">▣</span></span><span className="flex flex-col gap-1 px-1 pb-1"><strong className="font-serif text-sm font-semibold text-[#000c26]">Barangay equipment</strong><small className="text-[10px] text-[#6f6d70]">Sign in to view local items</small></span></button>)}</div>}
    </section>

    <section className="bg-[#000c26] px-5 py-12 text-[#fff5e6] sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-6xl">
        <p className="mb-3 text-center text-[10px] font-bold tracking-[1.35px] text-[#e5bb78]">SIMPLE AND COMMUNITY-LED</p><h2 className="text-center font-serif text-4xl font-semibold sm:text-5xl">How it works</h2>
        <div className="my-10 grid grid-cols-1 gap-8 text-center md:my-12 md:grid-cols-3 md:gap-12">
          <article><span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-[#bd9d6b] text-xs text-[#f0c47c]">01</span><h3 className="my-3 font-serif text-xl font-semibold">Create an account</h3><p className="mx-auto max-w-xs text-xs leading-relaxed text-[#d5d7dd]">Register with your email and verify it once to get started.</p></article>
          <article><span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-[#bd9d6b] text-xs text-[#f0c47c]">02</span><h3 className="my-3 font-serif text-xl font-semibold">Choose what you need</h3><p className="mx-auto max-w-xs text-xs leading-relaxed text-[#d5d7dd]">Select equipment, quantity, and the dates for your event.</p></article>
          <article><span className="mx-auto grid h-9 w-9 place-items-center rounded-full border border-[#bd9d6b] text-xs text-[#f0c47c]">03</span><h3 className="my-3 font-serif text-xl font-semibold">Pick it up</h3><p className="mx-auto max-w-xs text-xs leading-relaxed text-[#d5d7dd]">Your barangay reviews the request and helps coordinate pickup.</p></article>
        </div>
        <div className="relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-lg border border-[#526078] p-7 sm:min-h-48 sm:flex-row sm:items-center sm:px-10"><img className="absolute inset-0 h-full w-full object-cover object-[center_70%]" src={heroImage} alt="" /><div className="absolute inset-0 bg-gradient-to-r from-[#000c26]/95 to-[#000c26]/65" /><div className="relative"><p className="mb-2 text-[10px] font-bold tracking-[1.35px] text-[#f0c47c]">READY TO BORROW?</p><h3 className="max-w-2xl font-serif text-2xl font-semibold sm:text-3xl">Pick your date and items. It only takes a few minutes.</h3></div><button className="relative min-h-11 rounded-md bg-[#fff5e6] px-5 text-sm font-bold text-[#000c26] hover:bg-[#e9d9bf]" type="button" onClick={user ? onBrowse : onSignIn}>{user ? 'Browse equipment' : 'Sign in to get started'}</button></div>
      </div>
    </section>
  </div>
}
