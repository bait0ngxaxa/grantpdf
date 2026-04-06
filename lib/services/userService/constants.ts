import { ROLES } from "@/lib/constants";

export const VALID_ROLES = [ROLES.MEMBER, ROLES.ADMIN] as const;

export function isValidRole(role: string): boolean {
    return VALID_ROLES.includes(role as (typeof VALID_ROLES)[number]);
}
