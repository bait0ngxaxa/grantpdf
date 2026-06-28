export const ROLES = {
    ADMIN: "admin",
    MEMBER: "member",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
