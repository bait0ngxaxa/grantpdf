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

vi.mock("@/lib/services/storageQuotaService", () => ({
    releaseStorageQuota: vi.fn(),
    reserveStorageQuota: vi.fn(),
}));

import { POST } from "@/app/api/(file)/file-upload/route";
import { RATE_LIMIT, STORAGE_QUOTA } from "@/lib/shared/constants";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { prisma } from "@/lib/server/db";
import { reserveStorageQuota } from "@/lib/services/storageQuotaService";

const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockedReserveStorageQuota = vi.mocked(reserveStorageQuota);

describe("file upload route resource guards", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
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
        expect(mockedReserveStorageQuota).toHaveBeenCalledWith(7, file.size);
    });
});
