export const VALID_ROLES = ["member", "admin"] as const;

export function isValidRole(role: string): boolean {
    return VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]);
}
