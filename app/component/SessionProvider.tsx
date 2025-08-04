// /app/component/SessionProvider.tsx
// This component must be a 'use client' component to use NextAuth's hooks.
'use client';

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import React from "react";
import { Session } from "next-auth"; // FIX: Import Session type from next-auth

export default function SessionProvider({
  children,
  session, // FIX: The component now expects to receive the session as a prop
}: {
  children: React.ReactNode;
  session: Session | null; // FIX: Define the type of the session prop
}) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
