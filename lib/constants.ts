export const ROLES = {
    ADMIN: "admin",
    MEMBER: "member",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

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

// =====================================================
// Project Status — Single Source of Truth
// =====================================================
export const PROJECT_STATUS = {
    IN_PROGRESS: "กำลังดำเนินการ",
    APPROVED: "อนุมัติ",
    REJECTED: "ไม่อนุมัติ",
    EDIT: "แก้ไข",
    CLOSED: "ปิดโครงการ",
} as const;

export type ProjectStatus =
    (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

/** O(1) lookup Set derived from PROJECT_STATUS for validation */
export const VALID_STATUSES_SET: ReadonlySet<string> = new Set(
    Object.values(PROJECT_STATUS),
);

/** UI configuration for each project status (labels, colors, dot indicators) */
export const STATUS_CONFIG = {
    [PROJECT_STATUS.IN_PROGRESS]: {
        key: "pending" as const,
        label: "รอดำเนินการ",
        dotColor: "bg-yellow-400 dark:bg-yellow-500",
        badgeColor:
            "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30",
    },
    [PROJECT_STATUS.APPROVED]: {
        key: "approved" as const,
        label: "อนุมัติแล้ว",
        dotColor: "bg-green-500 dark:bg-green-500",
        badgeColor:
            "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
    },
    [PROJECT_STATUS.REJECTED]: {
        key: "rejected" as const,
        label: "ไม่อนุมัติ",
        dotColor: "bg-red-500 dark:bg-red-500",
        badgeColor:
            "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
    },
    [PROJECT_STATUS.EDIT]: {
        key: "editing" as const,
        label: "ต้องแก้ไข",
        dotColor: "bg-orange-500 dark:bg-orange-500",
        badgeColor:
            "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30",
    },
    [PROJECT_STATUS.CLOSED]: {
        key: "closed" as const,
        label: "ปิดโครงการ",
        dotColor: "bg-slate-500 dark:bg-slate-500",
        badgeColor:
            "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
    },
} as const;

export type StatusConfigKey = keyof typeof STATUS_CONFIG;
export const STATUS_ORDER = [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.REJECTED,
    PROJECT_STATUS.EDIT,
    PROJECT_STATUS.CLOSED,
] as const;

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

/** Default callbackUrl for signOut redirects across the app */
export const SIGNOUT_CALLBACK = ROUTES.SIGNIN;

export const API_ROUTES = {
    PROJECTS: "/api/projects",
    PROJECTS_SUMMARY: "/api/projects?view=summary",
    PROJECTS_STATS: "/api/projects/stats",
    USER_DOCS: "/api/user-docs",
    FILE_GENERATE_URL: "/api/file/generate-url",
    ADMIN_PROJECTS: "/api/admin/projects",
    ADMIN_USERS: "/api/admin/users",
    ADMIN_AUDIT: "/api/admin/audit",
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
    TIMEOUT_MS: 60_000,
} as const;

export const RATE_LIMIT = {
    AUTH: {
        SIGNUP: {
            ROUTE_KEY: "auth:signup",
            LIMIT: 5,
            WINDOW_MS: 60_000,
        },
        SIGNIN: {
            ROUTE_KEY: "auth:signin",
            LIMIT: 10,
            WINDOW_MS: 60_000,
        },
        FORGOT_PASSWORD: {
            ROUTE_KEY: "auth:forgot-password",
            LIMIT: 3,
            WINDOW_MS: 15 * 60_000,
        },
        RESET_PASSWORD: {
            ROUTE_KEY: "auth:reset-password",
            LIMIT: 5,
            WINDOW_MS: 15 * 60_000,
        },
    },
    USER: {
        PROJECT_MUTATION: {
            ROUTE_KEY: "user:project-mutation",
            LIMIT: 20,
            WINDOW_MS: 60_000,
        },
        DOCUMENT_GENERATE: {
            ROUTE_KEY: "user:document-generate",
            LIMIT: 12,
            WINDOW_MS: 60_000,
        },
    },
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
