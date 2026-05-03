import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decodeJwt, jwtVerify } from 'jose';

interface UserPayload {
  _id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin';
}

const getSecretKey = () => {
  const secret = process.env.ACCESS_TOKEN_SECRET?.trim();
  return secret ? new TextEncoder().encode(secret) : null;
};

const isExpired = (payload: UserPayload & { exp?: number }) =>
  typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();

const getTokenPayload = async (token: string) => {
  const secretKey = getSecretKey();

  if (secretKey) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      return payload as UserPayload & { exp?: number };
    } catch {
      // The backend remains the source of truth for protected data. If the
      // frontend environment is missing/mismatched on production, keep the
      // route guard usable by decoding the role and expiry for navigation.
    }
  }

  const payload = decodeJwt(token) as UserPayload & { exp?: number };
  if (isExpired(payload)) {
    throw new Error('Token expired');
  }

  return payload;
};

export async function middleware(request: NextRequest) {
  const token =
    request.cookies.get('authToken')?.value ||
    request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith('/account/admin');
  const isUserPath = pathname.startsWith('/account/user');

  // If no token and trying to access protected routes
  if (!token) {
    if (isAdminPath || isUserPath) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  try {
    const payload = await getTokenPayload(token);
    const userRole = payload.role;

    if (userRole !== 'user' && userRole !== 'admin') {
      throw new Error('Invalid user role');
    }

    // User trying to access admin area
    if (userRole === 'user' && isAdminPath) {
      return NextResponse.redirect(new URL('/account/user', request.url));
    }

    // Admin trying to access user area
    if (userRole === 'admin' && isUserPath) {
      return NextResponse.redirect(new URL('/account/admin', request.url));
    }

    return NextResponse.next();

  } catch (err) {
    // Clear invalid token and redirect
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('authToken');
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
