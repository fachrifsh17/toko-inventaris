// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');

  // Jika mencoba akses dashboard tapi tidak ada session, lempar ke login
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Jika sudah login tapi mencoba akses halaman login, lempar ke dashboard
  if (request.nextUrl.pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Konfigurasi path mana saja yang dipantau oleh middleware
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};