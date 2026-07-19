import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_TYPE,
} from "@/lib/notifications/constants";
import { prisma } from "@/lib/server/db";
import { USER_LIFECYCLE_STATUS } from "@/lib/shared/constants";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import { notifyProjectCoOwnersAssigned } from "@/lib/services/notificationEventService";
import type { ProjectCoOwnerSummary } from "@/type/models";
import type { Prisma } from "@prisma/client";
import { getProjectDashboardUserIds } from "./mutationShared";
import type { UpdateProjectCoOwnersParams } from "./types";

function uniquePositiveIds(ids: number[]): number[] {
    const uniqueIds = new Set<number>();

    for (const id of ids) {
        if (Number.isInteger(id) && id > 0) {
            uniqueIds.add(id);
        }
    }

    return [...uniqueIds];
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

async function assertCoOwnerUsersExist(
    tx: Prisma.TransactionClient,
    requestedCoOwnerIds: number[],
): Promise<void> {
    if (requestedCoOwnerIds.length === 0) return;

    const users = await tx.user.findMany({
        where: {
            id: { in: requestedCoOwnerIds },
            status: USER_LIFECYCLE_STATUS.ACTIVE,
            deletedAt: null,
        },
        select: { id: true },
    });
    const validUserIds = new Set(users.map((user) => user.id));

    if (requestedCoOwnerIds.some((id) => !validUserIds.has(id))) {
        throw new Error("INVALID_CO_OWNER_USER");
    }
}

export async function updateProjectCoOwners({
    projectId,
    allowCoOwners,
    coOwnerUserIds,
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

    const requestedCoOwnerIds = allowCoOwners ? uniquePositiveIds(coOwnerUserIds) : [];

    const result = await prisma.$transaction(async (tx) => {
        const project = await tx.project.findUnique({
            where: { id: projectId },
            select: {
                id: true,
                name: true,
                userId: true,
                coOwners: { select: { coOwnerUserId: true } },
            },
        });

        if (!project) {
            throw new Error("PROJECT_NOT_FOUND");
        }

        await assertCoOwnerUsersExist(tx, requestedCoOwnerIds);

        const previousCoOwnerIds = new Set(
            (project.coOwners ?? []).map((coOwner) => coOwner.coOwnerUserId),
        );
        const assignableCoOwnerIds = getAssignableCoOwnerIds(
            requestedCoOwnerIds,
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
            previousCoOwnerIds,
            notifiedCoOwnerUserIds,
        );
        const assignedAt = new Date();

        await tx.project.update({
            where: { id: projectId },
            data: { allowCoOwners, updated_at: assignedAt },
            select: { id: true },
        });

        await tx.projectCoOwner.deleteMany({
            where: {
                projectId,
                coOwnerUserId: { notIn: requestedCoOwnerIds },
            },
        });

        for (const coOwnerUserId of requestedCoOwnerIds) {
            if (coOwnerUserId === project.userId) continue;

            await tx.projectCoOwner.upsert({
                where: { projectId_coOwnerUserId: { projectId, coOwnerUserId } },
                update: { assignedById },
                create: { projectId, coOwnerUserId, assignedById },
            });
        }

        const coOwners = await tx.projectCoOwner.findMany({
            where: { projectId },
            select: {
                coOwnerUser: {
                    select: { id: true, name: true, email: true },
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
                id: coOwner.coOwnerUser.id.toString(),
                name: coOwner.coOwnerUser.name || "Unknown User",
                email: coOwner.coOwnerUser.email,
            })),
            affectedUserIds: [
                ...getProjectDashboardUserIds(project),
                ...requestedCoOwnerIds,
            ],
        };
    });

    await invalidateDashboardStats(result.affectedUserIds);
    return {
        allowCoOwners: result.allowCoOwners,
        coOwners: result.coOwners,
    };
}
