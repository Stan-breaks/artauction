import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/auth/login' ||
                      path === '/auth/signup' ||
                      path === '/' ||
                      path === '/artworks' ||
                      path.startsWith('/api/auth');

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;

  // If the path is public and user is logged in, redirect to home page
  if (isPublicPath && token) {
    try {
      // Verify the token
      await verifyToken(token);

      // Only redirect login and signup pages to home
      if (path === '/auth/login' || path === '/auth/signup') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // If token is invalid, remove it
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  // If the path is protected and user is not logged in, redirect to login
  if (!isPublicPath && !token) {
    const searchParams = new URLSearchParams({
      callbackUrl: path,
    });
    return NextResponse.redirect(
      new URL(`/auth/login?${searchParams}`, request.url)
    );
  }

  // If the path is protected and user is logged in, verify the token
  if (!isPublicPath && token) {
    try {
      // Verify the token
      await verifyToken(token);
    } catch (error) {
      // If token is invalid, redirect to login
      const searchParams = new URLSearchParams({
        callbackUrl: path,
      });
      const response = NextResponse.redirect(
        new URL(`/auth/login?${searchParams}`, request.url)
      );
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes that handle authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 