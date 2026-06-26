import { prisma } from "@/lib/prisma";
import { parseActorUserId, toPrismaJsonValue } from "@/lib/auditUtils";
import type { AdminProject, ProjectCoOwnerSummary } from "@/type/models";
import { Prisma, type Project } from "@prisma/client";
import type {
    ProjectAuditContext,
    UpdateProjectCoOwnersParams,
    UpdateProjectStatusParams,
} from "./types";
import { VALID_STATUSES_SET, PROJECT_STATUS } from "@/lib/constants";
import { buildProjectAccessWhere } from "./projectAccess";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import {
    notifyProjectCoOwnersAssigned,
    notifyProjectCreated,
    notifyProjectStatusUpdated,
} from "@/lib/services/notificationEventService";
import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_TYPE,
} from "@/lib/notifications/constants";

function uniquePositiveIds(ids: number[]): number[] {
    const uniqueIds = new Set<number>();

    for (const id of ids) {
        if (Number.isInteger(id) && id > 0) {
            uniqueIds.add(id);
        }
    }

    return [...uniqueIds];
}

function getProjectDashboardUserIds(project: {
    userId: number;
    coOwners?: Array<{ adminUserId: number }>;
}): number[] {
    return [
        project.userId,
        ...(project.coOwners?.map((coOwner) => coOwner.adminUserId) ?? []),
    ];
}

function getAssignableCoOwnerIds(
    requestedUserIds: number[],
    ownerUserId: number,
): number[] {
    return requestedUserIds.filter((id) => id !== ownerUserId);
}

function getCoOwnerNotificationTargetIds(
    assignableUserIds: number[],
    previousUserIds: Set<number>,
    notifiedUserIds: Set<number>,
): number[] {
    return assignableUserIds.filter(
        (id) => !previousUserIds.has(id) || !notifiedUserIds.has(id),
    );
}

async function getNotifiedCoOwnerAssignmentUserIds(
    tx: Prisma.TransactionClient,
    projectId: number,
    userIds: number[],
): Promise<Set<number>> {
    if (userIds.length === 0) return new Set<number>();

    const recipients = await tx.notificationRecipient.findMany({
        where: {
            recipientUserId: { in: userIds },
            audience: NOTIFICATION_AUDIENCE.USER,
            event: {
                projectId,
                type: NOTIFICATION_TYPE.PROJECT_CO_OWNER_ASSIGNED,
            },
        },
        select: { recipientUserId: true },
    });

    return new Set(recipients.map((recipient) => recipient.recipientUserId));
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
}

function toProjectWithStringId(
    project: Project & { files: unknown[]; _count: { files: number } },
): { id: string } & Omit<Project, "id"> {
    return {
        ...project,
        id: project.id.toString(),
    };
}

function toAdminProject(project: {
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

async function findProjectForCreate(
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

async function getProjectForCreate(
    id: number,
): Promise<Project & { files: unknown[]; _count: { files: number } }> {
    return prisma.project.findUniqueOrThrow({
        where: { id },
        include: {
            files: true,
            _count: {
                select: { files: true },
            },
        },
    });
}

async function createProjectStatusAudit(
    tx: Prisma.TransactionClient,
    beforeProject: {
        status: string;
        statusNote: string | null;
        programId: number | null;
    },
    updated: { id: number; name: string; programId: number | null } & {
        program?: { name: string } | null;
        user?: { email: string } | null;
    },
    params: UpdateProjectStatusParams,
    audit: ProjectAuditContext,
): Promise<void> {
    await tx.auditLog.create({
        data: {
            action: "ADMIN_PROJECT_UPDATE",
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
                projectName: updated.name,
                previousStatus: beforeProject.status,
                previousStatusNote: beforeProject.statusNote,
                previousProgramId: beforeProject.programId,
                newStatus: params.status,
                statusNote: params.statusNote || null,
                programId: updated.programId ?? null,
                programName: updated.program?.name ?? null,
                projectOwnerEmail: updated.user?.email ?? null,
            }),
        },
    });
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
            coOwners: {
                select: { adminUserId: true },
            },
            _count: {
                select: { files: true },
            },
        },
    });

    await invalidateDashboardStats(getProjectDashboardUserIds(updatedProject));
    return toAdminProject(updatedProject);
}

export async function updateProjectStatusWithAudit(
    params: UpdateProjectStatusParams,
    audit: ProjectAuditContext,
): Promise<Partial<AdminProject>> {
    if (!Number.isInteger(params.projectId) || params.projectId <= 0) {
        throw new Error("Invalid projectId");
    }

    if (!VALID_STATUSES_SET.has(params.status)) {
        throw new Error(
            `Invalid status. Must be one of: ${Object.values(PROJECT_STATUS).join(", ")}`,
        );
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
        const beforeProject = await tx.project.findUnique({
            where: { id: params.projectId },
            select: {
                id: true,
                name: true,
                status: true,
                statusNote: true,
                programId: true,
                userId: true,
                coOwners: {
                    select: { adminUserId: true },
                },
            },
        });

        if (!beforeProject) {
            throw new Error("PROJECT_NOT_FOUND");
        }

        const updatedAt = new Date();
        const updated = await tx.project.update({
            where: { id: params.projectId },
            data: {
                status: params.status,
                statusNote: params.statusNote || null,
                programId: params.programId,
                updated_at: updatedAt,
            },
            include: {
                program: { select: { id: true, name: true } },
                user: { select: { id: true, name: true, email: true } },
                _count: { select: { files: true } },
            },
        });

        await createProjectStatusAudit(tx, beforeProject, updated, params, audit);
        await notifyProjectStatusUpdated(tx, {
            projectId: updated.id,
            projectName: updated.name,
            ownerUserId: beforeProject.userId,
            coOwnerUserIds: beforeProject.coOwners.map(
                (coOwner) => coOwner.adminUserId,
            ),
            status: params.status,
            actorUserId: parseActorUserId(audit.actorUserId),
            updatedAt,
        });

        return {
            updated,
            affectedUserIds: getProjectDashboardUserIds(beforeProject),
        };
    });

    await invalidateDashboardStats(updatedProject.affectedUserIds);
    return toAdminProject(updatedProject.updated);
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

    const result = await prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                userId: true,
                coOwners: {
                    select: { adminUserId: true },
                },
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

        const previousAdminIds = new Set(
            (project.coOwners ?? []).map((coOwner) => coOwner.adminUserId),
        );
        const assignableCoOwnerIds = getAssignableCoOwnerIds(
            requestedAdminIds,
            project.userId,
        );
        const notifiedCoOwnerUserIds =
            await getNotifiedCoOwnerAssignmentUserIds(
                tx,
                projectId,
                assignableCoOwnerIds,
            );
        const notificationTargetIds = getCoOwnerNotificationTargetIds(
            assignableCoOwnerIds,
            previousAdminIds,
            notifiedCoOwnerUserIds,
        );
        const assignedAt = new Date();

        await tx.project.update({
            where: { id: projectId },
            data: {
                allowCoOwners,
                updated_at: assignedAt,
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

        await notifyProjectCoOwnersAssigned(tx, {
            projectId,
            projectName: project.name,
            assignedUserIds: notificationTargetIds,
            actorUserId: assignedById,
            assignedAt,
        });

        return {
            allowCoOwners,
            coOwners: coOwners.map((coOwner) => ({
                id: coOwner.adminUser.id.toString(),
                name: coOwner.adminUser.name || "Unknown User",
                email: coOwner.adminUser.email,
            })),
            affectedUserIds: [
                ...getProjectDashboardUserIds(project),
                ...requestedAdminIds,
            ],
        };
    });

    await invalidateDashboardStats(result.affectedUserIds);
    return {
        allowCoOwners: result.allowCoOwners,
        coOwners: result.coOwners,
    };
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

    try {
        const project = await prisma.$transaction(async (tx) => {
            const existing = await tx.project.findUnique({
                where: { userId_name: { userId, name: trimmedName } },
                select: { id: true, programId: true, deletedAt: true },
            });

            if (
                existing &&
                existing.deletedAt === null &&
                programId &&
                existing.programId !== null &&
                existing.programId !== programId
            ) {
                throw new Error("PROJECT_NAME_CONFLICT");
            }

            const shouldNotify = existing === null || existing.deletedAt !== null;
            const created = await (existing
                ? tx.project.update({
                      where: { id: existing.id },
                      data: {
                          ...(existing.deletedAt !== null
                              ? { deletedAt: null }
                              : {}),
                          ...(existing.programId === null && programId
                              ? { programId }
                              : {}),
                          ...(existing.deletedAt !== null && programId
                              ? { programId }
                              : {}),
                          updated_at: new Date(),
                      },
                      include: {
                          files: true,
                          _count: { select: { files: true } },
                      },
                  })
                : tx.project.create({
                      data: {
                          name: trimmedName,
                          description: normalizedDescription,
                          userId,
                          programId: programId ?? null,
                      },
                      include: {
                          files: true,
                          _count: { select: { files: true } },
                      },
                  }));
            if (shouldNotify) {
                await notifyProjectCreated(tx, {
                    projectId: created.id,
                    projectName: created.name,
                    actorUserId: userId,
                });
            }
            return created;
        });

        await invalidateDashboardStats([userId]);
        return toProjectWithStringId(project);
    } catch (error) {
        if (!isUniqueConstraintError(error)) {
            throw error;
        }

        const existing = await findProjectForCreate(userId, trimmedName);
        if (!existing) {
            throw error;
        }

        if (
            programId &&
            existing.deletedAt === null &&
            existing.programId !== null &&
            existing.programId !== programId
        ) {
            throw new Error("PROJECT_NAME_CONFLICT");
        }

        const project = existing.programId === null && programId
            ? await prisma.project.update({
                  where: { id: existing.id },
                  data: {
                      programId,
                      deletedAt: null,
                      updated_at: new Date(),
                  },
                  include: {
                      files: true,
                      _count: { select: { files: true } },
                  },
              })
            : existing.deletedAt !== null
              ? await prisma.project.update({
                    where: { id: existing.id },
                    data: {
                        deletedAt: null,
                        ...(programId ? { programId } : {}),
                        updated_at: new Date(),
                    },
                    include: {
                        files: true,
                        _count: { select: { files: true } },
                    },
                })
            : await getProjectForCreate(existing.id);

        await invalidateDashboardStats([userId]);
        return toProjectWithStringId(project);
    }
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
                deletedAt: true,
            },
        });

        if (
            existing &&
            existing.deletedAt === null &&
            programId &&
            existing.programId !== null &&
            existing.programId !== programId
        ) {
            throw new Error("PROJECT_NAME_CONFLICT");
        }

        const created = existing
            ? await tx.project.update({
                  where: { id: existing.id },
                  data: {
                      ...(existing.deletedAt !== null
                          ? { deletedAt: null }
                          : {}),
                      ...(existing.programId === null && programId
                          ? { programId }
                          : {}),
                      ...(existing.deletedAt !== null && programId
                          ? { programId }
                          : {}),
                      updated_at: new Date(),
                  },
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
                    restoredArchivedProject: existing?.deletedAt !== null,
                }),
            },
        });

        if (existing === null || existing.deletedAt !== null) {
            await notifyProjectCreated(tx, {
                projectId: created.id,
                projectName: created.name,
                actorUserId: userId,
            });
        }

        return created;
    });

    await invalidateDashboardStats([userId]);
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

    let updatedProject: {
        project: Awaited<ReturnType<typeof prisma.project.update>>;
        affectedUserIds: number[];
    };

    try {
        updatedProject = await prisma.$transaction(async (tx) => {
            const existing = await tx.project.findFirst({
                where: buildProjectAccessWhere(projectId, userId),
                select: {
                    id: true,
                    name: true,
                    description: true,
                    userId: true,
                    coOwners: {
                        select: { adminUserId: true },
                    },
                },
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

            return {
                project: updated,
                affectedUserIds: getProjectDashboardUserIds(existing),
            };
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

    await invalidateDashboardStats(updatedProject.affectedUserIds);
    return {
        ...updatedProject.project,
        id: updatedProject.project.id.toString(),
    };
}

export async function deleteProjectWithAudit(
    projectId: number,
    userId: number,
    audit: ProjectAuditContext,
): Promise<void> {
    const affectedUserIds = await prisma.$transaction(async (tx) => {
        const existing = await tx.project.findFirst({
            where: buildProjectAccessWhere(projectId, userId),
            select: {
                id: true,
                name: true,
                description: true,
                userId: true,
                coOwners: {
                    select: { adminUserId: true },
                },
            },
        });

        if (!existing) {
            throw new Error("PROJECT_NOT_FOUND");
        }

        if (existing.userId !== userId) {
            throw new Error("PROJECT_DELETE_FORBIDDEN");
        }

        await tx.project.update({
            where: { id: projectId },
            data: {
                deletedAt: new Date(),
                updated_at: new Date(),
            },
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

        return getProjectDashboardUserIds(existing);
    });

    await invalidateDashboardStats(affectedUserIds);
}
