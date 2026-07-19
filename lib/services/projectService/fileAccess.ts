import type { Prisma } from "@prisma/client";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import {
    buildProjectAccessWhere,
    buildUserProjectsAccessWhere,
    userCanAccessProject,
} from "./projectAccess";

export function buildAccessibleUserFileWhere(
    userId: number,
    projectId?: number,
): Prisma.UserFileWhereInput {
    const baseWhere = {
        deletionStatus: FILE_DELETION_STATUS.ACTIVE,
    };

    if (projectId !== undefined) {
        return {
            ...baseWhere,
            projectId,
            project: buildProjectAccessWhere(projectId, userId),
        };
    }

    return {
        ...baseWhere,
        OR: [
            { userId },
            { project: buildUserProjectsAccessWhere(userId) },
        ],
    };
}

export async function canAccessProjectFile(
    userId: number,
    ownerUserId: number,
    projectId: number | null,
): Promise<boolean> {
    if (userId === ownerUserId) return true;
    if (projectId === null) return false;

    return userCanAccessProject(projectId, userId);
}
