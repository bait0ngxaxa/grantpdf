export const PROJECT_INCLUDE = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    files: {
        include: {
            attachmentFiles: {
                select: {
                    id: true,
                    fileName: true,
                    filePath: true,
                    fileSize: true,
                    mimeType: true,
                },
            },
        },
        orderBy: { created_at: "desc" as const },
    },
    _count: {
        select: { files: true },
    },
};

export const ORPHAN_FILES_INCLUDE = {
    user: {
        select: {
            id: true,
            name: true,
            email: true,
        },
    },
    attachmentFiles: {
        select: {
            id: true,
            fileName: true,
            filePath: true,
            fileSize: true,
            mimeType: true,
        },
    },
};

export const VALID_STATUSES = [
    "กำลังดำเนินการ",
    "อนุมัติ",
    "ไม่อนุมัติ",
    "แก้ไข",
    "ปิดโครงการ",
] as const;
