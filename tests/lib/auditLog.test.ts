import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
    prisma: {
        auditLog: {
            create: vi.fn(),
            deleteMany: vi.fn(),
        },
    },
}));

import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/auditLog";

const mockedAuditCreate = vi.mocked(prisma.auditLog.create);
const mockedAuditDeleteMany = vi.mocked(prisma.auditLog.deleteMany);

describe("auditLog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedAuditCreate.mockResolvedValue({} as never);
        mockedAuditDeleteMany.mockResolvedValue({ count: 0 } as never);
    });

    it("writes audit log to database asynchronously", async () => {
        expect(() => {
            logAudit("FILE_UPLOAD", "1", {
                userEmail: "tester@example.com",
                details: { fileName: "doc.pdf" },
            });
        }).not.toThrow();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockedAuditCreate).toHaveBeenCalledOnce();
        expect(mockedAuditCreate.mock.calls[0]?.[0]).toMatchObject({
            data: expect.objectContaining({
                action: "FILE_UPLOAD",
                outcome: "success",
                actorUserId: 1,
                actorEmail: "tester@example.com",
            }),
        });
    });

    it("infers failure outcome for *_FAILED action", async () => {
        logAudit("LOGIN_FAILED", null, {
            userEmail: "unknown@example.com",
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockedAuditCreate).toHaveBeenCalledOnce();
        expect(mockedAuditCreate.mock.calls[0]?.[0]).toMatchObject({
            data: expect.objectContaining({
                action: "LOGIN_FAILED",
                outcome: "failure",
                actorUserId: null,
            }),
        });
    });

    it("does not throw even when db insert fails", async () => {
        mockedAuditCreate.mockRejectedValue(new Error("db_down"));

        expect(() => {
            logAudit("FILE_DELETE", "2", {
                details: { fileId: "10" },
            });
        }).not.toThrow();

        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(mockedAuditCreate).toHaveBeenCalledOnce();
    });
});
