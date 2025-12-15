export const PAGINATION = {
    ITEMS_PER_PAGE: 5,
    PROJECTS_PER_PAGE: 5,
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
    USER_DOCS: "/api/user-docs",
    ADMIN_PROJECTS: "/api/admin/projects",
    ADMIN_USERS: "/api/admin/users",
} as const;

export const TEXT_LIMITS = {
    FILE_NAME_MAX_LENGTH: 30,
} as const;
