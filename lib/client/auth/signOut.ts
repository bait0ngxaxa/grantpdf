"use client";

import { SIGNOUT_CALLBACK } from "@/lib/shared/constants";

async function revokeHybridSession(): Promise<void> {
    await fetch("/api/auth/session/logout", {
        method: "POST",
    }).catch(() => undefined);
}

export async function signOutWithSessionRevoke(): Promise<void> {
    await revokeHybridSession();
    window.location.assign(SIGNOUT_CALLBACK);
}
