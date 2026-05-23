import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        auditLog: {
            deleteMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";
import {
    AUDIT_LOG_RETENTION_DAYS,
    getAuditLogRetentionCutoffDate,
    purgeExpiredAuditLogs,
    purgeExpiredAuditLogsOncePerInterval,
} from "@/lib/services/auditRetentionService";

const mockedAuditDeleteMany = vi.mocked(prisma.auditLog.deleteMany);

describe("auditRetentionService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("calculates cutoff date from the 90 day retention window", () => {
        const now = new Date("2026-05-13T00:00:00.000Z");
        const cutoff = getAuditLogRetentionCutoffDate(now);

        expect(AUDIT_LOG_RETENTION_DAYS).toBe(90);
        expect(cutoff.toISOString()).toBe("2026-02-12T00:00:00.000Z");
    });

    it("deletes audit logs older than the retention cutoff", async () => {
        const now = new Date("2026-05-13T00:00:00.000Z");
        mockedAuditDeleteMany.mockResolvedValue({ count: 3 } as never);

        const deletedCount = await purgeExpiredAuditLogs(now);

        expect(deletedCount).toBe(3);
        expect(mockedAuditDeleteMany).toHaveBeenCalledWith({
            where: {
                created_at: {
                    lt: new Date("2026-02-12T00:00:00.000Z"),
                },
            },
        });
    });

    it("auto purges once per retention interval", async () => {
        const firstRun = new Date("2026-05-13T00:00:00.000Z");
        const sameInterval = new Date("2026-05-13T12:00:00.000Z");
        const nextInterval = new Date("2026-05-14T00:00:00.001Z");
        mockedAuditDeleteMany.mockResolvedValue({ count: 1 } as never);

        await expect(purgeExpiredAuditLogsOncePerInterval(firstRun)).resolves.toBe(1);
        await expect(purgeExpiredAuditLogsOncePerInterval(sameInterval)).resolves.toBe(0);
        await expect(purgeExpiredAuditLogsOncePerInterval(nextInterval)).resolves.toBe(1);

        expect(mockedAuditDeleteMany).toHaveBeenCalledTimes(2);
    });
});
