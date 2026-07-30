export const USER_LIFECYCLE_STATUS = {
    ACTIVE: "active",
    DELETED: "deleted",
} as const;

export const USER_LIFECYCLE = {
    PURGE_AFTER_DAYS: 30,
    ANONYMIZED_EMAIL_DOMAIN: "deleted.invalid",
} as const;
