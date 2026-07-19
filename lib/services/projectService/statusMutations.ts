import { parseActorUserId, toPrismaJsonValue } from "@/lib/server/audit/auditUtils";
import { FILE_DELETION_STATUS, PROJECT_STATUS, VALID_STATUSES_SET } from "@/lib/shared/constants";
import { prisma } from "@/lib/server/db";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectStatusUpdated } from "@/lib/services/notificationEventService";
import type { AdminProject } from "@/type/models";
import type { Prisma } from "@prisma/client";
import {
    getProjectDashboardUserIds,
    toAdminProject,
} from "./mutationShared";
import type {
    ProjectAuditContext,
    UpdateProjectStatusParams,
} from "./types";

function assertValidStatusInput(params: UpdateProjectStatusParams): void {
    if (!Number.isInteger(params.projectId) || params.projectId <= 0) {
        throw new Error("Invalid projectId");
    }

    if (!VALID_STATUSES_SET.has(params.status)) {
        throw new Error(
            `Invalid status. Must be one of: ${Object.values(PROJECT_STATUS).join(", ")}`,
        );
    }
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

export async function updateProjectStatus(
    params: UpdateProjectStatusParams,
): Promise<Partial<AdminProject>> {
    assertValidStatusInput(params);

    const updatedProject = await prisma.project.update({
        where: { id: params.projectId },
        data: {
            status: params.status,
            statusNote: params.statusNote || null,
            programId: params.programId,
            updated_at: new Date(),
        },
        include: {
            program: { select: { id: true, name: true } },
            user: { select: { id: true, name: true, email: true } },
            coOwners: { select: { coOwnerUserId: true } },
            _count: {
                select: {
                    files: { where: { deletionStatus: FILE_DELETION_STATUS.ACTIVE } },
                },
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
    assertValidStatusInput(params);

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
                coOwners: { select: { coOwnerUserId: true } },
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
                _count: {
                    select: {
                        files: { where: { deletionStatus: FILE_DELETION_STATUS.ACTIVE } },
                    },
                },
            },
        });

        await createProjectStatusAudit(tx, beforeProject, updated, params, audit);
        await notifyProjectStatusUpdated(tx, {
            projectId: updated.id,
            projectName: updated.name,
            ownerUserId: beforeProject.userId,
            coOwnerUserIds: beforeProject.coOwners.map(
                (coOwner) => coOwner.coOwnerUserId,
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
