// /app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { NextAuthOptions, User } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "john@doe.com",
                },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (
                    !credentials?.email ||
                    typeof credentials.email !== "string" ||
                    !credentials?.password ||
                    typeof credentials.password !== "string"
                ) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                if (
                    user &&
                    (await bcrypt.compare(credentials.password, user.password))
                ) {
                    const authorizedUser: User = {
                        id: String(user.id),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    };
                    return authorizedUser;
                } else {
                    return null;
                }
            },
        }),
    ],

    // Use JWT strategy for session management
    session: {
        strategy: "jwt",
        maxAge: 60 * 60, // กำหนดอายุของ session เป็น 1 ชั่วโมง
    },

    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.id = user.id;
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
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
