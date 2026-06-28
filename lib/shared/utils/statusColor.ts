import {
    REPORT_STATUS_CONFIG,
    REPORT_TYPE_CONFIG,
    STATUS_CONFIG,
    type ReportStatusConfigKey,
    type ReportTypeConfigKey,
    type StatusConfigKey,
} from "@/lib/shared/constants";

const DEFAULT_BADGE_COLOR =
    "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";

export function getStatusColor(status: string): string {
    const config = STATUS_CONFIG[status as StatusConfigKey];
    return config?.badgeColor ?? DEFAULT_BADGE_COLOR;
}

export function getReportStatusColor(status: string): string {
    const config = REPORT_STATUS_CONFIG[status as ReportStatusConfigKey];
    return config?.badgeColor ?? DEFAULT_BADGE_COLOR;
}

export function getReportTypeColor(reportType: string): string {
    const config = REPORT_TYPE_CONFIG[reportType as ReportTypeConfigKey];
    return config?.badgeColor ?? DEFAULT_BADGE_COLOR;
}
