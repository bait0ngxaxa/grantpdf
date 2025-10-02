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

const PROTECTED_PAGES = [
    '/form',
    '/uploads-doc',
    '/userdashboard',
    '/create-word-approval', // ✅ เพิ่มหน้า create-word-doc ใน protected pages
    '/create-word-contract', // ✅ เพิ่มหน้า create-word-doc ใน protected pages
    '/create-word-formproject',
    '/create-word-tor',
    '/create-word-summary', // ✅ เพิ่มหน้า create-word-summary ใน protected pages
    '/createdocs',
];

// NEW: Array for the reset password page
const RESET_PASSWORD_PAGES = [
    '/reset-password',
];

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    });

    // Logic 1: Redirect authenticated users away from the sign-in/sign-up pages
    if (token && AUTH_PAGES.includes(pathname)) {
        console.log("User already authenticated. Redirecting from auth page to dashboard.");
        return NextResponse.redirect(new URL('/userdashboard', req.url));
    }

    // Logic 2: Protect admin pages and other protected pages
    if (ADMIN_PAGES.includes(pathname)) {
        if (!token || token.role !== 'admin') {
            console.log(`User with role '${token?.role}' tried to access admin page. Redirecting to /access-denied...`);
            return NextResponse.redirect(new URL('/access-denied', req.url));
        }
    } else if (PROTECTED_PAGES.includes(pathname)) {
        if (!token) {
            console.log(`User is not authenticated. Redirecting from '${pathname}' to /signin...`);
            const url = new URL('/signin', req.url);
            url.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(url);
        }
    }

    // NEW: Logic 3: Protect the reset password page
    // If the user tries to access the reset password page without a valid token in the URL,
    // redirect them to the forgot password page.
    if (RESET_PASSWORD_PAGES.includes(pathname)) {
        const resetToken = req.nextUrl.searchParams.get('token');
        if (!resetToken) {
            console.log("User tried to access reset password page without a token. Redirecting to forgot password...");
            return NextResponse.redirect(new URL('/forgot-password', req.url));
        }
    }

    // If none of the above conditions are met, allow the request to proceed.
    return NextResponse.next();
}

// Specify which paths the middleware should run on for efficiency.
// This now includes the new reset password page and create-word-doc page.
export const config = {
    matcher: [
        '/admin/:path*',
        '/signin',
        '/signup',
        '/form',
        '/userdashboard',
        '/uploads-doc',
        '/create-word-approval', 
        '/create-word-contract', 
        '/create-word-formproject', 
        '/create-word-tor',
        '/create-word-summary', // ✅ เพิ่มหน้า create-word-summary ใน matcher
        '/reset-password', // NEW: Add the reset password page to the matcher
        '/createdocs',
        '/' // Optional: include the homepage if you want to protect it
    ],
};