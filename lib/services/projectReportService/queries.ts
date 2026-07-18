import { prisma } from "@/lib/server/db";
import { FILE_DELETION_STATUS } from "@/lib/shared/constants";
import { REPORT_FILE_SELECT } from "./selects";
import {
    sanitizeAdminProjectReport,
    sanitizeProjectReport,
} from "./sanitizers";
import type {
    PaginatedAdminReportsResult,
    ProjectReport,
    RawProjectReport,
} from "./types";

export async function getProjectReportsForUser(
    projectId: number,
    _userId: number,
): Promise<ProjectReport[]> {
    const reports = await prisma.projectReport.findMany({
        where: {
            projectId,
            file: { deletionStatus: FILE_DELETION_STATUS.ACTIVE },
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
        orderBy: { submittedAt: "desc" },
    });

    return reports.map((report) =>
        sanitizeProjectReport(report as unknown as RawProjectReport),
    );
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
        file: { deletionStatus: FILE_DELETION_STATUS.ACTIVE },
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
