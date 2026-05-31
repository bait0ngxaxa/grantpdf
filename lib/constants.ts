export const ROLES = {
    ADMIN: "admin",
    MEMBER: "member",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PAGINATION = {
    ITEMS_PER_PAGE: 5,
    PROJECTS_PER_PAGE: 5,
    PROGRAM_GROUP_PROJECTS_PER_PAGE: 5,
    USER_PROJECTS_API_PAGE_LIMIT: 25,
    ADMIN_PROJECTS_API_PAGE_LIMIT: 25,
    PROJECT_FILES_API_PAGE_LIMIT: 25,
    USERS_PER_PAGE: 10,
} as const;

export const SESSION = {
    ACCESS_TOKEN_MAX_AGE_SECONDS: 15 * 60,
    REFRESH_TOKEN_MAX_AGE_SECONDS: 30 * 24 * 60 * 60,
    ACCESS_COOKIE_NAME: "__Host-grant_access_token",
    REFRESH_COOKIE_NAME: "__Secure-grant_refresh_token",
    SESSION_HINT_COOKIE_NAME: "__Host-grant_session_hint",
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

export const REPORT_TYPES = {
    PROGRESS: "รายงานความก้าวหน้า",
    FINAL: "รายงานฉบับสมบูรณ์",
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

export const REPORT_TYPE_CONFIG = {
    [REPORT_TYPES.PROGRESS]: {
        badgeColor:
            "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-900/20 dark:text-sky-300",
    },
    [REPORT_TYPES.FINAL]: {
        badgeColor:
            "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-900/20 dark:text-violet-300",
    },
} as const;

export type ReportTypeConfigKey = keyof typeof REPORT_TYPE_CONFIG;

export const REPORT_STATUS = {
    PENDING_REVIEW: "รอตรวจสอบ",
    NEEDS_REVISION: "ต้องแก้ไข",
    APPROVED: "อนุมัติแล้ว",
} as const;

export type ReportStatus = (typeof REPORT_STATUS)[keyof typeof REPORT_STATUS];

export const REPORT_STATUS_CONFIG = {
    [REPORT_STATUS.PENDING_REVIEW]: {
        badgeColor:
            "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-300",
    },
    [REPORT_STATUS.NEEDS_REVISION]: {
        badgeColor:
            "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-900/20 dark:text-rose-300",
    },
    [REPORT_STATUS.APPROVED]: {
        badgeColor:
            "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
} as const;

export type ReportStatusConfigKey = keyof typeof REPORT_STATUS_CONFIG;

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
    SESSION_REFRESH: "/session-refresh",
    ACCESS_DENIED: "/access-denied",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
} as const;

/** Default callbackUrl for signOut redirects across the app */
export const SIGNOUT_CALLBACK = ROUTES.SIGNIN;

export const API_ROUTES = {
    PROGRAMS: "/api/programs",
    PROJECTS: "/api/projects",
    PROJECTS_SUMMARY: "/api/projects?view=summary",
    PROJECTS_STATS: "/api/projects/stats",
    USER_FILES: "/api/files",
    USER_DOCS: "/api/user-docs",
    FILE_GENERATE_URL: "/api/file/generate-url",
    ADMIN_PROJECTS: "/api/admin/projects",
    ADMIN_FILES: "/api/admin/files",
    ADMIN_PROJECT_CO_OWNERS: "/api/admin/project-co-owners",
    ADMIN_PROGRAMS: "/api/admin/programs",
    ADMIN_USERS: "/api/admin/users",
    ADMIN_AUDIT: "/api/admin/audit",
    ADMIN_REPORTS: "/api/admin/reports",
} as const;

export const TEXT_LIMITS = {
    FILE_NAME_MAX_LENGTH: 30,
} as const;

export const FILE_UPLOAD = {
    ALLOWED_EXTENSIONS: [
        ".docx",
        ".pdf",
        ".doc",
        ".xlsx",
        ".xls",
    ],
    MAX_SIZE_MB_BY_EXTENSION: {
        ".pdf": 10,
        ".docx": 10,
        ".doc": 10,
        ".xlsx": 10,
        ".xls": 10,
    },
    DEFAULT_MAX_SIZE_MB: 10,
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
        REFRESH: {
            ROUTE_KEY: "auth:refresh",
            LIMIT: 30,
            WINDOW_MS: 60_000,
        },
        LOGOUT: {
            ROUTE_KEY: "auth:logout",
            LIMIT: 30,
            WINDOW_MS: 60_000,
        },
        SESSIONS: {
            ROUTE_KEY: "auth:sessions",
            LIMIT: 60,
            WINDOW_MS: 60_000,
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
    ADMIN: {
        MUTATION: {
            ROUTE_KEY: "admin:mutation",
            LIMIT: 120,
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
