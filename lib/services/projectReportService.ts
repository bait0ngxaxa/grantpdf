import { prisma } from "@/lib/prisma";
import { REPORT_STATUS } from "@/lib/constants";
import type {
    AdminProjectReport,
    ProjectReport,
    UserFile,
} from "@/type/models";

interface CreateProjectReportParams {
    userId: number;
    projectId: number;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    reportType: string;
    note?: string;
}

interface RawReportFile {
    id: number;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    downloadStatus: string;
    downloadedAt: Date | null;
    created_at: Date;
    updated_at: Date | null;
}

interface RawProjectReport {
    id: number;
    projectId: number;
    userId: number;
    fileId: number;
    reportType: string;
    status: string;
    note: string | null;
    adminNote: string | null;
    submittedAt: Date;
    reviewedAt: Date | null;
    file: RawReportFile;
    user?: {
        name: string;
        email: string;
    };
    project?: {
        name: string;
        program?: {
            name: string;
        } | null;
    };
}

interface PaginatedAdminReportsResult {
    reports: AdminProjectReport[];
    total: number;
    page: number;
    totalPages: number;
}

const REPORT_FILE_SELECT = {
    id: true,
    originalFileName: true,
    storagePath: true,
    fileExtension: true,
    downloadStatus: true,
    downloadedAt: true,
    created_at: true,
    updated_at: true,
} as const;

function sanitizeReportFile(file: RawReportFile): UserFile {
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

function sanitizeProjectReport(report: RawProjectReport): ProjectReport {
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

function sanitizeAdminProjectReport(
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

export async function getProjectReportsForUser(
    projectId: number,
    _userId: number,
): Promise<ProjectReport[]> {
    const reports = await prisma.projectReport.findMany({
        where: { projectId },
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
        orderBy: { submittedAt: "desc" },
    });

    return reports.map((report) =>
        sanitizeProjectReport(report as unknown as RawProjectReport),
    );
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

        return tx.projectReport.create({
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
    });

    return sanitizeProjectReport(report as unknown as RawProjectReport);
}

export async function getProjectReportsForAdmin({
    page,
    limit,
    search,
    status,
    projectId,
}: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
    projectId?: number;
}): Promise<PaginatedAdminReportsResult> {
    const skip = (page - 1) * limit;
    const where = {
        ...(status && status !== "สถานะทั้งหมด" ? { status } : {}),
        ...(projectId ? { projectId } : {}),
        ...(search
            ? {
                  OR: [
                      { reportType: { contains: search } },
                      { project: { name: { contains: search } } },
                      { user: { name: { contains: search } } },
                      { user: { email: { contains: search } } },
                      { file: { originalFileName: { contains: search } } },
                  ],
              }
            : {}),
    };

    const [total, reports] = await Promise.all([
        prisma.projectReport.count({ where }),
        prisma.projectReport.findMany({
            where,
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
                user: { select: { name: true, email: true } },
                project: {
                    select: {
                        name: true,
                        program: { select: { name: true } },
                    },
                },
            },
            orderBy: { submittedAt: "desc" },
            skip,
            take: limit,
        }),
    ]);

    return {
        reports: reports.map((report) =>
            sanitizeAdminProjectReport(report as unknown as RawProjectReport),
        ),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
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
        const updateResult = await tx.projectReport.updateMany({
            where: {
                id: reportId,
                status: REPORT_STATUS.PENDING_REVIEW,
            },
            data: {
                status,
                adminNote,
                reviewedBy,
                reviewedAt: new Date(),
            },
        });

        if (updateResult.count !== 1) {
            throw new Error("PROJECT_REPORT_ALREADY_REVIEWED");
        }

        return tx.projectReport.findUniqueOrThrow({
            where: { id: reportId },
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
                user: { select: { name: true, email: true } },
                project: {
                    select: {
                        name: true,
                        program: { select: { name: true } },
                    },
                },
            },
        });
    });

    return sanitizeAdminProjectReport(report as unknown as RawProjectReport);
}
