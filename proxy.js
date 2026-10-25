import { NextResponse } from 'next/server'

export async function proxy(request) {
    let response = NextResponse.next({
        request: { headers: request.headers },
    })

    const dummyToken = request.cookies.get('dummy_auth_token')?.value;
    const isLoggedIn = Boolean(dummyToken);

    if (isLoggedIn && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    if (!isLoggedIn && request.nextUrl.pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return response;
}

export const config = {
  matcher: ['/login', '/admin/:path*'],
}
