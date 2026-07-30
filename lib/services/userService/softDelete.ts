import type { Prisma } from "@prisma/client";
import { USER_LIFECYCLE, USER_LIFECYCLE_STATUS } from "@/lib/shared/constants";
import { buildAnonymizedUserEmail } from "./email";

const PURGE_AFTER_MS =
    USER_LIFECYCLE.PURGE_AFTER_DAYS * 24 * 60 * 60 * 1000;

export interface UserDeletionTarget {
    id: number;
    name: string;
    email: string;
    role: string;
}

export async function softDeleteUser(
    tx: Prisma.TransactionClient,
    id: number,
    deletedById: number | null,
): Promise<UserDeletionTarget> {
    const targetUser = await tx.user.findFirst({
        where: {
            id,
            status: USER_LIFECYCLE_STATUS.ACTIVE,
            deletedAt: null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
        },
    });

    if (!targetUser) {
        throw new Error("USER_NOT_FOUND");
    }

    const deletedAt = new Date();
    const result = await tx.user.updateMany({
        where: {
            id,
            status: USER_LIFECYCLE_STATUS.ACTIVE,
            deletedAt: null,
        },
        data: {
            email: buildAnonymizedUserEmail(id),
            deletedAt,
            deletedById,
            status: USER_LIFECYCLE_STATUS.DELETED,
            purgeAfter: new Date(deletedAt.getTime() + PURGE_AFTER_MS),
            sessionVersion: { increment: 1 },
        },
    });

    if (result.count !== 1) {
        throw new Error("USER_NOT_FOUND");
    }

    await tx.authSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: deletedAt },
    });

    return targetUser;
}
