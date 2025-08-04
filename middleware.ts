// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define a list of routes that are restricted to users with the 'admin' role.
const ADMIN_PAGES = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if the requested path is an admin page
  if (pathname.startsWith('/admin')) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Check if the user is authenticated and has the 'admin' role.
    if (!token || token.role !== 'admin') {
      console.log(`User with role '${token?.role}' tried to access admin page. Redirecting to /access-denied...`);
      // FIX: Redirect to the dedicated access denied page instead of the home page.
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
