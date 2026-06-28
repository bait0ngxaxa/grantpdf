import { ROLES } from "@/lib/shared/constants";
import { toPrismaJsonValue } from "@/lib/server/audit/auditUtils";
import {
    NOTIFICATION_AUDIENCE,
    NOTIFICATION_TYPE,
    type NotificationAudience,
    type NotificationType,
} from "@/lib/notifications/constants";
import {
    buildNotificationActionUrl,
    NOTIFICATION_ACTION_TARGET,
} from "@/lib/notifications/deepLink";
import { Prisma } from "@prisma/client";

interface CreateNotificationEventInput {
    type: NotificationType;
    audience: NotificationAudience;
    recipientUserIds: number[];
    title: string;
    message: string;
    actorUserId?: number | null;
    projectId?: number | null;
    projectReportId?: number | null;
    actionUrl?: string;
    metadata?: Record<string, unknown>;
    dedupeKey?: string;
}

interface ReportReviewerTarget {
    projectName: string;
    recipientUserIds: number[];
}

interface ProjectDocumentTarget {
    projectName: string;
    recipientUserIds: number[];
}

function truncateText(value: string, maxLength: number): string {
    const trimmed = value.trim();
    if (trimmed.length <= maxLength) return trimmed;
    return `${trimmed.slice(0, maxLength - 1)}…`;
}

function uniqueRecipientIds(ids: number[], excludedId?: number): number[] {
    const uniqueIds = new Set<number>();
    for (const id of ids) {
        if (Number.isInteger(id) && id > 0 && id !== excludedId) {
            uniqueIds.add(id);
        }
    }
    return [...uniqueIds];
}

function getOwnerAndCoOwnerRecipientIds(
    ownerUserId: number,
    coOwnerUserIds: number[] = [],
): number[] {
    return uniqueRecipientIds([ownerUserId, ...coOwnerUserIds]);
}

function isUniqueConstraintError(error: unknown): boolean {
    return (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
    );
}

async function getAdminUserIds(
    tx: Prisma.TransactionClient,
): Promise<number[]> {
    const users = await tx.user.findMany({
        where: { role: ROLES.ADMIN },
        select: { id: true },
    });
    return uniqueRecipientIds(users.map((user) => user.id));
}

async function getReportReviewerRecipientIds(
    tx: Prisma.TransactionClient,
    projectId: number,
): Promise<ReportReviewerTarget | null> {
    const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { name: true },
    });
    if (!project) return null;

    return {
        projectName: project.name,
        recipientUserIds: await getAdminUserIds(tx),
    };
}

async function getProjectDocumentTarget(
    tx: Prisma.TransactionClient,
    projectId: number,
): Promise<ProjectDocumentTarget | null> {
    const project = await tx.project.findUnique({
        where: { id: projectId },
        select: { name: true },
    });
    if (!project) return null;

    return {
        projectName: project.name,
        recipientUserIds: await getAdminUserIds(tx),
    };
}

export async function createNotificationEvent(
    tx: Prisma.TransactionClient,
    input: CreateNotificationEventInput,
): Promise<void> {
    const recipientUserIds = uniqueRecipientIds(input.recipientUserIds);
    if (recipientUserIds.length === 0) return;

    try {
        await tx.notificationEvent.create({
            data: {
                type: input.type,
                actorUserId: input.actorUserId ?? null,
                projectId: input.projectId ?? null,
                projectReportId: input.projectReportId ?? null,
                title: truncateText(input.title, 160),
                message: truncateText(input.message, 500),
                actionUrl: input.actionUrl ?? null,
                metadata: input.metadata
                    ? toPrismaJsonValue(input.metadata)
                    : undefined,
                dedupeKey: input.dedupeKey,
                recipients: {
                    create: recipientUserIds.map((recipientUserId) => ({
                        recipientUserId,
                        audience: input.audience,
                    })),
                },
            },
        });
    } catch (error) {
        if (!isUniqueConstraintError(error)) throw error;
    }
}

export async function notifyProjectCreated(
    tx: Prisma.TransactionClient,
    params: { projectId: number; projectName: string; actorUserId: number },
): Promise<void> {
    const recipientUserIds = await getAdminUserIds(tx);
    await createNotificationEvent(tx, {
        type: NOTIFICATION_TYPE.PROJECT_CREATED,
        audience: NOTIFICATION_AUDIENCE.ADMIN,
        actorUserId: params.actorUserId,
        projectId: params.projectId,
        recipientUserIds,
        title: "มีโครงการใหม่",
        message: `มีโครงการ "${params.projectName}" เข้าสู่ระบบ`,
        actionUrl: buildNotificationActionUrl({
            pathname: "/admin",
            projectId: params.projectId,
            target: NOTIFICATION_ACTION_TARGET.PROJECT,
        }),
        metadata: { projectName: params.projectName },
        dedupeKey: `project-created:${params.projectId}`,
    });
}

export async function notifyProjectStatusUpdated(
    tx: Prisma.TransactionClient,
    params: {
        projectId: number;
        projectName: string;
        ownerUserId: number;
        coOwnerUserIds?: number[];
        status: string;
        actorUserId: number | null;
        updatedAt: Date;
    },
): Promise<void> {
    await createNotificationEvent(tx, {
        type: NOTIFICATION_TYPE.PROJECT_STATUS_UPDATED,
        audience: NOTIFICATION_AUDIENCE.USER,
        actorUserId: params.actorUserId,
        projectId: params.projectId,
        recipientUserIds: getOwnerAndCoOwnerRecipientIds(
            params.ownerUserId,
            params.coOwnerUserIds,
        ),
        title: "สถานะโครงการถูกอัปเดต",
        message: `โครงการ "${params.projectName}" เปลี่ยนเป็น "${params.status}"`,
        actionUrl: buildNotificationActionUrl({
            pathname: "/userdashboard",
            projectId: params.projectId,
            target: NOTIFICATION_ACTION_TARGET.STATUS,
        }),
        metadata: { projectName: params.projectName, status: params.status },
        dedupeKey: `project-status:${params.projectId}:${params.updatedAt.getTime()}`,
    });
}

export async function notifyProjectReportSubmitted(
    tx: Prisma.TransactionClient,
    params: {
        reportId: number;
        projectId: number;
        reportType: string;
        actorUserId: number;
    },
): Promise<void> {
    const target = await getReportReviewerRecipientIds(
        tx,
        params.projectId,
    );
    if (!target) return;

    await createNotificationEvent(tx, {
        type: NOTIFICATION_TYPE.PROJECT_REPORT_SUBMITTED,
        audience: NOTIFICATION_AUDIENCE.ADMIN,
        actorUserId: params.actorUserId,
        projectId: params.projectId,
        projectReportId: params.reportId,
        recipientUserIds: target.recipientUserIds,
        title: "มีรายงานใหม่ในโครงการ",
        message: `${params.reportType} ของโครงการ "${target.projectName}" รอตรวจสอบ`,
        actionUrl: buildNotificationActionUrl({
            pathname: "/admin",
            projectId: params.projectId,
            target: NOTIFICATION_ACTION_TARGET.REPORTS,
        }),
        metadata: {
            projectName: target.projectName,
            reportType: params.reportType,
        },
        dedupeKey: `project-report-submitted:${params.reportId}`,
    });
}

export async function notifyProjectReportReviewed(
    tx: Prisma.TransactionClient,
    params: {
        reportId: number;
        projectId: number;
        projectName: string;
        reportType: string;
        status: string;
        ownerUserId: number;
        coOwnerUserIds?: number[];
        actorUserId: number;
    },
): Promise<void> {
    await createNotificationEvent(tx, {
        type: NOTIFICATION_TYPE.PROJECT_REPORT_REVIEWED,
        audience: NOTIFICATION_AUDIENCE.USER,
        actorUserId: params.actorUserId,
        projectId: params.projectId,
        projectReportId: params.reportId,
        recipientUserIds: getOwnerAndCoOwnerRecipientIds(
            params.ownerUserId,
            params.coOwnerUserIds,
        ),
        title: "ผลตรวจรายงานพร้อมแล้ว",
        message: `${params.reportType} ของโครงการ "${params.projectName}" ถูกอัปเดตเป็น "${params.status}"`,
        actionUrl: buildNotificationActionUrl({
            pathname: "/userdashboard",
            projectId: params.projectId,
            target: NOTIFICATION_ACTION_TARGET.REPORTS,
        }),
        metadata: {
            projectName: params.projectName,
            reportType: params.reportType,
            status: params.status,
        },
        dedupeKey: `project-report-reviewed:${params.reportId}`,
    });
}

export async function notifyProjectDocumentUploaded(
    tx: Prisma.TransactionClient,
    params: {
        fileId: number;
        projectId: number;
        fileName: string;
        actorUserId: number;
    },
): Promise<void> {
    const target = await getProjectDocumentTarget(tx, params.projectId);
    if (!target) return;

    await createNotificationEvent(tx, {
        type: NOTIFICATION_TYPE.PROJECT_DOCUMENT_UPLOADED,
        audience: NOTIFICATION_AUDIENCE.ADMIN,
        actorUserId: params.actorUserId,
        projectId: params.projectId,
        recipientUserIds: target.recipientUserIds,
        title: "มีเอกสารใหม่ในโครงการ",
        message: `มีเอกสาร "${params.fileName}" ถูกเพิ่มในโครงการ "${target.projectName}"`,
        actionUrl: buildNotificationActionUrl({
            pathname: "/admin",
            projectId: params.projectId,
            target: NOTIFICATION_ACTION_TARGET.FILES,
        }),
        metadata: {
            projectName: target.projectName,
            fileName: params.fileName,
        },
        dedupeKey: `project-document-uploaded:${params.fileId}`,
    });
}

export async function notifyProjectCoOwnersAssigned(
    tx: Prisma.TransactionClient,
    params: {
        projectId: number;
        projectName: string;
        assignedUserIds: number[];
        actorUserId: number;
        assignedAt: Date;
    },
): Promise<void> {
    const recipientIds = uniqueRecipientIds(params.assignedUserIds);
    if (recipientIds.length === 0) {
        return;
    }

    await createNotificationEvent(tx, {
        type: NOTIFICATION_TYPE.PROJECT_CO_OWNER_ASSIGNED,
        audience: NOTIFICATION_AUDIENCE.USER,
        actorUserId: params.actorUserId,
        projectId: params.projectId,
        recipientUserIds: recipientIds,
        title: "ได้รับมอบหมายเป็นเจ้าของร่วม",
        message: `คุณได้รับสิทธิ์ดูแลโครงการ "${params.projectName}"`,
        actionUrl: buildNotificationActionUrl({
            pathname: "/userdashboard",
            projectId: params.projectId,
            target: NOTIFICATION_ACTION_TARGET.PROJECT,
        }),
        metadata: { projectName: params.projectName },
        dedupeKey: `project-co-owner-assigned:${params.projectId}:${params.assignedAt.getTime()}:user`,
    });
}
