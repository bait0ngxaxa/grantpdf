export const FILE_DELETION_RECONCILIATION_PATH =
    "/api/internal/file-deletions";

export const USER_PURGE_PATH = "/api/internal/user-purge";

const FILE_DELETION_RECONCILIATION_SECRET_ENV =
    "FILE_DELETION_RECONCILIATION_SECRET";
const USER_PURGE_SECRET_ENV = "USER_PURGE_SECRET";

function isAuthorizedInternalJob(
    request: Request,
    path: string,
    secretEnv: string,
): boolean {
    const requestPath = new URL(request.url).pathname;
    const configuredSecret = process.env[secretEnv];
    const authorization = request.headers.get("authorization");

    return (
        requestPath === path &&
        Boolean(configuredSecret) &&
        authorization === `Bearer ${configuredSecret}`
    );
}

export function isAuthorizedFileDeletionJob(request: Request): boolean {
    return isAuthorizedInternalJob(
        request,
        FILE_DELETION_RECONCILIATION_PATH,
        FILE_DELETION_RECONCILIATION_SECRET_ENV,
    );
}

export function isAuthorizedUserPurgeJob(request: Request): boolean {
    return isAuthorizedInternalJob(
        request,
        USER_PURGE_PATH,
        USER_PURGE_SECRET_ENV,
    );
}
