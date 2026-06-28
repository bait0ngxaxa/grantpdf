import { prisma } from "@/lib/server/db";
import { buildProjectAccessWhere } from "./projectAccess";

interface ProjectLookupResult {
    id: number;
    name: string;
    description: string | null;
    programId: number | null;
}

export async function findProjectByNameAndUser(
    name: string,
    userId: number,
): Promise<ProjectLookupResult | null> {
    return await prisma.project.findFirst({
        where: { name, userId, deletedAt: null },
        select: { id: true, name: true, description: true, programId: true },
    });
}

export async function findProjectByIdAndUser(
    projectId: number,
    userId: number,
): Promise<ProjectLookupResult | null> {
    return await prisma.project.findFirst({
        where: buildProjectAccessWhere(projectId, userId),
        select: { id: true, name: true, description: true, programId: true },
    });
}
