import type { Prisma } from "@prisma/client";

export function parseActorUserId(
    value: string | null | undefined,
): number | null {
    if (!value) {
        return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function toPrismaJsonValue(
    value: Record<string, unknown>,
): Prisma.InputJsonValue;
export function toPrismaJsonValue(
    value: Record<string, unknown> | undefined,
): Prisma.InputJsonValue | undefined;
export function toPrismaJsonValue(
    value?: Record<string, unknown>,
): Prisma.InputJsonValue | undefined {
    if (!value) {
        return undefined;
    }

    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
