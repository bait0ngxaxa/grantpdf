import { parseActorUserId, toPrismaJsonValue } from "@/lib/server/audit/auditUtils";
import type { Prisma } from "@prisma/client";
import type { RawProjectReport, ReportAuditContext } from "./types";

export async function createReportStatusAudit(
    tx: Prisma.TransactionClient,
    report: RawProjectReport,
    audit: ReportAuditContext,
): Promise<void> {
    await tx.auditLog.create({
        data: {
            action: "ADMIN_PROJECT_REPORT_UPDATE",
            outcome: "success",
            actorUserId: parseActorUserId(audit.actorUserId),
            actorEmail: audit.actorEmail ?? null,
            targetType: "project_report",
            targetId: report.id.toString(),
            ip: audit.ip ?? null,
            userAgent: audit.userAgent ?? null,
            requestId: audit.requestId ?? null,
            details: toPrismaJsonValue({
                reportId: report.id,
                projectId: report.projectId,
                projectName: report.project?.name ?? null,
                status: report.status,
                userEmail: report.user?.email ?? null,
            }),
        },
    });
}
