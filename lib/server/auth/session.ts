import { getGrantSession } from "@/lib/server/auth/grantSession";
import type { Session } from "@/lib/server/auth/types";

export async function auth(): Promise<Session | null> {
    return getGrantSession();
}
