// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const ADMIN_PAGES = [
  '/admin',
  '/admin/dashboard',
  '/admin/users',
];

const AUTH_PAGES = [
  '/signin',
  '/signup',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Logic 1: Redirect authenticated users away from the sign-in/sign-up pages
  // If a user has a token AND is trying to access a sign-in or sign-up page,
  // redirect them to their profile page.
  if (token && AUTH_PAGES.includes(pathname)) {
    console.log("User already authenticated. Redirecting from auth page to profile page.");
    return NextResponse.redirect(new URL('/userdashboard', req.url));
  }

  // Logic 2: Protect admin pages
  // If the user is trying to access an admin page...
  if (ADMIN_PAGES.includes(pathname)) {
    // ...check if they have a token AND if their role is 'admin'.
    // If not, redirect them to the access denied page.
    if (!token || token.role !== 'admin') {
      console.log(`User with role '${token?.role}' tried to access admin page. Redirecting to /access-denied...`);
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
  }

  // If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

// Specify which paths the middleware should run on for efficiency.
// This includes all admin pages and the sign-in/sign-up pages.
export const config = {
  matcher: [
    '/admin/:path*',
    '/signin',
    '/signup',
  ],
};