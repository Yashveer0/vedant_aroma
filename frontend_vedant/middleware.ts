import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

interface UserPayload {
  _id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
}

const getSecretKey = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables!');
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware - Token:', token ? 'Present' : 'Not found');
  console.log('Middleware - Path:', pathname);

  const isAdminPath = pathname.startsWith('/account/admin');
  const isUserPath = pathname.startsWith('/account/user');

  // If no token and trying to access protected routes
  if (!token) {
    if (isAdminPath || isUserPath) {
      console.log('No token - redirecting to login');
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const { payload } = await jwtVerify(token, getSecretKey()) as { payload: UserPayload };
    const userRole = payload.role;
    
    console.log('Middleware - User role:', userRole);
    console.log('Middleware - Is admin path:', isAdminPath);
    console.log('Middleware - Is user path:', isUserPath);

    // User trying to access admin area
    if (userRole === 'user' && isAdminPath) {
      console.log('User trying to access admin - redirecting to user area');
      return NextResponse.redirect(new URL('/account/user', request.url));
    }

    // Admin trying to access user area (optional - you might want to allow this)
    if (userRole === 'admin' && isUserPath) {
      console.log('Admin trying to access user area - redirecting to admin');
      return NextResponse.redirect(new URL('/account/admin', request.url));
    }

    console.log('Middleware - Access granted');
    return NextResponse.next();

  } catch (err) {
    console.error('Token verification failed:', err);
    
    // Clear invalid token and redirect
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('accessToken');
    
    return response;
  }
}

export const config = {
  matcher: [
    '/account/admin/:path*',
    '/account/user/:path*',
  ],
};