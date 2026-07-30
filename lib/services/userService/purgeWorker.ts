import { purgeDeletedUsers } from "./purge";

const PURGE_INTERVAL_MS = 60 * 1000;
let workerStarted = false;

function runPurge(): void {
    void purgeDeletedUsers().catch((error: unknown) => {
        console.error("User purge worker failed:", error);
    });
}

export function startUserPurgeWorker(): void {
    if (workerStarted) return;
    workerStarted = true;

    runPurge();
    const timer = setInterval(runPurge, PURGE_INTERVAL_MS);
    timer.unref?.();
}
