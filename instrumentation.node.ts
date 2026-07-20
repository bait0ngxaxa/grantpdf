import { startFileDeletionReconciliationWorker } from "@/lib/services/fileService/reconciliationWorker";

if (
    process.env.NODE_ENV === "production" &&
    process.env.FILE_DELETION_RECONCILIATION_ENABLED !== "false"
) {
    startFileDeletionReconciliationWorker();
}
