import { prisma } from "@/lib/prisma";
import type { AdminProject } from "@/type/models";
import { Prisma, type Project } from "@prisma/client";
import type { UpdateProjectStatusParams } from "./types";
import { VALID_STATUSES_SET, PROJECT_STATUS } from "@/lib/constants";

export async function updateProjectStatus({
    projectId,
    status,
    statusNote,
}: UpdateProjectStatusParams): Promise<Partial<AdminProject>> {
    if (!Number.isInteger(projectId) || projectId <= 0) {
        throw new Error("Invalid projectId");
    }

    if (!VALID_STATUSES_SET.has(status)) {
        throw new Error(
            `Invalid status. Must be one of: ${Object.values(PROJECT_STATUS).join(", ")}`,
        );
    }

    const updatedProject = await prisma.project.update({
        where: {
            id: projectId,
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
    const trimmedName = name.trim();
    const normalizedDescription =
        description && description.trim() !== "" ? description.trim() : null;

    const project = await prisma.project.upsert({
        where: {
            userId_name: {
                userId,
                name: trimmedName,
            },
        },
        update: {},
        create: {
            name: trimmedName,
            description: normalizedDescription,
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

interface ProjectAuditContext {
    actorUserId: string;
    actorEmail?: string;
    ip?: string;
    userAgent?: string;
    requestId?: string;
}

function parseActorUserId(actorUserId: string): number | null {
    const parsed = Number(actorUserId);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function normalizeProjectAuditDetails(
    details: Record<string, unknown>,
): Prisma.InputJsonValue {
    return JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue;
}

export async function createProjectWithAudit(
    userId: number,
    name: string,
    description: string | undefined,
    audit: ProjectAuditContext,
): Promise<{ id: string } & Omit<Project, "id">> {
    const trimmedName = name.trim();
    const normalizedDescription =
        description && description.trim() !== "" ? description.trim() : null;

    const project = await prisma.$transaction(async (tx) => {
        const created = await tx.project.upsert({
            where: {
                userId_name: {
                    userId,
                    name: trimmedName,
                },
            },
            update: {},
            create: {
                userId,
                name: trimmedName,
                description: normalizedDescription,
            },
            include: {
                files: true,
                _count: {
                    select: { files: true },
                },
            },
        });

        await tx.auditLog.create({
            data: {
                action: "PROJECT_CREATE",
                outcome: "success",
                actorUserId: parseActorUserId(audit.actorUserId),
                actorEmail: audit.actorEmail ?? null,
                targetType: "project",
                targetId: created.id.toString(),
                ip: audit.ip ?? null,
                userAgent: audit.userAgent ?? null,
                requestId: audit.requestId ?? null,
                details: normalizeProjectAuditDetails({
                    projectId: created.id,
                    projectName: created.name,
                    description: created.description,
                }),
            },
        });

        return created;
    });

    return {
        ...project,
        id: project.id.toString(),
    };
}

export async function updateProjectWithAudit(
    projectId: number,
    userId: number,
    name: string,
    description: string | undefined,
    audit: ProjectAuditContext,
): Promise<{ id: string } & Omit<Project, "id">> {
    const trimmedName = name.trim();
    const normalizedDescription =
        description && description.trim() !== "" ? description.trim() : null;

    let updatedProject: Awaited<ReturnType<typeof prisma.project.update>>;

    try {
        updatedProject = await prisma.$transaction(async (tx) => {
            const existing = await tx.project.findFirst({
                where: { id: projectId, userId },
                select: { id: true, name: true, description: true },
            });

            if (!existing) {
                throw new Error("PROJECT_NOT_FOUND");
            }

            const updated = await tx.project.update({
                where: { id: projectId },
                data: {
                    name: trimmedName,
                    description: normalizedDescription,
                },
                include: {
                    files: true,
                    _count: {
                        select: { files: true },
                    },
                },
            });

            await tx.auditLog.create({
                data: {
                    action: "PROJECT_UPDATE",
                    outcome: "success",
                    actorUserId: parseActorUserId(audit.actorUserId),
                    actorEmail: audit.actorEmail ?? null,
                    targetType: "project",
                    targetId: updated.id.toString(),
                    ip: audit.ip ?? null,
                    userAgent: audit.userAgent ?? null,
                    requestId: audit.requestId ?? null,
                    details: normalizeProjectAuditDetails({
                        projectId: updated.id,
                        previousName: existing.name,
                        previousDescription: existing.description,
                        nextName: updated.name,
                        nextDescription: updated.description,
                    }),
                },
            });

            return updated;
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new Error("PROJECT_NAME_CONFLICT");
        }
        throw error;
    }

    return {
        ...updatedProject,
        id: updatedProject.id.toString(),
    };
}

export async function deleteProjectWithAudit(
    projectId: number,
    userId: number,
    audit: ProjectAuditContext,
): Promise<void> {
    await prisma.$transaction(async (tx) => {
        const existing = await tx.project.findFirst({
            where: { id: projectId, userId },
            select: { id: true, name: true, description: true },
        });

        if (!existing) {
            throw new Error("PROJECT_NOT_FOUND");
        }

        await tx.project.delete({
            where: { id: projectId },
        });

        await tx.auditLog.create({
            data: {
                action: "PROJECT_DELETE",
                outcome: "success",
                actorUserId: parseActorUserId(audit.actorUserId),
                actorEmail: audit.actorEmail ?? null,
                targetType: "project",
                targetId: existing.id.toString(),
                ip: audit.ip ?? null,
                userAgent: audit.userAgent ?? null,
                requestId: audit.requestId ?? null,
                details: normalizeProjectAuditDetails({
                    projectId: existing.id,
                    projectName: existing.name,
                    description: existing.description,
                }),
            },
        });
    });
}
