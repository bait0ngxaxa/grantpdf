import { prisma } from "@/lib/prisma";
import { parseActorUserId, toPrismaJsonValue } from "@/lib/auditUtils";
import type { AdminProject, ProjectCoOwnerSummary } from "@/type/models";
import { Prisma, type Project } from "@prisma/client";
import type { UpdateProjectCoOwnersParams, UpdateProjectStatusParams } from "./types";
import { VALID_STATUSES_SET, PROJECT_STATUS } from "@/lib/constants";
import { buildProjectAccessWhere } from "./projectAccess";

function uniquePositiveIds(ids: number[]): number[] {
    const uniqueIds = new Set<number>();

    for (const id of ids) {
        if (Number.isInteger(id) && id > 0) {
            uniqueIds.add(id);
        }
    }

    return [...uniqueIds];
}

export async function updateProjectStatus({
    projectId,
    status,
    statusNote,
    programId,
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
            programId,
            updated_at: new Date(),
        },
        include: {
            program: {
                select: {
                    id: true,
                    name: true,
                },
            },
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
        programId: updatedProject.programId?.toString(),
        programName: updatedProject.program?.name,
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

export async function updateProjectCoOwners({
    projectId,
    allowCoOwners,
    adminUserIds,
    assignedById,
}: UpdateProjectCoOwnersParams): Promise<{
    allowCoOwners: boolean;
    coOwners: ProjectCoOwnerSummary[];
}> {
    if (!Number.isInteger(projectId) || projectId <= 0) {
        throw new Error("Invalid projectId");
    }

    if (!Number.isInteger(assignedById) || assignedById <= 0) {
        throw new Error("Invalid assignedById");
    }

    const requestedAdminIds = allowCoOwners ? uniquePositiveIds(adminUserIds) : [];

    return prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                userId: true,
            },
        });

        if (!project) {
            throw new Error("PROJECT_NOT_FOUND");
        }

        if (requestedAdminIds.length > 0) {
            const users = await tx.user.findMany({
                where: {
                    id: { in: requestedAdminIds },
                },
                select: { id: true },
            });
            const validUserIds = new Set(users.map((user) => user.id));

            if (requestedAdminIds.some((id) => !validUserIds.has(id))) {
                throw new Error("INVALID_CO_OWNER_USER");
            }
        }

        await tx.project.update({
            where: { id: projectId },
            data: {
                allowCoOwners,
                updated_at: new Date(),
            },
            select: { id: true },
        });

        await tx.projectCoOwner.deleteMany({
            where: {
                projectId,
                adminUserId: { notIn: requestedAdminIds },
            },
        });

        for (const adminUserId of requestedAdminIds) {
            if (adminUserId === project.userId) {
                continue;
            }

            await tx.projectCoOwner.upsert({
                where: {
                    projectId_adminUserId: {
                        projectId,
                        adminUserId,
                    },
                },
                update: {
                    assignedById,
                },
                create: {
                    projectId,
                    adminUserId,
                    assignedById,
                },
            });
        }

        const coOwners = await tx.projectCoOwner.findMany({
            where: { projectId },
            select: {
                adminUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { created_at: "asc" },
        });

        return {
            allowCoOwners,
            coOwners: coOwners.map((coOwner) => ({
                id: coOwner.adminUser.id.toString(),
                name: coOwner.adminUser.name || "Unknown User",
                email: coOwner.adminUser.email,
            })),
        };
    });
}

export async function createProject(
    userId: number,
    name: string,
    description?: string,
    programId?: number,
): Promise<{ id: string } & Omit<Project, "id">> {
    const trimmedName = name.trim();
    const normalizedDescription =
        description && description.trim() !== "" ? description.trim() : null;

    const existing = await prisma.project.findUnique({
        where: {
            userId_name: {
                userId,
                name: trimmedName,
            },
        },
        select: {
            id: true,
            programId: true,
        },
    });

    if (existing && programId && existing.programId !== null && existing.programId !== programId) {
        throw new Error("PROJECT_NAME_CONFLICT");
    }

    const project = existing
        ? await prisma.project.update({
              where: { id: existing.id },
              data:
                  existing.programId === null && programId
                      ? {
                            programId,
                            updated_at: new Date(),
                        }
                      : {},
              include: {
                  files: true,
                  _count: {
                      select: { files: true },
                  },
              },
          })
        : await prisma.project.create({
              data: {
                  name: trimmedName,
                  description: normalizedDescription,
                  userId,
                  programId: programId ?? null,
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

export async function createProjectWithAudit(
    userId: number,
    name: string,
    description: string | undefined,
    programId: number | undefined,
    audit: ProjectAuditContext,
): Promise<{ id: string } & Omit<Project, "id">> {
    const trimmedName = name.trim();
    const normalizedDescription =
        description && description.trim() !== "" ? description.trim() : null;

    const project = await prisma.$transaction(async (tx) => {
        const existing = await tx.project.findUnique({
            where: {
                userId_name: {
                    userId,
                    name: trimmedName,
                },
            },
            select: {
                id: true,
                programId: true,
            },
        });

        if (
            existing &&
            programId &&
            existing.programId !== null &&
            existing.programId !== programId
        ) {
            throw new Error("PROJECT_NAME_CONFLICT");
        }

        const created = existing
            ? await tx.project.update({
                  where: { id: existing.id },
                  data:
                      existing.programId === null && programId
                          ? {
                                programId,
                                updated_at: new Date(),
                            }
                          : {},
                  include: {
                      files: true,
                      _count: {
                          select: { files: true },
                      },
                  },
              })
            : await tx.project.create({
                  data: {
                      userId,
                      name: trimmedName,
                      description: normalizedDescription,
                      programId: programId ?? null,
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
                details: toPrismaJsonValue({
                    projectId: created.id,
                    projectName: created.name,
                    description: created.description,
                    programId: created.programId,
                    reusedExistingProject: existing !== null,
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
                where: buildProjectAccessWhere(projectId, userId),
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
                    details: toPrismaJsonValue({
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
            where: buildProjectAccessWhere(projectId, userId),
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
                details: toPrismaJsonValue({
                    projectId: existing.id,
                    projectName: existing.name,
                    description: existing.description,
                }),
            },
        });
    });
}
