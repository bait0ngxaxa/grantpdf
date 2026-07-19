import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse, type NextRequest } from "next/server";

const events: string[] = [];

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

vi.mock("@/lib/server/storage", () => ({
    ensureStorageDir: vi.fn(),
    getRelativeStoragePath: vi.fn(),
    getStoragePath: vi.fn(),
    streamFileToPath: vi.fn(),
    validateDetectedFileMime: vi.fn(),
    validateFileMime: vi.fn(),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("@/lib/api/body", () => ({
    getFirstValidationMessage: vi.fn(),
}));

vi.mock("@/lib/api/responses", () => ({
    publicErrorResponse: vi.fn(() =>
        NextResponse.json({ error: "error" }, { status: 500 }),
    ),
    rateLimitExceededResponse: vi.fn(),
    validationErrorResponse: vi.fn(),
}));

vi.mock("@/lib/services/projectReportService", () => ({
    createProjectReportWithFile: vi.fn(),
    getProjectReportsForUser: vi.fn(),
}));

vi.mock("@/lib/services/projectService", () => ({
    buildProjectAccessWhere: vi.fn(),
}));

vi.mock("@/lib/services/documentRequestFingerprint", () => ({
    createDocumentRequestHash: vi.fn(),
}));

vi.mock("@/lib/services/storageQuotaService", () => ({
    releaseStorageQuota: vi.fn(),
    reserveStorageQuota: vi.fn(),
}));

vi.mock("@/lib/server/storage/uploadIdempotency", () => ({
    failUploadIdempotency: vi.fn(),
    startUploadIdempotency: vi.fn(),
}));

import { POST } from "@/app/api/(user)/projects/[id]/reports/route";
import { isGuardError, requireUserSession } from "@/lib/server/auth/guards";
import {
    ensureStorageDir,
    getRelativeStoragePath,
    getStoragePath,
    streamFileToPath,
    validateDetectedFileMime,
} from "@/lib/server/storage";
import { applyRateLimit } from "@/lib/server/rate-limit/rateLimit";
import { prisma } from "@/lib/server/db";
import { buildProjectAccessWhere } from "@/lib/services/projectService";
import { createDocumentRequestHash } from "@/lib/services/documentRequestFingerprint";
import {
    failUploadIdempotency,
    startUploadIdempotency,
} from "@/lib/server/storage/uploadIdempotency";
import {
    createProjectReportWithFile,
} from "@/lib/services/projectReportService";
import {
    releaseStorageQuota,
    reserveStorageQuota,
} from "@/lib/services/storageQuotaService";
import { REPORT_TYPES } from "@/lib/shared/constants";
import { getClientIp } from "@/lib/api/requestContext";

const mockedIsGuardError = vi.mocked(isGuardError);
const mockedRequireUserSession = vi.mocked(requireUserSession);
const mockedApplyRateLimit = vi.mocked(applyRateLimit);
const mockedEnsureStorageDir = vi.mocked(ensureStorageDir);
const mockedGetRelativeStoragePath = vi.mocked(getRelativeStoragePath);
const mockedGetStoragePath = vi.mocked(getStoragePath);
const mockedStreamFileToPath = vi.mocked(streamFileToPath);
const mockedValidateDetectedFileMime = vi.mocked(validateDetectedFileMime);
const mockedProjectFindFirst = vi.mocked(prisma.project.findFirst);
const mockedBuildProjectAccessWhere = vi.mocked(buildProjectAccessWhere);
const mockedCreateDocumentRequestHash = vi.mocked(createDocumentRequestHash);
const mockedFailUploadIdempotency = vi.mocked(failUploadIdempotency);
const mockedStartUploadIdempotency = vi.mocked(startUploadIdempotency);
const mockedCreateProjectReportWithFile = vi.mocked(createProjectReportWithFile);
const mockedReleaseStorageQuota = vi.mocked(releaseStorageQuota);
const mockedReserveStorageQuota = vi.mocked(reserveStorageQuota);

describe("project reports POST route resource guards", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        events.length = 0;

        mockedRequireUserSession.mockImplementation(async () => {
            events.push("auth");
            return NextResponse.json(
                { error: "กรุณาเข้าสู่ระบบ" },
                { status: 401 },
            ) as never;
        });
        mockedIsGuardError.mockImplementation(() => true);
        mockedApplyRateLimit.mockImplementation(async () => {
            events.push("rate-limit");
            return {
                success: true,
                remaining: 9,
                resetTime: Date.now() + 30_000,
                headers: {},
            };
        });
    });

    it("rejects unauthenticated requests before rate limiting or multipart parsing", async () => {
        const formData = vi.fn().mockResolvedValue(new FormData());
        const request = {
            url: "http://localhost/api/projects/12/reports",
            method: "POST",
            headers: new Headers({ "x-real-ip": "203.0.113.10" }),
            formData,
        } as unknown as NextRequest;

        const response = await POST(request, {
            params: Promise.resolve({ id: "12" }),
        });

        expect(response.status).toBe(401);
        expect(events).toEqual(["auth"]);
        expect(mockedApplyRateLimit).not.toHaveBeenCalled();
        expect(formData).not.toHaveBeenCalled();
    });

    it("uses the authenticated user and request IP scope before parsing multipart data", async () => {
        mockedRequireUserSession.mockImplementation(async () => {
            events.push("auth");
            return {
                userId: 7,
                session: { user: { email: "tester@example.com" } },
            } as never;
        });
        mockedIsGuardError.mockReturnValue(false);

        const formData = vi.fn().mockImplementation(async () => {
            events.push("form-data");
            return new FormData();
        });
        const request = {
            url: "http://localhost/api/projects/12/reports",
            method: "POST",
            headers: new Headers({ "x-real-ip": "203.0.113.10" }),
            formData,
        } as unknown as NextRequest;

        await POST(request, {
            params: Promise.resolve({ id: "12" }),
        });

        expect(events).toEqual(["auth", "rate-limit", "form-data"]);
        expect(mockedApplyRateLimit).toHaveBeenCalledWith({
            request,
            routeKey: expect.any(String),
            limit: expect.any(Number),
            windowMs: expect.any(Number),
            identifier: `7:${getClientIp(request)}`,
        });
    });


    it("streams the report file through the shared storage helper", async () => {
        mockedRequireUserSession.mockResolvedValue({
            userId: 7,
            session: { user: { id: "7", email: "tester@example.com" } },
        } as never);
        mockedIsGuardError.mockReturnValue(false);
        mockedProjectFindFirst.mockResolvedValue({ id: 12 } as never);
        mockedBuildProjectAccessWhere.mockReturnValue({});
        mockedCreateDocumentRequestHash.mockResolvedValue("request-hash");
        mockedStartUploadIdempotency.mockResolvedValue({
            type: "started",
            recordId: BigInt(1),
            leaseToken: "lease-token",
        } as never);
        mockedReserveStorageQuota.mockResolvedValue(true);
        mockedReleaseStorageQuota.mockResolvedValue(undefined);
        mockedFailUploadIdempotency.mockResolvedValue(undefined);
        mockedEnsureStorageDir.mockResolvedValue(undefined);
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
            valid: false,
            detectedMime: "application/pdf",
            error: "invalid test fixture",
        });
        mockedCreateProjectReportWithFile.mockResolvedValue({
            id: 99,
        } as never);

        const file = new File(["%PDF-1.7 streamed report"], "report.pdf", {
            type: "application/pdf",
        });
        const arrayBufferSpy = vi.fn();
        Object.defineProperty(file, "arrayBuffer", { value: arrayBufferSpy });
        const formData = new FormData();
        formData.set("file", file);
        formData.set("reportType", REPORT_TYPES.PROGRESS);

        const request = {
            url: "http://localhost/api/projects/12/reports",
            method: "POST",
            headers: new Headers({ "x-real-ip": "203.0.113.10" }),
            formData: vi.fn().mockResolvedValue(formData),
        } as unknown as NextRequest;

        const response = await POST(request, {
            params: Promise.resolve({ id: "12" }),
        });

        expect(response.status).toBe(500);
        expect(arrayBufferSpy).not.toHaveBeenCalled();
        expect(mockedStreamFileToPath).toHaveBeenCalledWith(
            file,
            expect.any(String),
        );
        expect(mockedValidateDetectedFileMime).toHaveBeenCalledWith(
            "report.pdf",
            "application/pdf",
            undefined,
        );
    });

});
