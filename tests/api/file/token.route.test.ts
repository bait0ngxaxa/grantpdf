import { beforeEach, describe, expect, it, vi } from "vitest";
import { Readable } from "node:stream";

vi.mock("@/lib/server/db", () => ({
    prisma: {
        userFile: {
            findFirst: vi.fn(),
            update: vi.fn(),
        },
        attachmentFile: {
            findFirst: vi.fn(),
        },
    },
}));

vi.mock("@/lib/server/auth/guards", () => ({
    getOptionalUserSession: vi.fn(),
    isAdmin: vi.fn(),
}));

vi.mock("@/lib/server/storage/signedUrl", () => ({
    verifySignedToken: vi.fn(),
}));

vi.mock("@/lib/server/storage", () => ({
    getFullPathFromStoragePath: vi.fn(),
    getMimeType: vi.fn(),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

vi.mock("fs", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs")>();
    const createReadStream = vi.fn();
    return {
        ...actual,
        createReadStream,
        default: { ...actual, createReadStream },
    };
});

vi.mock("fs/promises", async (importOriginal) => {
    const actual = await importOriginal<typeof import("fs/promises")>();
    const stat = vi.fn();
    return {
        ...actual,
        stat,
        default: { ...actual, stat },
    };
});

import { prisma } from "@/lib/server/db";
import {
    getOptionalUserSession,
    isAdmin,
} from "@/lib/server/auth/guards";
import { logAudit } from "@/lib/server/audit/auditLog";
import {
    getFullPathFromStoragePath,
    getMimeType,
} from "@/lib/server/storage";
import { verifySignedToken } from "@/lib/server/storage/signedUrl";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { GET } from "@/app/api/(file)/file/[token]/route";

const mockedFindFirst = vi.mocked(prisma.userFile.findFirst);
const mockedUpdate = vi.mocked(prisma.userFile.update);
const mockedGetOptionalUserSession = vi.mocked(getOptionalUserSession);
const mockedIsAdmin = vi.mocked(isAdmin);
const mockedLogAudit = vi.mocked(logAudit);
const mockedGetFullPath = vi.mocked(getFullPathFromStoragePath);
const mockedGetMimeType = vi.mocked(getMimeType);
const mockedVerifySignedToken = vi.mocked(verifySignedToken);
const mockedCreateReadStream = vi.mocked(createReadStream);
const mockedStat = vi.mocked(stat);

function buildRequest(): Request {
    return new Request("http://localhost/api/file/signed-token");
}

function createSourceStream(): Readable {
    return Readable.from([Buffer.from("file-content")]);
}

describe("signed file download route", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedVerifySignedToken.mockResolvedValue({
            valid: true,
            payload: {
                fileId: 9,
                userId: 7,
                type: "userFile",
                fromAdminPanel: true,
            },
        });
        mockedGetOptionalUserSession.mockResolvedValue({
            userId: 7,
            session: { user: { id: "7", email: "admin@example.com" } },
        } as never);
        mockedIsAdmin.mockReturnValue(true);
        mockedFindFirst.mockResolvedValue({
            id: 9,
            originalFileName: "report.pdf",
            storagePath: "uploads/report.pdf",
            userId: 7,
        } as never);
        mockedGetFullPath.mockReturnValue("C:/storage/report.pdf");
        mockedGetMimeType.mockReturnValue("application/pdf");
        mockedStat.mockResolvedValue({ size: 12 } as never);
        mockedUpdate.mockResolvedValue({} as never);
        mockedCreateReadStream.mockReturnValue(createSourceStream() as never);
    });

    it("does not mark an admin download when the response is cancelled", async () => {
        const response = await GET(
            buildRequest() as never,
            { params: Promise.resolve({ token: "signed-token" }) },
        );
        expect(response.status).toBe(200);

        expect(mockedUpdate).not.toHaveBeenCalled();
        expect(mockedLogAudit).not.toHaveBeenCalled();

        await response.body?.cancel("browser aborted");

        expect(mockedUpdate).not.toHaveBeenCalled();
        expect(mockedLogAudit).not.toHaveBeenCalled();
    });

    it("marks and audits the download only after the body is fully consumed", async () => {
        const response = await GET(
            buildRequest() as never,
            { params: Promise.resolve({ token: "signed-token" }) },
        );
        expect(response.status).toBe(200);

        expect(mockedUpdate).not.toHaveBeenCalled();
        expect(mockedLogAudit).not.toHaveBeenCalled();

        await response.arrayBuffer();

        expect(mockedUpdate).toHaveBeenCalledWith({
            where: { id: 9 },
            data: {
                downloadStatus: "done",
                downloadedAt: expect.any(Date),
            },
        });
        expect(mockedLogAudit).toHaveBeenCalledWith(
            "ADMIN_FILE_DOWNLOAD",
            "7",
            expect.objectContaining({
                details: {
                    fileId: "9",
                    fileName: "report.pdf",
                    fileType: "userFile",
                },
            }),
        );
    });
});
