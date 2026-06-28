import { REPORT_STATUS } from "@/lib/shared/constants";
import { prisma } from "@/lib/server/db";
import { invalidateDashboardStats } from "@/lib/services/dashboardStatsCache";
import {
    notifyProjectReportReviewed,
    notifyProjectReportSubmitted,
} from "@/lib/services/notificationEventService";
import type { Prisma } from "@prisma/client";
import { createReportStatusAudit } from "./audit";
import { ADMIN_REPORT_SELECT, REPORT_FILE_SELECT } from "./selects";
import {
    sanitizeAdminProjectReport,
    sanitizeProjectReport,
} from "./sanitizers";
import type {
    AdminProjectReport,
    CreateProjectReportParams,
    ProjectReport,
    RawProjectReport,
    ReportAuditContext,
} from "./types";

async function updatePendingProjectReport(
    tx: Prisma.TransactionClient,
    params: {
        reportId: number;
        status: string;
        adminNote?: string;
        reviewedBy: number;
    },
): Promise<unknown> {
    const updateResult = await tx.projectReport.updateMany({
        where: {
            id: params.reportId,
            status: REPORT_STATUS.PENDING_REVIEW,
        },
        data: {
            status: params.status,
            adminNote: params.adminNote,
            reviewedBy: params.reviewedBy,
            reviewedAt: new Date(),
        },
    });

    if (updateResult.count !== 1) {
        throw new Error("PROJECT_REPORT_ALREADY_REVIEWED");
    }

    return tx.projectReport.findUniqueOrThrow({
        where: { id: params.reportId },
        select: ADMIN_REPORT_SELECT,
    });
}

export async function createProjectReportWithFile({
    userId,
    projectId,
    originalFileName,
    storagePath,
    fileExtension,
    reportType,
    note,
}: CreateProjectReportParams): Promise<ProjectReport> {
    const report = await prisma.$transaction(async (tx) => {
        const userFile = await tx.userFile.create({
            data: { originalFileName, storagePath, fileExtension, userId, projectId },
        });

        const createdReport = await tx.projectReport.create({
            data: {
                reportType,
                note,
                status: REPORT_STATUS.PENDING_REVIEW,
                userId,
                projectId,
                fileId: userFile.id,
            },
            select: {
                id: true,
                projectId: true,
                userId: true,
                fileId: true,
                reportType: true,
                status: true,
                note: true,
                adminNote: true,
                submittedAt: true,
                reviewedAt: true,
                file: { select: REPORT_FILE_SELECT },
            },
        });

        await notifyProjectReportSubmitted(tx, {
            reportId: createdReport.id,
            projectId,
            reportType,
            actorUserId: userId,
        });

        return createdReport;
    });

    await invalidateDashboardStats([userId]);
    return sanitizeProjectReport(report as unknown as RawProjectReport);
}

export async function updateProjectReportStatus({
    reportId,
    status,
    adminNote,
    reviewedBy,
}: {
    reportId: number;
    status: string;
    adminNote?: string;
    reviewedBy: number;
}): Promise<AdminProjectReport> {
    const report = await prisma.$transaction(async (tx) => {
        return updatePendingProjectReport(tx, {
            reportId,
            status,
            adminNote,
            reviewedBy,
        });
    });

    return sanitizeAdminProjectReport(report as unknown as RawProjectReport);
}

export async function updateProjectReportStatusWithAudit({
    reportId,
    status,
    adminNote,
    reviewedBy,
    audit,
}: {
    reportId: number;
    status: string;
    adminNote?: string;
    reviewedBy: number;
    audit: ReportAuditContext;
}): Promise<AdminProjectReport> {
    const report = await prisma.$transaction(async (tx) => {
        const updated = await updatePendingProjectReport(tx, {
            reportId,
            status,
            adminNote,
            reviewedBy,
        });
        const rawReport = updated as RawProjectReport;

        await createReportStatusAudit(tx, rawReport, audit);
        await notifyProjectReportReviewed(tx, {
            reportId: rawReport.id,
            projectId: rawReport.projectId,
            projectName: rawReport.project?.name ?? "ไม่พบชื่อโครงการ",
            reportType: rawReport.reportType,
            status: rawReport.status,
            ownerUserId: rawReport.userId,
            coOwnerUserIds:
                rawReport.project?.coOwners?.map(
                    (coOwner) => coOwner.adminUserId,
                ) ?? [],
            actorUserId: reviewedBy,
        });

        return rawReport;
    });

    return sanitizeAdminProjectReport(report);
}
