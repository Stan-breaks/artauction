import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Add routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/',
  '/artworks',
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/me'
];

// Check if the route is public
function isPublicRoute(path: string) {
  return publicRoutes.some(route => path.startsWith(route));
}

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Allow public routes
  if (isPublicRoute(path)) {
    return NextResponse.next();
  }

  // Get the token from the cookies
  const token = request.cookies.get('token')?.value;

  if (!token) {
    // If it's an API route, return 401
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // For other routes, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  try {
    // Verify token
    await verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    // If token is invalid
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    // Clear the invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|uploads).*)',
  ],
}; 