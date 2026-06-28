import type {
    AdminProjectReport,
    ProjectReport,
    RawProjectReport,
    RawReportFile,
    UserFile,
} from "./types";

export function sanitizeReportFile(file: RawReportFile): UserFile {
    return {
        id: file.id.toString(),
        originalFileName: file.originalFileName,
        storagePath: file.storagePath,
        fileExtension: file.fileExtension,
        downloadStatus: file.downloadStatus,
        downloadedAt: file.downloadedAt?.toISOString(),
        created_at: file.created_at.toISOString(),
        updated_at: file.updated_at?.toISOString() ?? file.created_at.toISOString(),
    };
}

export function sanitizeProjectReport(
    report: RawProjectReport,
): ProjectReport {
    return {
        id: report.id.toString(),
        projectId: report.projectId.toString(),
        userId: report.userId.toString(),
        fileId: report.fileId.toString(),
        reportType: report.reportType,
        status: report.status,
        note: report.note ?? undefined,
        adminNote: report.adminNote ?? undefined,
        submittedAt: report.submittedAt.toISOString(),
        reviewedAt: report.reviewedAt?.toISOString(),
        file: sanitizeReportFile(report.file),
    };
}

export function sanitizeAdminProjectReport(
    report: RawProjectReport,
): AdminProjectReport {
    return {
        ...sanitizeProjectReport(report),
        projectName: report.project?.name ?? "ไม่พบชื่อโครงการ",
        programName: report.project?.program?.name,
        userName: report.user?.name ?? "ไม่พบชื่อผู้ใช้",
        userEmail: report.user?.email ?? "ไม่พบอีเมล",
    };
}
