"use client"

import LogoutButton from '@/components/auth/LogoutButton'

interface NavbarProps {
  bandName: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  bucketUrl: string
}

export default function Navbar({ bandName, logoUrl, primaryColor, secondaryColor, bucketUrl }: NavbarProps) {
  return (
    <nav 
      className="sticky top-0 z-50 p-6 md:px-12 flex justify-between items-center border-b border-current border-opacity-10 backdrop-blur-md bg-opacity-10" 
      style={{ backgroundColor: secondaryColor, color: primaryColor }}
    >
      <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">
        {logoUrl ? (
          <img src={`${bucketUrl}${logoUrl}`} alt={bandName} className="h-8 w-auto" />
        ) : bandName}
      </h1>
      
      <div className="flex items-center gap-6 md:gap-10 text-[10px] uppercase font-bold tracking-[0.3em]">
        <a href="#music" className="hidden sm:block hover:opacity-40 transition-opacity">Audio</a>
        <a href="#merch" className="hidden sm:block hover:opacity-40 transition-opacity">Boutique</a>
        <a href="#tour" className="hidden sm:block hover:opacity-40 transition-opacity">Circuit</a>
        <LogoutButton />
      </div>
    </nav>
  )
}