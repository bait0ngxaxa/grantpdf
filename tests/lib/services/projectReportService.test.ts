import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IdempotencyCompletionContext } from "@/lib/services/documentIdempotencyService";

const mocks = vi.hoisted(() => ({
    transaction: vi.fn(),
    userFileCreate: vi.fn(),
    projectReportCreate: vi.fn(),
    notifyProjectReportSubmitted: vi.fn(),
    reserveStorageQuota: vi.fn(),
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        $transaction: mocks.transaction,
    },
}));

vi.mock("@/lib/services/storageQuotaService", () => ({
    reserveStorageQuota: mocks.reserveStorageQuota,
}));

vi.mock("@/lib/services/notificationEventService", () => ({
    notifyProjectReportSubmitted: mocks.notifyProjectReportSubmitted,
    notifyProjectReportReviewed: vi.fn(),
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: mocks.invalidateDashboardStats,
}));

import { prisma } from "@/lib/server/db";
import { createProjectReportWithFile } from "@/lib/services/projectReportService";

const mockedTransaction = vi.mocked(prisma.$transaction);

interface MockTransactionClient {
    userFile: {
        create: ReturnType<typeof vi.fn>;
    };
    projectReport: {
        create: ReturnType<typeof vi.fn>;
    };
}

function createTransactionClient(): MockTransactionClient {
    return {
        userFile: { create: mocks.userFileCreate },
        projectReport: { create: mocks.projectReportCreate },
    };
}

function createReportRecord(): Record<string, unknown> {
    const timestamp = new Date("2026-07-19T00:00:00.000Z");
    return {
        id: 41,
        projectId: 12,
        userId: 7,
        fileId: 88,
        reportType: "progress",
        status: "PENDING_REVIEW",
        note: "note",
        adminNote: null,
        submittedAt: timestamp,
        reviewedAt: null,
        file: {
            id: 88,
            originalFileName: "report.pdf",
            storagePath: "reports/report.pdf",
            fileExtension: "pdf",
            downloadStatus: "NOT_DOWNLOADED",
            downloadedAt: null,
            created_at: timestamp,
            updated_at: timestamp,
        },
    };
}

function createParams(
    complete: IdempotencyCompletionContext["complete"],
): {
    userId: number;
    projectId: number;
    originalFileName: string;
    storagePath: string;
    fileExtension: string;
    fileSize: number;
    reportType: string;
    idempotency: {
        recordId: bigint;
        leaseToken: string;
        complete: IdempotencyCompletionContext["complete"];
    };
} {
    return {
        userId: 7,
        projectId: 12,
        originalFileName: "report.pdf",
        storagePath: "reports/report.pdf",
        fileExtension: "pdf",
        fileSize: 256,
        reportType: "progress",
        idempotency: {
            recordId: BigInt(1),
            leaseToken: "lease-token",
            complete,
        },
    };
}

describe("createProjectReportWithFile idempotency", () => {
    let tx: MockTransactionClient;

    beforeEach(() => {
        vi.clearAllMocks();
        tx = createTransactionClient();
        mockedTransaction.mockImplementation(async (callback) =>
            callback(tx as never),
        );
        mocks.reserveStorageQuota.mockResolvedValue(true);
        mocks.userFileCreate.mockResolvedValue({ id: 88 });
        mocks.projectReportCreate.mockResolvedValue(createReportRecord());
        mocks.notifyProjectReportSubmitted.mockResolvedValue(undefined);
        mocks.invalidateDashboardStats.mockResolvedValue(undefined);
    });

    it("completes idempotency on the same transaction as report persistence", async () => {
        const complete = vi
            .fn<IdempotencyCompletionContext["complete"]>()
            .mockResolvedValue(undefined);

        const result = await createProjectReportWithFile(createParams(complete));

        expect(result.id).toBe("41");
        expect(complete).toHaveBeenCalledWith(
            tx,
            41,
            expect.objectContaining({
                success: true,
                report: expect.objectContaining({ id: "41" }),
            }),
        );
        expect(mockedTransaction).toHaveBeenCalledOnce();
    });

    it("propagates completion failure so the transaction cannot return success", async () => {
        const completionError = new Error("COMPLETION_UNAVAILABLE");
        const complete = vi
            .fn<IdempotencyCompletionContext["complete"]>()
            .mockRejectedValue(completionError);

        await expect(
            createProjectReportWithFile(createParams(complete)),
        ).rejects.toThrow("COMPLETION_UNAVAILABLE");
        expect(mocks.invalidateDashboardStats).not.toHaveBeenCalled();
    });
});
