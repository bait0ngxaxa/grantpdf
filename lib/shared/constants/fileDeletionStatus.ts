export const FILE_DELETION_STATUS = {
    ACTIVE: "active",
    DELETING: "deleting",
    DELETED: "deleted",
} as const;

export type FileDeletionStatus =
    (typeof FILE_DELETION_STATUS)[keyof typeof FILE_DELETION_STATUS];
