import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/auth/session", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services/fileService", () => ({
    getFileForDeletion: vi.fn(),
    markFileDeleting: vi.fn(),
    markFileDeleted: vi.fn(),
    removeStoredFilePaths: vi.fn(),
    scheduleFileDeletionRetry: vi.fn(),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

import { auth } from "@/lib/server/auth/session";
import {
    getFileForDeletion,
    markFileDeleting,
    markFileDeleted,
    removeStoredFilePaths,
    scheduleFileDeletionRetry,
} from "@/lib/services/fileService";
import { logAudit } from "@/lib/server/audit/auditLog";
import { DELETE } from "@/app/api/(user)/user-docs/[id]/route";

const mockedAuth = vi.mocked(auth);
const mockedGetFileForDeletion = vi.mocked(getFileForDeletion);
const mockedMarkFileDeleting = vi.mocked(markFileDeleting);
const mockedMarkFileDeleted = vi.mocked(markFileDeleted);
const mockedRemoveStoredFilePaths = vi.mocked(removeStoredFilePaths);
const mockedScheduleFileDeletionRetry = vi.mocked(scheduleFileDeletionRetry);
const mockedLogAudit = vi.mocked(logAudit);

function buildParams(id: string): Promise<{ id: string }> {
    return Promise.resolve({ id });
}

describe("user-docs [id] route DELETE", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuth.mockResolvedValue({
            user: {
                id: "1",
                email: "tester@example.com",
            },
        } as never);
        mockedMarkFileDeleting.mockResolvedValue(true);
        mockedMarkFileDeleted.mockResolvedValue(true);
        mockedRemoveStoredFilePaths.mockResolvedValue(undefined);
        mockedScheduleFileDeletionRetry.mockResolvedValue(true);
    });

    it("returns 401 when session is missing", async () => {
        mockedAuth.mockResolvedValue(null as never);

        const request = new Request("http://localhost/api/user-docs/1", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("1"),
        });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body).toEqual({ error: "กรุณาเข้าสู่ระบบ" });
        expect(mockedGetFileForDeletion).not.toHaveBeenCalled();
    });

    it("returns 403 when user tries to delete another user's file", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "2",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
        } as never);

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body).toEqual({ error: "ไม่มีสิทธิ์ลบเอกสารนี้" });
        expect(mockedMarkFileDeleting).not.toHaveBeenCalled();
    });

    it("deletes file with resolved storage path and marks the record deleted", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
            attachmentFiles: [
                {
                    filePath: "storage/attachments/copied.pdf",
                    fileSize: 128,
                },
            ],
        } as never);
        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockedRemoveStoredFilePaths).toHaveBeenCalledWith(
            expect.objectContaining({
                storagePath: "storage/documents/doc.pdf",
                attachmentFiles: [
                    expect.objectContaining({
                        filePath: "storage/attachments/copied.pdf",
                    }),
                ],
            }),
        );
        expect(mockedMarkFileDeleting).toHaveBeenCalledWith(11);
        expect(mockedMarkFileDeleted).toHaveBeenCalledWith(11, 1);
        expect(mockedLogAudit).toHaveBeenCalledOnce();
    });

    it("still deletes db record when physical file is missing", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
        } as never);
        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });

        expect(response.status).toBe(200);
        expect(mockedRemoveStoredFilePaths).toHaveBeenCalledOnce();
        expect(mockedMarkFileDeleted).toHaveBeenCalledWith(11, 1);
    });

    it("keeps the db record when physical file deletion fails", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
        } as never);
        mockedRemoveStoredFilePaths.mockRejectedValue(
            Object.assign(new Error("EACCES"), { code: "EACCES" }),
        );

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });

        expect(response.status).toBe(500);
        expect(mockedMarkFileDeleting).toHaveBeenCalledWith(11);
        expect(mockedMarkFileDeleted).not.toHaveBeenCalled();
        expect(mockedScheduleFileDeletionRetry).toHaveBeenCalledWith(
            11,
            expect.objectContaining({ message: "EACCES" }),
        );
    });

    it("marks the record deleting before unlink when final db transition can fail", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
            deletionStatus: "active",
        } as never);
        mockedMarkFileDeleting.mockResolvedValue(true);
        mockedRemoveStoredFilePaths.mockResolvedValue(undefined);
        mockedMarkFileDeleted.mockRejectedValue(new Error("DB_UNAVAILABLE"));

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });

        expect(response.status).toBe(500);
        expect(mockedMarkFileDeleting).toHaveBeenCalledWith(11);
        expect(mockedMarkFileDeleting).toHaveBeenCalledBefore(
            mockedRemoveStoredFilePaths,
        );
        expect(mockedMarkFileDeleted).toHaveBeenCalledWith(11, 1);
        expect(mockedScheduleFileDeletionRetry).toHaveBeenCalledWith(
            11,
            expect.objectContaining({ message: "DB_UNAVAILABLE" }),
        );
    });
});
