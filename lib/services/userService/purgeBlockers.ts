import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/server/db";

export interface UserPurgeBlockers {
    blocked: boolean;
    projectIds: number[];
    hasCoOwners: boolean;
    hasForeignFiles: boolean;
    hasForeignReports: boolean;
}

export function buildNoSharedProjectDataWhere(
    userId: number,
): Prisma.UserWhereInput {
    return {
        projects: {
            none: {
                OR: [
                    { coOwners: { some: {} } },
                    {
                        files: {
                            some: {
                                userId: { not: userId },
                            },
                        },
                    },
                    {
                        reports: {
                            some: {
                                userId: { not: userId },
                            },
                        },
                    },
                ],
            },
        },
    };
}

export async function findUserPurgeBlockers(
    userId: number,
): Promise<UserPurgeBlockers> {
    const projects = await prisma.project.findMany({
        where: { userId },
        select: {
            id: true,
            coOwners: {
                select: { id: true },
                take: 1,
            },
            files: {
                where: { userId: { not: userId } },
                select: { id: true },
                take: 1,
            },
            reports: {
                where: { userId: { not: userId } },
                select: { id: true },
                take: 1,
            },
        },
    });

    const blockedProjects = projects.filter(
        (project) =>
            project.coOwners.length > 0 ||
            project.files.length > 0 ||
            project.reports.length > 0,
    );

    return {
        blocked: blockedProjects.length > 0,
        projectIds: blockedProjects.map((project) => project.id),
        hasCoOwners: projects.some((project) => project.coOwners.length > 0),
        hasForeignFiles: projects.some((project) => project.files.length > 0),
        hasForeignReports: projects.some(
            (project) => project.reports.length > 0,
        ),
    };
}
