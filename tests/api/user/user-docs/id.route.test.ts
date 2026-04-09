import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
    auth: vi.fn(),
}));

vi.mock("@/lib/services", () => ({
    getFileForDeletion: vi.fn(),
    deleteFileRecord: vi.fn(),
}));

vi.mock("fs/promises", () => {
    const stat = vi.fn();
    const unlink = vi.fn();
    return {
        default: { stat, unlink },
        stat,
        unlink,
    };
});

vi.mock("@/lib/fileStorage", () => ({
    getFullPathFromStoragePath: vi.fn(),
}));

vi.mock("@/lib/auditLog", () => ({
    logAudit: vi.fn(),
}));

import { auth } from "@/lib/auth";
import { getFileForDeletion, deleteFileRecord } from "@/lib/services";
import { stat, unlink } from "fs/promises";
import { getFullPathFromStoragePath } from "@/lib/fileStorage";
import { logAudit } from "@/lib/auditLog";
import { DELETE } from "@/app/api/(user)/user-docs/[id]/route";

const mockedAuth = vi.mocked(auth);
const mockedGetFileForDeletion = vi.mocked(getFileForDeletion);
const mockedDeleteFileRecord = vi.mocked(deleteFileRecord);
const mockedStat = vi.mocked(stat);
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
        mockedStat.mockResolvedValue({} as never);
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
        expect(mockedStat).toHaveBeenCalledWith(
            "C:\\repo\\storage\\documents\\doc.pdf",
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
        mockedStat.mockRejectedValue(new Error("ENOENT"));

        const request = new Request("http://localhost/api/user-docs/11", {
            method: "DELETE",
        });
        const response = await DELETE(request as never, {
            params: buildParams("11"),
        });

        expect(response.status).toBe(200);
        expect(mockedUnlink).not.toHaveBeenCalled();
        expect(mockedDeleteFileRecord).toHaveBeenCalledWith(11);
    });
});
