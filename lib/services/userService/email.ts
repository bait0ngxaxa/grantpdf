import { randomUUID } from "node:crypto";
import { USER_LIFECYCLE } from "@/lib/shared/constants";

export function buildAnonymizedUserEmail(userId: number): string {
    return `deleted+${userId}-${randomUUID()}@${USER_LIFECYCLE.ANONYMIZED_EMAIL_DOMAIN}`;
}
