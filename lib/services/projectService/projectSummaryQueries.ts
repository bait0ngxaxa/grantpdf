import { prisma } from "@/lib/prisma";
import type { ProjectSummary } from "@/type/models";
import { buildUserProjectsAccessWhere } from "./projectAccess";

export async function getProjectSummariesByUserId(
    userId: number,
): Promise<ProjectSummary[]> {
    const projects = await prisma.project.findMany({
        where: buildUserProjectsAccessWhere(userId),
        select: {
            id: true,
            name: true,
            description: true,
            programId: true,
            program: {
                select: {
                    id: true,
                    name: true,
                },
            },
            created_at: true,
            _count: { select: { files: true } },
        },
        orderBy: { created_at: "desc" },
    });

    return projects.map((project) => ({
        id: project.id.toString(),
        name: project.name,
        description: project.description || undefined,
        programId: project.programId?.toString(),
        programName: project.program?.name,
        created_at: project.created_at.toISOString(),
        _count: {
            files: project._count.files,
        },
    }));
}
