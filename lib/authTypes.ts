export interface AuthUser {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    sessionVersion?: number;
}

export interface Session {
    user: AuthUser;
    expires: string;
}
