// src/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // 1. Initial Response
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // 2. Initialize Supabase SSR
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

  // 3. Get User (getUser is safer for Proxy/Middleware than getSession)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  if (isDashboard) {
    // If no user, redirect to login
    if (!user || authError) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 4. Fetch Role with error handling
    const { data: profile, error: dbError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (dbError) {
      console.error("[PROXY DB ERROR]:", dbError.message)
    }

    const userRole = String(profile?.role || 'guest').toLowerCase().trim()
    console.log(`[PROXY CHECK] ${user.email} -> Detected Role: "${userRole}"`)

    // 5. THE FIX: Redirecting while preserving cookies
    if (userRole !== 'admin') {
      const redirectUrl = new URL('/vault', request.url)
      const redirectResponse = NextResponse.redirect(redirectUrl)
      
      // Copy cookies from the 'shaken' response to the redirect response
      // Without this, the browser loses the session during the redirect
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      
      return redirectResponse
    }
  }

  return response
}

export const config = {
  // Ensure we match ALL dashboard paths
  matcher: ['/dashboard/:path*'],
}