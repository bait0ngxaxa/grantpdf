import type { Session } from "next-auth";

export interface SafeUser {
    id: string;
    name: string | null;
    email: string;
    role: string | null;
    created_at: Date;
}

export interface UpdateUserData {
    name?: string;
    role?: string;
}

export interface CheckAdminResult {
    isAdmin: boolean;
    userId: number | null;
    session: Session | null;
}
