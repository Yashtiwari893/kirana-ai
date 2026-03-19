import { createServerClient, type CookieOptions } from '@supabase/ssr'
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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')

  // 1. If trying to access dashboard/onboarding without login -> redirect to login
  if ((isDashboardPage || isOnboardingPage) && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If already logged in and try to access login/register -> redirect to dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Logic for onboarding (check if shop setup is done)
  if (isDashboardPage && session) {
    const { data: shop } = await supabase
      .from('shops')
      .select('eleven_za_phone_id')
      .eq('user_id', session.user.id)
      .single()

    if (!shop?.eleven_za_phone_id) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding', '/login', '/register'],
}
