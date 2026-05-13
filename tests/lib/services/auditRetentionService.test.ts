import { describe, expect, it, vi } from "vitest";

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
} from "@/lib/services/auditRetentionService";

const mockedAuditDeleteMany = vi.mocked(prisma.auditLog.deleteMany);

describe("auditRetentionService", () => {
    it("calculates cutoff date from the 180 day retention window", () => {
        const now = new Date("2026-05-13T00:00:00.000Z");
        const cutoff = getAuditLogRetentionCutoffDate(now);

        expect(AUDIT_LOG_RETENTION_DAYS).toBe(180);
        expect(cutoff.toISOString()).toBe("2025-11-14T00:00:00.000Z");
    });

    it("deletes audit logs older than the retention cutoff", async () => {
        const now = new Date("2026-05-13T00:00:00.000Z");
        mockedAuditDeleteMany.mockResolvedValue({ count: 3 } as never);

        const deletedCount = await purgeExpiredAuditLogs(now);

        expect(deletedCount).toBe(3);
        expect(mockedAuditDeleteMany).toHaveBeenCalledWith({
            where: {
                created_at: {
                    lt: new Date("2025-11-14T00:00:00.000Z"),
                },
            },
        });
    });
});
