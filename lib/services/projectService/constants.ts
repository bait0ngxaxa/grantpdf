/** Shared Prisma select fragment for public user fields */
const USER_PUBLIC_SELECT = { id: true, name: true, email: true } as const;

/** Shared Prisma select fragment for attachment file fields */
const ATTACHMENT_SELECT = {
    id: true,
    fileName: true,
    filePath: true,
    fileSize: true,
    mimeType: true,
} as const;

export const PROJECT_INCLUDE = {
    program: {
        select: {
            id: true,
            name: true,
        },
    },
    user: {
        select: USER_PUBLIC_SELECT,
    },
    files: {
        include: {
            attachmentFiles: {
                select: ATTACHMENT_SELECT,
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
        select: USER_PUBLIC_SELECT,
    },
    attachmentFiles: {
        select: ATTACHMENT_SELECT,
    },
};

// Re-export from SSOT (lib/constants.ts)
export { VALID_STATUSES_SET } from "@/lib/constants";
