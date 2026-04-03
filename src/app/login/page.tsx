"use client"

import { createClient } from "@/lib/supabase-client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      if (mode === "signup") {
        // --- SIGN UP LOGIC ---
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // This ensures that after they verify email (if enabled), they land back here
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) throw error

        if (data.user) {
          alert("Credentials Initialized. Please check your email to verify (if required) or switch to login mode.")
          setMode("login")
        }
      } else {
        // --- LOGIN LOGIC ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          // Force a router refresh so middleware recognizes the new session
          router.refresh()

          // Fetch the role from our public.profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single()

          if (profileError) {
            console.error("Profile sync delay:", profileError)
            // If profile hasn't propagated yet, we default to vault for safety
            router.push("/vault")
            return
          }

          // THE REDIRECT LOGIC
          if (profile?.role === 'admin') {
            router.push("/dashboard")
          } else {
            router.push("/vault")
          }
        }
      }
    } catch (err: unknown) {
      const msg = (err as Error).message || "An authentication error occurred."
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-white selection:text-black">
      <div className="max-w-sm w-full space-y-8">
        
        {/* MODE TOGGLE */}
        <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 shadow-xl">
          <button 
            type="button"
            onClick={() => { setMode("login"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-widest transition-all rounded ${
              mode === 'login' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Existing_User
          </button>
          <button 
            type="button"
            onClick={() => { setMode("signup"); setErrorMsg(null); }}
            className={`flex-1 py-2 text-[10px] font-mono uppercase tracking-widest transition-all rounded ${
              mode === 'signup' ? 'bg-white text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            New_Personnel
          </button>
        </div>

        <form onSubmit={handleAuth} className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 shadow-2xl relative overflow-hidden">
          {/* Subtle progress bar for loading state */}
          {loading && <div className="absolute top-0 left-0 h-1 bg-white animate-pulse w-full" />}

          <h1 className="text-xl font-black uppercase tracking-tighter text-white mb-2">
            {mode === "login" ? "Authentication_Required" : "Create_Credentials"}
          </h1>
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-8">
            {mode === "login" ? "Level 2 clearance detected" : "Defaulting to role: fan"}
          </p>

          {errorMsg && (
            <div className="text-red-500 text-[10px] font-mono mb-6 border border-red-500/30 p-3 bg-red-500/5 rounded">
              <span className="block font-bold mb-1 underline">ERROR_LOG:</span>
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-600 ml-1 uppercase">Identification</label>
              <input 
                required 
                type="email" 
                placeholder="EMAIL_ADDR" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded font-mono text-xs text-white outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-600 ml-1 uppercase">Security_Key</label>
              <input 
                required 
                type="password" 
                placeholder="PASSWORD" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border border-zinc-800 p-3 rounded font-mono text-xs text-white outline-none focus:border-zinc-500 transition-colors"
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-4 rounded-lg mt-8 hover:bg-zinc-200 active:scale-[0.98] transition-all uppercase text-xs tracking-[0.3em] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "PROCESSING..." : mode === "login" ? "AUTHORIZE_ACCESS" : "INITIALIZE_PROFILE"}
          </button>
        </form>

        <p className="text-center text-[9px] font-mono text-zinc-700 uppercase">
          Unauthorized access is logged. <br /> Sovereign Control v2.4.0
        </p>
      </div>
    </div>
  )
}