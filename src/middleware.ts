
import { NextRequest, NextResponse } from 'next/server'
 
const protectedRoutes = ['/dashboard', '/calendario', '/gestion-usuario', '/inventario', '/historial-pago', '/recetas', '/catalogo', '/reportes']
const publicRoutes = ['/login']
 
export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
 
  const session = req.cookies.get('session')?.value
 
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
 
  if (path.startsWith('/login') && session) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
  
  if (path === '/' && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }
  
  if (path === '/' && session) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }
 
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
