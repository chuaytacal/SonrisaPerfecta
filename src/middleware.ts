
import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/session';

// List of routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/calendario',
  '/gestion-usuario',
  '/inventario',
  '/historial-pago',
  '/recetas',
  '/catalogo',
  '/reportes',
];

// List of routes that are public (users should be redirected if logged in)
const publicRoutes = ['/login'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const sessionCookie = req.cookies.get('session')?.value;

  // Decrypt the session to check for validity
  const sessionPayload = sessionCookie ? await decrypt(sessionCookie) : null;
  const user = sessionPayload?.user;

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // If the user is trying to access a protected route without a valid session,
  // redirect them to the login page.
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // If the user is logged in, prevent them from accessing public routes like /login.
  // Also, redirect from the root path '/' to the dashboard.
  if (user && (publicRoutes.includes(path) || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
  
  // If the user is not logged in and is at the root, redirect to login
  if (!user && path === '/') {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

// Configure the middleware to run on all paths except for static assets and API routes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)'],
};
