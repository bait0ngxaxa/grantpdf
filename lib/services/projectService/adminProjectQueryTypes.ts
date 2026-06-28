export type AdminSortKey =
    | "createdAtDesc"
    | "createdAtAsc"
    | "statusApproved"
    | "statusPending"
    | "statusRejected"
    | "statusEdit"
    | "statusClosed"
    | "statusDoneFirst"
    | "statusPendingFirst";

export type StatusSortKey =
    | "statusApproved"
    | "statusPending"
    | "statusRejected"
    | "statusEdit"
    | "statusClosed"
    | "statusDoneFirst"
    | "statusPendingFirst";

export type DateSortKey = "createdAtDesc" | "createdAtAsc";

export interface GetAllProjectsPaginatedParams {
    page: number;
    limit: number;
    programId?: number;
    search?: string;
    status?: string;
    fileType?: string;
    sortBy?: string;
}
