// src/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Initialize with SERVICE_ROLE_KEY to bypass the RLS recursion loop
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Only run protection logic on /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    
    // 1. Auth Check
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 2. MASTER BYPASS (Hardcoded Email)
    // This allows you in even if the Database is having a meltdown
    if (user.email === 'brutalhonestyrelentlessdrive@gmail.com') {
      console.log("[PROXY] Sovereign Access Granted via Email Bypass.");
      return response; 
    }

    // 3. DATABASE ROLE CHECK (For everyone else)
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError) {
      console.error("[PROXY DB ERROR]:", dbError.message)
    }

    const userRole = String(profile?.role || 'guest').toLowerCase().trim()
    console.log(`[PROXY CHECK] ${user.email} -> Role: "${userRole}"`)

    // 4. AUTHORIZATION ENFORCEMENT
    if (userRole !== 'admin') {
      const redirectUrl = new URL('/vault', request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      // Sync cookies so the session isn't lost on redirect
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
      })
      
      return redirectResponse
    }
  }

  // Allow the request to continue for all other routes (Home, Vault, etc.)
  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}