// src/components/auth/LogoutButton.tsx
"use client"

import { createClient } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    // Refresh forces the middleware to re-run and redirect unauthorized users
    router.refresh()
    router.push("/login")
  }

  return (
    <button 
      onClick={handleLogout}
      className="hover:opacity-40 transition-opacity text-red-500/70 hover:text-red-500"
      title="Terminate Session"
    >
      [ LOGOUT ]
    </button>
  )
}