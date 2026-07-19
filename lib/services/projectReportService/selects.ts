export const REPORT_FILE_SELECT = {
    id: true,
    originalFileName: true,
    storagePath: true,
    fileExtension: true,
    downloadStatus: true,
    downloadedAt: true,
    created_at: true,
    updated_at: true,
} as const;

export const ADMIN_REPORT_SELECT = {
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
            coOwners: { select: { coOwnerUserId: true } },
            program: { select: { name: true } },
        },
    },
} as const;
