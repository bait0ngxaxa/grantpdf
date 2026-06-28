import { PROJECT_STATUS } from "@/type/models";
import type { DateSortKey, StatusSortKey } from "./adminProjectQueryTypes";

export const ADMIN_DATE_SORT_ORDER_MAP: Record<DateSortKey, object> = {
    createdAtDesc: { created_at: "desc" },
    createdAtAsc: { created_at: "asc" },
};

const DEFAULT_STATUS_PRIORITY = [
    PROJECT_STATUS.IN_PROGRESS,
    PROJECT_STATUS.APPROVED,
    PROJECT_STATUS.REJECTED,
    PROJECT_STATUS.EDIT,
    PROJECT_STATUS.CLOSED,
] as const;

const STATUS_SORT_TARGET_MAP: Record<StatusSortKey, string> = {
    statusApproved: PROJECT_STATUS.APPROVED,
    statusPending: PROJECT_STATUS.IN_PROGRESS,
    statusRejected: PROJECT_STATUS.REJECTED,
    statusEdit: PROJECT_STATUS.EDIT,
    statusClosed: PROJECT_STATUS.CLOSED,
    statusDoneFirst: PROJECT_STATUS.APPROVED,
    statusPendingFirst: PROJECT_STATUS.IN_PROGRESS,
};

export function isStatusSortKey(sortBy: string): sortBy is StatusSortKey {
    return sortBy in STATUS_SORT_TARGET_MAP;
}

export function getStatusPriority(sortBy: StatusSortKey): readonly string[] {
    const targetStatus = STATUS_SORT_TARGET_MAP[sortBy];

    return [
        targetStatus,
        ...DEFAULT_STATUS_PRIORITY.filter((status) => status !== targetStatus),
    ];
}
