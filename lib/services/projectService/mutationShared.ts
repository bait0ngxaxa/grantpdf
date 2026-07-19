import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import { prisma } from "@/lib/server/db";
import type { AdminProject } from "@/type/models";
import { Prisma, type Project } from "@prisma/client";

type ProjectWithFiles = Project & { files: unknown[]; _count: { files: number } };

export function getProjectDashboardUserIds(project: {
    userId: number;
    coOwners?: Array<{ coOwnerUserId: number }>;
}): number[] {
    return [
        project.userId,
        ...(project.coOwners?.map((coOwner) => coOwner.coOwnerUserId) ?? []),
    ];
}

export function isUniqueConstraintError(error: unknown): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
}

export function toProjectWithStringId(
    project: ProjectWithFiles,
): { id: string } & Omit<Project, "id"> {
    return {
        ...project,
        id: project.id.toString(),
    };
}

export function toAdminProject(project: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    statusNote: string | null;
    programId: number | null;
    program?: { name: string } | null;
    created_at: Date;
    updated_at: Date | null;
    userId: number;
    user?: { name: string | null; email: string } | null;
    _count: { files: number };
}): Partial<AdminProject> {
    return {
        id: project.id.toString(),
        name: project.name,
        description: project.description || undefined,
        status: project.status,
        statusNote: project.statusNote || undefined,
        programId: project.programId?.toString(),
        programName: project.program?.name,
        created_at: project.created_at.toISOString(),
        updated_at: project.updated_at?.toISOString() || new Date().toISOString(),
        userId: project.userId.toString(),
        userName: project.user?.name || "Unknown User",
        userEmail: project.user?.email || "Unknown Email",
        _count: project._count,
    };
}

export async function findProjectForCreate(
    userId: number,
    name: string,
): Promise<{
    id: number;
    programId: number | null;
    deletedAt: Date | null;
} | null> {
    return prisma.project.findUnique({
        where: { userId_name: { userId, name } },
        select: { id: true, programId: true, deletedAt: true },
    });
}

export async function getProjectForCreate(
    id: number,
): Promise<ProjectWithFiles> {
    return prisma.project.findUniqueOrThrow({
        where: { id },
        include: {
            files: { where: { deletionStatus: FILE_DELETION_STATUS.ACTIVE } },
            _count: {
                select: { files: true },
            },
        },
    });
}
