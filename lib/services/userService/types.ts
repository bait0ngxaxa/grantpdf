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
