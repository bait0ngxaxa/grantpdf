import { reconcileDeletingFiles } from "./reconciliation";

const RECONCILIATION_INTERVAL_MS = 60 * 1000;
let workerStarted = false;

function runReconciliation(): void {
    void reconcileDeletingFiles().catch((error: unknown) => {
        console.error("File deletion reconciliation worker failed:", error);
    });
}

export function startFileDeletionReconciliationWorker(): void {
    if (workerStarted) return;
    workerStarted = true;

    runReconciliation();
    const timer = setInterval(runReconciliation, RECONCILIATION_INTERVAL_MS);
    timer.unref?.();
}
