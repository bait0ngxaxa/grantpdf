// components/providers/SessionProvider.tsx
// This component must be a 'use client' component to use NextAuth's hooks.
"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderProps {
    children: React.ReactNode;
    session: Session | null;
}

export default function SessionProvider({
    children,
    session,
}: SessionProviderProps): React.ReactElement {
    return (
        <NextAuthSessionProvider session={session}>
            {children}
        </NextAuthSessionProvider>
    );
}
