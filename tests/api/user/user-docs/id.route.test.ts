import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/server/auth/session", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services/fileService", () => ({
    getFileForDeletion: vi.fn(),
    deleteFileRecord: vi.fn(),
}));

vi.mock("fs/promises", () => {
    const unlink = vi.fn();
    return {
        default: { unlink },
        unlink,
    };
});

vi.mock("@/lib/server/storage", () => ({
    getFullPathFromStoragePath: vi.fn(),
}));

vi.mock("@/lib/server/audit/auditLog", () => ({
    logAudit: vi.fn(),
}));

import { auth } from "@/lib/server/auth/session";
import { getFileForDeletion, deleteFileRecord } from "@/lib/services/fileService";
import { unlink } from "fs/promises";
import { getFullPathFromStoragePath } from "@/lib/server/storage";
import { logAudit } from "@/lib/server/audit/auditLog";
import { DELETE } from "@/app/api/(user)/user-docs/[id]/route";

const mockedAuth = vi.mocked(auth);
const mockedGetFileForDeletion = vi.mocked(getFileForDeletion);
const mockedDeleteFileRecord = vi.mocked(deleteFileRecord);
const mockedUnlink = vi.mocked(unlink);
const mockedGetFullPathFromStoragePath = vi.mocked(getFullPathFromStoragePath);
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
        expect(mockedDeleteFileRecord).not.toHaveBeenCalled();
    });

    it("deletes file with resolved storage path and removes db record", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
        } as never);
        mockedGetFullPathFromStoragePath.mockReturnValue(
            "C:\\repo\\storage\\documents\\doc.pdf",
        );
        mockedUnlink.mockResolvedValue(undefined);

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockedGetFullPathFromStoragePath).toHaveBeenCalledWith(
            "storage/documents/doc.pdf",
        );
        expect(mockedUnlink).toHaveBeenCalledWith(
            "C:\\repo\\storage\\documents\\doc.pdf",
        );
        expect(mockedDeleteFileRecord).toHaveBeenCalledWith(11);
        expect(mockedLogAudit).toHaveBeenCalledOnce();
    });

    it("still deletes db record when physical file is missing", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
        } as never);
        mockedGetFullPathFromStoragePath.mockReturnValue(
            "C:\\repo\\storage\\documents\\doc.pdf",
        );
        const missingFileError = Object.assign(new Error("ENOENT"), {
            code: "ENOENT",
        });
        mockedUnlink.mockRejectedValue(missingFileError);

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });

        expect(response.status).toBe(200);
        expect(mockedUnlink).toHaveBeenCalledOnce();
        expect(mockedDeleteFileRecord).toHaveBeenCalledWith(11);
    });

    it("keeps the db record when physical file deletion fails", async () => {
        mockedGetFileForDeletion.mockResolvedValue({
            id: "11",
            userId: "1",
            originalFileName: "doc.pdf",
            storagePath: "storage/documents/doc.pdf",
        } as never);
        mockedGetFullPathFromStoragePath.mockReturnValue(
            "C:\\repo\\storage\\documents\\doc.pdf",
        );
        mockedUnlink.mockRejectedValue(Object.assign(new Error("EACCES"), { code: "EACCES" }));

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });

        expect(response.status).toBe(500);
        expect(mockedDeleteFileRecord).not.toHaveBeenCalled();
    });
});
