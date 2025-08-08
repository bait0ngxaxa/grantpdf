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

// FIX: New array for pages that require authentication
const PROTECTED_PAGES = [
  '/form',
  '/test-field',
  '/upload',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Logic 1: Redirect authenticated users away from the sign-in/sign-up pages
  // If a user has a token AND is trying to access a sign-in or sign-up page,
  // redirect them to their user dashboard page.
  if (token && AUTH_PAGES.includes(pathname)) {
    console.log("User already authenticated. Redirecting from auth page to dashboard.");
    return NextResponse.redirect(new URL('/userdashboard', req.url));
  }

  // Logic 2: Protect admin pages and other protected pages
  // This is the core logic. It will check if the user is authorized to view certain pages.
  if (ADMIN_PAGES.includes(pathname)) {
    // If the user is trying to access an admin page...
    // ...check if they have a token AND if their role is 'admin'.
    // If not, redirect them to the access denied page.
    if (!token || token.role !== 'admin') {
      console.log(`User with role '${token?.role}' tried to access admin page. Redirecting to /access-denied...`);
      return NextResponse.redirect(new URL('/access-denied', req.url));
    }
  } else if (PROTECTED_PAGES.includes(pathname)) {
    // FIX: Check if user is trying to access a protected page...
    // ...and they DON'T have a token. If so, redirect them to the sign-in page.
    if (!token) {
      console.log(`User is not authenticated. Redirecting from '${pathname}' to /signin...`);
      const url = new URL('/signin', req.url);
      url.searchParams.set('callbackUrl', pathname); // Optional: add a callback URL
      return NextResponse.redirect(url);
    }
  }

  // If none of the above conditions are met, allow the request to proceed.
  return NextResponse.next();
}

// Specify which paths the middleware should run on for efficiency.
// This now includes the new protected pages.
export const config = {
  matcher: [
    '/admin/:path*',
    '/signin',
    '/signup',
    '/form',
    '/test-field',
    '/upload',
    '/' // Optional: include the homepage if you want to protect it
  ],
};