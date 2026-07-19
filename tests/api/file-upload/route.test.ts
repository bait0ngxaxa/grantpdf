import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/server/auth/guards", () => ({
    isGuardError: vi.fn(),
    requireUserSession: vi.fn(),
}));

vi.mock("@/lib/server/rate-limit/rateLimit", () => ({
    applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/server/db", () => ({
    prisma: {
        project: {
            findFirst: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}));

vi.mock("@/lib/services/projectService", () => ({
    buildProjectAccessWhere: vi.fn(),
}));

vi.mock("@/lib/server/storage", () => ({
    ensureStorageDir: vi.fn(),
    getRelativeStoragePath: vi.fn(),
    getStoragePath: vi.fn(),
    streamFileToPath: vi.fn(),
    validateDetectedFileMime: vi.fn(),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/server/storage/uploadIdempotency", () => ({
    completeUploadIdempotency: vi.fn(),
    failUploadIdempotency: vi.fn(),
    startUploadIdempotency: vi.fn(),
}));

vi.mock("@/lib/services/dashboardStatsCache", () => ({
    invalidateDashboardStats: vi.fn(),
}));

vi.mock("@/lib/services/notificationEventService", () => ({
    notifyProjectDocumentUploaded: vi.fn(),
}));

vi.mock("@/lib/services/documentRequestFingerprint", () => ({
    createDocumentRequestHash: vi.fn(),
}));

vi.mock("@/lib/services/documentIdempotencyService", () => ({
    completeDocumentIdempotency: vi.fn(),
    markDocumentIdempotencyRecoveryRequired: vi.fn(),
    startDocumentIdempotencyHeartbeat: vi.fn(() => vi.fn()),
}));

vi.mock("fs/promises", () => {
    const rename = vi.fn().mockResolvedValue(undefined);
    const unlink = vi.fn().mockResolvedValue(undefined);
    return {
        default: { rename, unlink },
        rename,
        unlink,
    };
});

vi.mock("@/lib/services/storageQuotaService", () => ({
    releaseStorageQuota: vi.fn(),
    reserveStorageQuota: vi.fn(),
}));

import { POST } from "@/app/api/(file)/file-upload/route";
import { RATE_LIMIT, STORAGE_QUOTA } from "@/lib/shared/constants";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { prisma } from "@/lib/server/db";
import { reserveStorageQuota } from "@/lib/services/storageQuotaService";
import {
    getRelativeStoragePath,
    getStoragePath,
    streamFileToPath,
    validateDetectedFileMime,
} from "@/lib/server/storage";
import {
    failUploadIdempotency,
    startUploadIdempotency,
} from "@/lib/server/storage/uploadIdempotency";
import { createDocumentRequestHash } from "@/lib/services/documentRequestFingerprint";
import { completeDocumentIdempotency } from "@/lib/services/documentIdempotencyService";

const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockedTransaction = vi.mocked(prisma.$transaction);
const mockedReserveStorageQuota = vi.mocked(reserveStorageQuota);
const mockedGetRelativeStoragePath = vi.mocked(getRelativeStoragePath);
const mockedGetStoragePath = vi.mocked(getStoragePath);
const mockedStreamFileToPath = vi.mocked(streamFileToPath);
const mockedValidateDetectedFileMime = vi.mocked(validateDetectedFileMime);
const mockedStartUploadIdempotency = vi.mocked(startUploadIdempotency);
const mockedFailUploadIdempotency = vi.mocked(failUploadIdempotency);
const mockedCreateDocumentRequestHash = vi.mocked(createDocumentRequestHash);
const mockedCompleteDocumentIdempotency = vi.mocked(
    completeDocumentIdempotency,
);

describe("file upload route resource guards", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        mockedTransaction.mockImplementation(async (callback) =>
            callback({} as never),
        );
        mockedGetStoragePath.mockImplementation(
            (type, fileName) => `${type}/${fileName}`,
        );
        mockedGetRelativeStoragePath.mockImplementation(
            (type, fileName) => `storage/${type}/${fileName}`,
        );
        mockedStreamFileToPath.mockResolvedValue({
            contentHash: "content-hash",
            detectedMime: "application/pdf",
        });
        mockedValidateDetectedFileMime.mockReturnValue({
            valid: true,
            detectedMime: "application/pdf",
        });
        mockedCreateDocumentRequestHash.mockResolvedValue("request-hash");
        mockedStartUploadIdempotency.mockResolvedValue({
            type: "started",
            recordId: BigInt(1),
            leaseToken: "lease-token",
        });
        mockedFailUploadIdempotency.mockResolvedValue(undefined);
        mockedCompleteDocumentIdempotency.mockResolvedValue(undefined);
        const { requireUserSession } = await import("@/lib/server/auth/guards");
        vi.mocked(requireUserSession).mockResolvedValue({
            userId: 7,
            session: { user: { email: "tester@example.com" } },
        } as never);
    });

    it("rejects rate-limited requests before parsing multipart data", async () => {
        const formData = vi.fn();
        const request = {
            url: "http://localhost/api/file-upload",
            method: "POST",
            headers: new Headers({ "x-real-ip": "203.0.113.10" }),
            formData,
        } as unknown as NextRequest;

        mockedApplyRateLimit.mockResolvedValue({
            success: false,
            remaining: 0,
            resetTime: Date.now() + 30_000,
            retryAfter: 30,
            headers: {
                "Retry-After": "30",
            },
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body.retryAfter).toBe(30);
        expect(formData).not.toHaveBeenCalled();
        expect(mockedApplyRateLimit).toHaveBeenCalledWith({
            request,
            routeKey: RATE_LIMIT.USER.FILE_UPLOAD.ROUTE_KEY,
            limit: RATE_LIMIT.USER.FILE_UPLOAD.LIMIT,
            windowMs: RATE_LIMIT.USER.FILE_UPLOAD.WINDOW_MS,
            identifier: "7",
        });
    });

    it("does not return success when completion persistence fails", async () => {
        const formData = new FormData();
        const file = new File(["file-content"], "document.pdf", {
            type: "application/pdf",
        });
        formData.set("file", file);
        formData.set("projectId", "12");

        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 9,
            resetTime: Date.now() + 30_000,
            headers: {},
        });
        mockedProjectFindFirst.mockResolvedValue({
            id: 12,
            name: "test-project",
            description: null,
        } as never);
        mockedReserveStorageQuota.mockResolvedValue(true);
        mockedCompleteDocumentIdempotency.mockRejectedValueOnce(
            new Error("COMPLETION_UNAVAILABLE"),
        );
        mockedTransaction.mockImplementation(async (callback) =>
            callback({
                userFile: {
                    create: vi.fn().mockResolvedValue({
                        id: 88,
                        originalFileName: file.name,
                        storagePath: "storage/attachments/document.pdf",
                    }),
                },
            } as never),
        );

        const request = {
            url: "http://localhost/api/file-upload",
            method: "POST",
            headers: new Headers({
                "x-real-ip": "203.0.113.10",
                "idempotency-key": "upload-key-001",
            }),
            formData: vi.fn().mockResolvedValue(formData),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(500);
        expect(mockedCompleteDocumentIdempotency).toHaveBeenCalledOnce();
        expect(mockedFailUploadIdempotency).toHaveBeenCalledWith(
            BigInt(1),
            "lease-token",
            expect.any(Error),
        );
    });

    it("rejects uploads when the atomic storage reservation would exceed quota", async () => {
        const formData = new FormData();
        const file = new File(["file-content"], "document.pdf", {
            type: "application/pdf",
        });
        formData.set("file", file);
        formData.set("projectId", "12");

        mockedApplyRateLimit.mockResolvedValue({
            success: true,
            remaining: 9,
            resetTime: Date.now() + 30_000,
            headers: {},
        });
        mockedProjectFindFirst.mockResolvedValue({
            id: 12,
            name: "โครงการทดสอบ",
            description: null,
        } as never);
        mockedReserveStorageQuota.mockResolvedValue(false);

        const request = {
            url: "http://localhost/api/file-upload",
            method: "POST",
            headers: new Headers({ "x-real-ip": "203.0.113.10" }),
            formData: vi.fn().mockResolvedValue(formData),
        } as unknown as NextRequest;

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(507);
        expect(body).toEqual({ error: STORAGE_QUOTA.EXCEEDED_MESSAGE });
        expect(mockedReserveStorageQuota).toHaveBeenCalledWith(
            7,
            file.size,
            expect.anything(),
        );
    });
});
