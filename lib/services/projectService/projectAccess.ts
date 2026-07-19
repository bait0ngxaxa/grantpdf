import type { Prisma } from "@prisma/client";

export function buildProjectAccessWhere(
    projectId: number,
    userId: number,
): Prisma.ProjectWhereInput {
    return {
        id: projectId,
        deletedAt: null,
        OR: [
            { userId },
            {
                allowCoOwners: true,
                coOwners: { some: { coOwnerUserId: userId } },
            },
        ],
    };
}

export function buildUserProjectsAccessWhere(
    userId: number,
): Prisma.ProjectWhereInput {
    return {
        deletedAt: null,
        OR: [
            { userId },
            {
                allowCoOwners: true,
                coOwners: { some: { coOwnerUserId: userId } },
            },
        ],
    };
}
