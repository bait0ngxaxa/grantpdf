export const STATUS_FILTER = {
    ALL: "สถานะทั้งหมด",
} as const;

export const PROJECT_STATUS = {
    IN_PROGRESS: "กำลังดำเนินการ",
    APPROVED: "อนุมัติ",
    REJECTED: "ไม่อนุมัติ",
    EDIT: "แก้ไข",
    CLOSED: "ปิดโครงการ",
} as const;

export type ProjectStatus =
    (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const VALID_STATUSES_SET: ReadonlySet<string> = new Set(
    Object.values(PROJECT_STATUS),
);

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
