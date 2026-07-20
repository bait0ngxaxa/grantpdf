export const FILE_DELETION_RECONCILIATION_PATH =
    "/api/internal/file-deletions";

const FILE_DELETION_RECONCILIATION_SECRET_ENV =
    "FILE_DELETION_RECONCILIATION_SECRET";

export function isAuthorizedFileDeletionJob(request: Request): boolean {
    const requestPath = new URL(request.url).pathname;
    const configuredSecret =
        process.env[FILE_DELETION_RECONCILIATION_SECRET_ENV];
    const authorization = request.headers.get("authorization");

    return (
        requestPath === FILE_DELETION_RECONCILIATION_PATH &&
        Boolean(configuredSecret) &&
        authorization === `Bearer ${configuredSecret}`
    );
}
