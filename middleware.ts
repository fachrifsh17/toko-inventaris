import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');
  const { pathname } = request.nextUrl;

  // Halaman privat yang membutuhkan login admin
  const privateRoutes = [
    '/dashboard',
    '/admin-dan-saldo',
    '/banners',
    '/edit-profile',
    '/pengaturan',
    '/produk',
    '/rekap',
    '/rekap-saldo',
    '/riwayat-keluar',
    '/riwayat-masuk',
    '/saldo-masuk',
    '/transaksi-digital',
    '/user'
  ];

  const isAccessingPrivateRoute = privateRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // 1. PROTEKSI: Cek akses halaman privat
  if (isAccessingPrivateRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. LOGIKA INACTIVITY TIMEOUT:
    // Jika ada session dan sedang akses halaman privat, perpanjang masa aktif cookie
    const response = NextResponse.next();
    response.cookies.set('user_session', session.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: 'lax',
      maxAge: 60 * 60 * 3, // Reset ke 3 jam setiap ada aktivitas di halaman privat
    });
    return response;
  }

  // 3. REDIRECT: Jika sudah login tapi akses /login, lempar ke dashboard
  if (pathname === '/login') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/dashboard/:path*',
    '/admin-dan-saldo/:path*',
    '/banners/:path*',
    '/edit-profile/:path*',
    '/pengaturan/:path*',
    '/produk/:path*',
    '/rekap/:path*',
    '/rekap-saldo/:path*',
    '/riwayat-keluar/:path*',
    '/riwayat-masuk/:path*',
    '/saldo-masuk/:path*',
    '/transaksi-digital/:path*',
    '/user/:path*'
  ],
};