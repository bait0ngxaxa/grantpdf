export const USER_DASHBOARD_TAB = {
    DASHBOARD: "dashboard",
    PROJECTS: "projects",
} as const;

export type UserDashboardTab =
    (typeof USER_DASHBOARD_TAB)[keyof typeof USER_DASHBOARD_TAB];

export const USER_DASHBOARD_ACTION = {
    CREATE_PROJECT: "create-project",
} as const;

export type UserDashboardAction =
    (typeof USER_DASHBOARD_ACTION)[keyof typeof USER_DASHBOARD_ACTION];
