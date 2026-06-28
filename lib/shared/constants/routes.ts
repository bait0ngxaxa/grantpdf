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
    NOTIFICATIONS: "/api/notifications",
    NOTIFICATIONS_READ: "/api/notifications/read",
    NOTIFICATIONS_READ_ALL: "/api/notifications/read-all",
    NOTIFICATIONS_SEEN_ALL: "/api/notifications/seen-all",
} as const;
