"use client"

import { useState } from "react"
import MusicTab from "@/components/admin/MusicTab"
import MerchTab from "@/components/admin/MerchTab"
import EventsTab from "@/components/admin/EventsTab"
import IdentityTab from "@/components/admin/IdentityTab"
import LivePreview from "@/components/admin/LivePreview"
import LogoutButton from "@/components/auth/LogoutButton"

export default function BandDashboard() {
  const [activeTab, setActiveTab] = useState("identity")
  
  const [siteSettings, setSiteSettings] = useState({
    band_name: "Ontology",
    primary_color: "#ffffff",
    secondary_color: "#000000",
    bio: "The praxis of sound."
  })

  return (
    <div className="flex h-screen bg-black overflow-hidden selection:bg-white selection:text-black">
      
      {/* --- ADMIN CONTROLS --- */}
      {/* Changed: w-full by default, w-[60%] on large screens only */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-4 md:p-8 lg:border-r border-zinc-900 custom-scrollbar">
        
        <header className="mb-8 flex justify-between items-center">
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none">
              Sovereign Control
            </h1>
            <p className="text-[9px] md:text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Admin Interface // v2.4.0
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block h-2 w-2 rounded-full bg-green-500 animate-pulse" title="System Active" />
            <LogoutButton />
          </div>
        </header>

        {/* Scrollable Navigation for small screens */}
        <nav className="flex gap-2 mb-8 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
          {["identity", "music", "merch", "events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-5 py-2 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all border whitespace-nowrap ${
                activeTab === tab 
                  ? "bg-white text-black border-white" 
                  : "text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <main className="pb-20"> {/* Extra padding for mobile comfort */}
          {activeTab === "identity" && (
            <IdentityTab settings={siteSettings} setSettings={setSiteSettings} />
          )}
          {activeTab === "music" && <MusicTab />}
          {activeTab === "merch" && <MerchTab />}
          {activeTab === "events" && <EventsTab />}
        </main>
      </div>

      {/* --- LIVE PREVIEW (Desktop Only) --- */}
      {/* Changed: added 'hidden lg:flex' to hide on mobile entirely */}
      <div className="hidden lg:flex w-[40%] h-full bg-zinc-950 flex-col p-8 items-center justify-center relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
        
        <div className="text-[10px] font-mono text-zinc-700 mb-6 uppercase tracking-[0.5em]">
          Live Viewport Output
        </div>
        
        <div className="w-full max-w-[320px] aspect-[9/19] bg-black rounded-[3rem] border-[12px] border-zinc-900 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] relative ring-1 ring-zinc-800">
            <LivePreview data={siteSettings} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50" />
        </div>
      </div>
    </div>
  )
}