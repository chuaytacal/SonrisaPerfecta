
import { NextRequest, NextResponse } from 'next/server';

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

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const session = req.cookies.get('session')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));

  // If the user is trying to access a protected route without a session,
  // redirect them to the login page.
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // If the user is logged in, prevent them from accessing public routes like /login.
  // Also, redirect from the root path '/' to the dashboard.
  if (session && (publicRoutes.includes(path) || path === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
  
  // If the user is not logged in and is at the root, redirect to login
  if (!session && path === '/') {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
}

// Configure the middleware to run on all paths except for static assets and API routes.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|favicon.ico).*)'],
};
