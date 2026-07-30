import type { Prisma } from "@prisma/client";
import { PAGINATION } from "@/lib/shared/constants";
import {
    decodeUserFileCursor,
    type UserFileCursor,
} from "@/lib/domain/files/cursor";

export function normalizeUserFileLimit(limit?: number): number {
    if (limit === undefined || !Number.isFinite(limit)) {
        return PAGINATION.USER_DOCUMENTS_API_DEFAULT_LIMIT;
    }

    return Math.min(
        Math.max(1, Math.trunc(limit)),
        PAGINATION.USER_DOCUMENTS_API_MAX_LIMIT,
    );
}

export function parseUserFileCursor(
    cursor?: string,
): UserFileCursor | undefined {
    if (cursor === undefined) return undefined;

    const decodedCursor = decodeUserFileCursor(cursor);
    if (decodedCursor === null) {
        throw new Error("INVALID_USER_DOCUMENTS_CURSOR");
    }

    return decodedCursor;
}

export function buildCursorWhere(
    cursor: UserFileCursor,
): Prisma.UserFileWhereInput {
    return {
        OR: [
            { created_at: { lt: cursor.createdAt } },
            {
                created_at: cursor.createdAt,
                id: { lt: cursor.id },
            },
        ],
    };
}
