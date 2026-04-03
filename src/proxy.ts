// src/proxy.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// The function name MUST be 'proxy' now
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Defensive check: handle case sensitivity and whitespace
    const userRole = String(profile?.role || 'guest').toLowerCase().trim()
    
    console.log(`[PROXY CHECK] User: ${user.email} | Role: ${userRole}`)

    if (userRole !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/vault'
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}