import { startFileDeletionReconciliationWorker } from "@/lib/services/fileService/reconciliationWorker";
import { startUserPurgeWorker } from "@/lib/services/userService/purgeWorker";

if (
    process.env.NODE_ENV === "production" &&
    process.env.FILE_DELETION_RECONCILIATION_ENABLED !== "false"
) {
    startFileDeletionReconciliationWorker();
}

if (
    process.env.NODE_ENV === "production" &&
    process.env.USER_PURGE_ENABLED !== "false"
) {
    startUserPurgeWorker();
}
