import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";
import { USER_LIFECYCLE_STATUS } from "@/lib/shared/constants";

export function buildProjectMemberAccessWhere(
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

export function buildUserProjectsAccessWhere(
    userId: number,
): Prisma.ProjectWhereInput {
    return buildProjectMemberAccessWhere(userId);
}

export function buildProjectAccessWhere(
    projectId: number,
    userId: number,
): Prisma.ProjectWhereInput {
    return {
        id: projectId,
        ...buildProjectMemberAccessWhere(userId),
    };
}

export async function userCanAccessProject(
    projectId: number,
    userId: number,
): Promise<boolean> {
    const project = await prisma.project.findFirst({
        where: buildProjectAccessWhere(projectId, userId),
        select: { id: true },
    });

    return project !== null;
}
