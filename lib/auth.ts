// lib/auth.ts — Auth.js v5 configuration
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { User } from "next-auth";
import { createRateLimitKey, getClientIP, rateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT, SESSION } from "@/lib/constants";

export const { auth, handlers, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "john@doe.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                if (
                    !credentials?.email ||
                    typeof credentials.email !== "string" ||
                    !credentials?.password ||
                    typeof credentials.password !== "string"
                ) {
                    return null;
                }

                // Dynamic import to avoid issues with server-side module
                const { logAudit } = await import("@/lib/auditLog");
                const ip = getClientIP(request);
                const signInRateLimit = rateLimit(
                    createRateLimitKey(
                        request,
                        RATE_LIMIT.AUTH.SIGNIN.ROUTE_KEY,
                        credentials.email
                    ),
                    RATE_LIMIT.AUTH.SIGNIN.LIMIT,
                    RATE_LIMIT.AUTH.SIGNIN.WINDOW_MS
                );

                if (!signInRateLimit.success) {
                    logAudit("LOGIN_FAILED", null, {
                        details: {
                            attemptedEmail: credentials.email,
                            reason: "rate_limited",
                        },
                        ip,
                    });
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (
                    user &&
                    (await bcrypt.compare(credentials.password, user.password))
                ) {
                    // Log successful login
                    logAudit("LOGIN_SUCCESS", String(user.id), {
                        userEmail: user.email,
                        ip,
                    });

                    const authorizedUser: User = {
                        id: String(user.id),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                    return authorizedUser;
                } else {
                    // Log failed login attempt
                    logAudit("LOGIN_FAILED", null, {
                        details: { attemptedEmail: credentials.email },
                        ip,
                    });
                    return null;
                }
            },
        }),
    ],

    // Use JWT strategy for session management
    session: {
        strategy: "jwt",
        maxAge: SESSION.MAX_AGE_SECONDS,
    },

    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id as string;
                token.role = user.role;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
});
