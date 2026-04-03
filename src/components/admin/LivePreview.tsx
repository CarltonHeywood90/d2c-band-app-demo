"use client"

import Image from 'next/image'

interface SiteSettings {
  band_name: string
  primary_color: string
  secondary_color: string
  bio: string
  logo_preview?: string
  banner_preview?: string
  logo_url?: string
  banner_url?: string
}

export default function LivePreview({ data }: { data: SiteSettings }) {
  // Construct the base URL for your public identity bucket
  const BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/identity/`

  // Logic to determine which image to show: Local Preview first, then Cloud, then nothing.
  const logoSrc = data.logo_preview || (data.logo_url ? `${BUCKET_URL}${data.logo_url}` : null)
  const bannerSrc = data.banner_preview || (data.banner_url ? `${BUCKET_URL}${data.banner_url}` : null)

  return (
    <div 
      className="h-full w-full flex flex-col transition-all duration-700 ease-in-out font-sans"
      style={{ backgroundColor: data.secondary_color, color: data.primary_color }}
    >
      {/* Header / Logo Section */}
      <div className="p-6 flex flex-col items-center border-b border-current border-opacity-10">
        {logoSrc ? (
          <div className="h-12 w-auto mb-2 relative">
            <Image src={logoSrc} alt="Logo" fill className="object-contain" />
          </div>
        ) : (
          <span className="text-2xl font-black italic tracking-tighter uppercase">{data.band_name}</span>
        )}
      </div>

      {/* Hero / Banner */}
      <div className="relative w-full aspect-video bg-zinc-800/20 overflow-hidden">
        {bannerSrc ? (
          <Image src={bannerSrc} alt="Banner" fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10 font-mono text-[8px] uppercase tracking-[0.5em]">
            No Media Loaded
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-8 flex-1">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">
          {data.band_name}
        </h2>
        <div className="w-12 h-1 mb-6 bg-current" />
        <p className="text-[11px] leading-relaxed opacity-70 font-medium">
          {data.bio || "Input project manifesto in the identity tab to populate this field."}
        </p>
      </div>

      {/* Footer Branding */}
      <div className="p-6 text-center">
        <div className="text-[8px] uppercase tracking-[0.4em] opacity-30 font-bold">
          © 2026 {data.band_name} {/* Sovereign Audio */}
        </div>
      </div>
    </div>
  )
}