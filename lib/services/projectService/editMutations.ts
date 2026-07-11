import { parseActorUserId, toPrismaJsonValue } from "@/lib/server/audit/auditUtils";
import { prisma } from "@/lib/server/db";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { PROJECT_NAME_MAX_LENGTH } from "@/lib/validation/constants";
import type { Project } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { buildProjectAccessWhere } from "./projectAccess";
import {
    getProjectDashboardUserIds,
    toProjectWithStringId,
} from "./mutationShared";
import type { ProjectAuditContext } from "./types";

function normalizeProjectText(
    name: string,
    description?: string,
): {
    name: string;
    description: string | null;
} {
    return {
        name: name.trim(),
        description:
            description && description.trim() !== "" ? description.trim() : null,
    };
}

function getArchivedProjectName(name: string, projectId: number): string {
    const suffix = `__deleted_${projectId}`;
    return `${name.slice(0, PROJECT_NAME_MAX_LENGTH - suffix.length)}${suffix}`;
}

export async function updateProjectWithAudit(
    projectId: number,
    userId: number,
    name: string,
    description: string | undefined,
    audit: ProjectAuditContext,
): Promise<{ id: string } & Omit<Project, "id">> {
    const normalized = normalizeProjectText(name, description);

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
                    coOwners: { select: { adminUserId: true } },
                },
            });

            if (!existing) {
                throw new Error("PROJECT_NOT_FOUND");
            }

            const updated = await tx.project.update({
                where: { id: projectId },
                data: {
                    name: normalized.name,
                    description: normalized.description,
                },
                include: {
                    files: true,
                    _count: { select: { files: true } },
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
    return toProjectWithStringId(updatedProject.project as Project & {
        files: unknown[];
        _count: { files: number };
    });
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
                coOwners: { select: { adminUserId: true } },
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
                name: getArchivedProjectName(existing.name, existing.id),
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
