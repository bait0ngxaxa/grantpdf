import { prisma } from "@/lib/prisma";
import type { AdminProject } from "@/type/models";
import type { Project } from "@prisma/client";
import type { UpdateProjectStatusParams } from "./types";
import { VALID_STATUSES } from "./constants";

export async function updateProjectStatus({
    projectId,
    status,
    statusNote,
}: UpdateProjectStatusParams): Promise<Partial<AdminProject>> {
    if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) {
        throw new Error(
            `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        );
    }

    const updatedProject = await prisma.project.update({
        where: {
            id: parseInt(projectId),
        },
        data: {
            status,
            statusNote: statusNote || null,
            updated_at: new Date(),
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            _count: {
                select: { files: true },
            },
        },
    });

    return {
        id: updatedProject.id.toString(),
        name: updatedProject.name,
        description: updatedProject.description || undefined,
        status: updatedProject.status,
        statusNote: updatedProject.statusNote || undefined,
        created_at: updatedProject.created_at.toISOString(),
        updated_at:
            updatedProject.updated_at?.toISOString() ||
            new Date().toISOString(),
        userId: updatedProject.userId.toString(),
        userName: updatedProject.user?.name || "Unknown User",
        userEmail: updatedProject.user?.email || "Unknown Email",
        _count: updatedProject._count,
    };
}

export async function createProject(
    userId: number,
    name: string,
    description?: string,
): Promise<{ id: string } & Omit<Project, "id">> {
    const project = await prisma.project.create({
        data: {
            name,
            description,
            userId,
        },
        include: {
            files: true,
            _count: {
                select: { files: true },
            },
        },
    });

    return {
        ...project,
        id: project.id.toString(),
    };
}
