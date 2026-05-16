// lib/auth.ts — Auth.js v5 configuration
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { Session, User } from "next-auth";
import { createRateLimitKey, getClientIP, rateLimit } from "@/lib/ratelimit";
import { RATE_LIMIT, SESSION } from "@/lib/constants";
import { ensureActiveSession } from "@/lib/services/sessionService/activeSession";

const { auth: nextAuthAuth, handlers, signIn, signOut } = NextAuth({
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
                const signInRateLimit = await rateLimit(
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
                        sessionVersion: user.sessionVersion,
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
                token.sessionVersion =
                    typeof user.sessionVersion === "number"
                        ? user.sessionVersion
                        : 0;
            }
            return token;
        },
        session: async ({ session, token }) => {
            if (session.user && typeof token.id === "string") {
                session.user.id = token.id;
                session.user.role = token.role as string;
                session.user.sessionVersion =
                    typeof token.sessionVersion === "number"
                        ? token.sessionVersion
                        : 0;
            }
            return session;
        },
    },

    events: {
        signOut: async (message) => {
            if (!("token" in message)) {
                return;
            }

            const userId =
                typeof message.token?.id === "string" ? message.token.id : null;
            if (!userId) {
                return;
            }

            const userEmail =
                typeof message.token?.email === "string"
                    ? message.token.email
                    : undefined;
            const { logAudit } = await import("@/lib/auditLog");
            logAudit("LOGOUT", userId, {
                userEmail,
            });
        },
    },
});

export { handlers, signIn, signOut };

export async function auth(): Promise<Session | null> {
    const session = await nextAuthAuth();
    return ensureActiveSession(session);
}
