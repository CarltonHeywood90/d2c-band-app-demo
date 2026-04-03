// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isVaultRoute = request.nextUrl.pathname.startsWith('/vault')

  // 2. If NOT logged in and trying to hit protected areas
  if (!user && (isDashboardRoute || isVaultRoute)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. If logged in, check the ROLE
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // BAND PROTECTION: Only 'admin' can enter /dashboard
    if (isDashboardRoute && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/vault', request.url))
    }

    // LOGGED IN USERS: Prevent logged-in users from seeing the /login page
    if (request.nextUrl.pathname === '/login') {
      const destination = profile?.role === 'admin' ? '/dashboard' : '/vault'
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}