import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function proxy(request) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_SUPABASE_URL,
        process.env.NEXT_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value, options))
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser();

    if (user && request.nextUrl.pathname.startsWith('/login') ) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    if (!user && request.nextUrl.pathname.startsWith('/admin/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }


    return response
}



export const config = {
  matcher: ['/login', '/admin/:path*'],
}