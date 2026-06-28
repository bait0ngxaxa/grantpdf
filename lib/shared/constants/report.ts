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
