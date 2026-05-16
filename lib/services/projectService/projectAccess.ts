import type { Prisma } from "@prisma/client";

export function buildProjectAccessWhere(
    projectId: number,
    userId: number,
): Prisma.ProjectWhereInput {
    return {
        id: projectId,
        OR: [
            { userId },
            {
                allowCoOwners: true,
                coOwners: { some: { adminUserId: userId } },
            },
        ],
    };
}

export function buildUserProjectsAccessWhere(
    userId: number,
): Prisma.ProjectWhereInput {
    return {
        OR: [
            { userId },
            {
                allowCoOwners: true,
                coOwners: { some: { adminUserId: userId } },
            },
        ],
    };
}
