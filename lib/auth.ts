import { getGrantSession } from "@/lib/grantAuth";
import type { Session } from "@/lib/authTypes";

export async function auth(): Promise<Session | null> {
    return getGrantSession();
}
