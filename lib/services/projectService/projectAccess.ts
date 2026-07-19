import type { Prisma } from "@prisma/client";
import { USER_LIFECYCLE_STATUS } from "@/lib/shared/constants";

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
                coOwners: {
                    some: {
                        coOwnerUserId: userId,
                        coOwnerUser: {
                            status: USER_LIFECYCLE_STATUS.ACTIVE,
                            deletedAt: null,
                        },
                    },
                },
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
                coOwners: {
                    some: {
                        coOwnerUserId: userId,
                        coOwnerUser: {
                            status: USER_LIFECYCLE_STATUS.ACTIVE,
                            deletedAt: null,
                        },
                    },
                },
            },
        ],
    };
}
