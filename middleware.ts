import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verify } from 'jsonwebtoken';

const PUBLIC_PATHS = ['/about', '/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow only /about, /auth/signin, and /auth/signup as public
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + '/'))) {
    return NextResponse.next();
  }
  // Check for valid session token (NextAuth)
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // Check for custom auth token
  const authToken = request.cookies.get('auth-token')?.value;
  let customTokenValid = false;
  
  if (authToken) {
    try {
      const decoded = verify(authToken, process.env.NEXTAUTH_SECRET || 'fallback-secret');
      customTokenValid = !!decoded;
    } catch (error) {
      console.error('Custom token verification failed:', error);
    }
  }
  
  if (!token && !customTokenValid) {
    // Only redirect if not already on the sign-in or sign-up page
    if (pathname !== '/auth/signin' && pathname !== '/auth/signup') {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|api/public|auth/signin|auth/signup|about|public).*)'],
}; 