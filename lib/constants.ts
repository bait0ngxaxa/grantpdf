export const PAGINATION = {
    ITEMS_PER_PAGE: 5,
    PROJECTS_PER_PAGE: 5,
    USERS_PER_PAGE: 10,
} as const;

export const SESSION = {
    MAX_AGE_HOURS: 1,
    MAX_AGE_SECONDS: 60 * 60, // 1 hour
} as const;

export const FILE_TYPES = {
    ALL: "ไฟล์ทั้งหมด",
    PDF: "pdf",
    DOCX: "docx",
    XLSX: "xlsx",
} as const;

export const STATUS_FILTER = {
    ALL: "สถานะทั้งหมด",
} as const;

export const SORT_OPTIONS = {
    CREATED_AT_DESC: "createdAtDesc",
    CREATED_AT_ASC: "createdAtAsc",
    STATUS_DONE_FIRST: "statusDoneFirst",
    STATUS_PENDING_FIRST: "statusPendingFirst",
    STATUS_APPROVED: "statusApproved",
    STATUS_PENDING: "statusPending",
    STATUS_REJECTED: "statusRejected",
    STATUS_EDIT: "statusEdit",
    STATUS_CLOSED: "statusClosed",
} as const;

export const ROUTES = {
    HOME: "/",
    SIGNIN: "/signin",
    SIGNUP: "/signup",
    DASHBOARD: "/userdashboard",
    ADMIN: "/admin",
    CREATE_DOCS: "/createdocs",
    ACCESS_DENIED: "/access-denied",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
} as const;

export const API_ROUTES = {
    PROJECTS: "/api/projects",
    PROJECTS_STATS: "/api/projects/stats",
    USER_DOCS: "/api/user-docs",
    FILE_GENERATE_URL: "/api/file/generate-url",
    ADMIN_PROJECTS: "/api/admin/projects",
    ADMIN_USERS: "/api/admin/users",
} as const;

export const TEXT_LIMITS = {
    FILE_NAME_MAX_LENGTH: 30,
} as const;

export const FILE_UPLOAD = {
    ALLOWED_EXTENSIONS: [".docx", ".pdf"],
    SERVER_ALLOWED_EXTENSIONS: [
        ".docx",
        ".pdf",
        ".doc",
        ".jpg",
        ".jpeg",
        ".png",
        ".txt",
        ".xlsx",
        ".xls",
    ],
    MAX_SIZE_MB_BY_EXTENSION: {
        ".pdf": 5,
        ".docx": 3,
        ".doc": 3,
        ".xlsx": 3,
        ".xls": 3,
        ".jpg": 1,
        ".jpeg": 1,
        ".png": 1,
        ".txt": 1,
    },
    DEFAULT_MAX_SIZE_MB: 3,
} as const;

export function getFileExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf(".");
    if (dotIndex < 0) return "";
    return fileName.substring(dotIndex).toLowerCase();
}

export function getMaxUploadSizeMbByFileName(fileName: string): number {
    const extension = getFileExtension(fileName);
    return (
        FILE_UPLOAD.MAX_SIZE_MB_BY_EXTENSION[
            extension as keyof typeof FILE_UPLOAD.MAX_SIZE_MB_BY_EXTENSION
        ] ?? FILE_UPLOAD.DEFAULT_MAX_SIZE_MB
    );
}

export function getMaxUploadSizeBytesByFileName(fileName: string): number {
    return getMaxUploadSizeMbByFileName(fileName) * 1024 * 1024;
}
