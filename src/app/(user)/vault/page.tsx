/* eslint-disable react/jsx-no-comment-textnodes */
import { 
  getProjectIdentity, 
  getMusicLibrary, 
  getMerchInventory, 
  getTourCircuit 
} from '@/lib/data'
import MusicPlayer from '@/components/public/MusicPlayer'
import MerchCard from '@/components/public/MerchCard'
import EventRow from '@/components/public/EventRow'
import Navbar from '@/components/layout/Navbar'

export default async function HomePage() {
  const [identity, tracks, merch, events] = await Promise.all([
    getProjectIdentity(),
    getMusicLibrary(),
    getMerchInventory(),
    getTourCircuit()
  ])

  if (!identity) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-12">
        <div className="text-zinc-500 font-mono text-xs uppercase tracking-[0.5em] animate-pulse">
          Initializing Praxis...
        </div>
      </div>
    )
  }

  const IDENTITY_BUCKET = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/identity/`

  return (
    <main 
      className="min-h-screen transition-colors duration-1000 selection:bg-current selection:text-black"
      style={{ 
        backgroundColor: identity.secondary_color, 
        color: identity.primary_color,
        '--accent': identity.primary_color 
      } as React.CSSProperties}
    >
      <Navbar 
        bandName={identity.band_name}
        logoUrl={identity.logo_url}
        primaryColor={identity.primary_color}
        secondaryColor={identity.secondary_color}
        bucketUrl={IDENTITY_BUCKET}
      />

      {/* Hero Section */}
      <section className="relative h-[80vh] flex flex-col items-center justify-center px-6 overflow-hidden">
        {identity.banner_url && (
          <img 
            src={`${IDENTITY_BUCKET}${identity.banner_url}`} 
            className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
            alt="Hero Banner"
          />
        )}
        <div className="relative z-10 text-center max-w-4xl">
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.85] mb-10 drop-shadow-2xl">
            {identity.band_name}
          </h2>
          <div className="w-20 h-1 bg-current mx-auto mb-10 opacity-30" />
          <p className="text-sm md:text-lg font-medium leading-relaxed max-w-xl mx-auto opacity-70 italic font-serif">
            {identity.bio || "The convergence of ontology, epistemology, and praxis."}
          </p>
        </div>
      </section>

      {/* Audio Section */}
      <section id="music" className="p-8 md:p-24 border-t border-current border-opacity-10">
        <header className="flex justify-between items-end mb-16">
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">The Vault</h3>
          <span className="font-mono text-[10px] opacity-40 uppercase tracking-widest">Opus Count: {tracks.length}</span>
        </header>
        <div className="grid grid-cols-1 gap-4">
          {tracks.length > 0 ? (
            tracks.map((track) => <MusicPlayer key={track.id} track={track} />)
          ) : (
            <p className="opacity-30 italic py-10 font-mono text-xs">No active transmissions...</p>
          )}
        </div>
      </section>

      {/* Merch Section */}
      <section id="merch" className="p-8 md:p-24 border-t border-current border-opacity-10">
        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-16 text-right">Boutique</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
          {merch.length > 0 ? (
            merch.map((item) => <MerchCard key={item.id} item={item} />)
          ) : (
            <p className="opacity-30 italic py-10 font-mono text-xs col-span-full">Inventory depleted...</p>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section id="tour" className="p-8 md:p-24 border-t border-current border-opacity-10">
        <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-16">The Circuit</h3>
        <div className="border border-current border-opacity-10 rounded-2xl overflow-hidden backdrop-blur-sm">
          {events.length > 0 ? (
            events.map((event) => <EventRow key={event.id} event={event} />)
          ) : (
            <div className="p-20 text-center opacity-30 italic font-mono text-xs uppercase tracking-[0.2em]">
              No active routing in the current sequence.
            </div>
          )}
        </div>
      </section>

      <footer className="p-12 md:p-24 border-t border-current border-opacity-10 text-center space-y-6">
        <div className="text-[10px] uppercase font-bold tracking-[0.5em] opacity-30">
          © 2026 {identity.band_name} // Managed via Sovereign Control
        </div>
        <div className="flex justify-center gap-4 text-xs font-mono opacity-20">
          <span>{new Date().toLocaleTimeString()} MST</span>
          <span>40.0336° N, 111.7324° W</span>
        </div>
      </footer>
    </main>
  )
}