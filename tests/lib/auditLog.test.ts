import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("fs/promises", () => {
    const access = vi.fn();
    const appendFile = vi.fn();
    const mkdir = vi.fn();
    const readFile = vi.fn();
    const readdir = vi.fn();
    return {
        default: { access, appendFile, mkdir, readFile, readdir },
        access,
        appendFile,
        mkdir,
        readFile,
        readdir,
    };
});

vi.mock("fs", () => ({
    default: {
        constants: {
            F_OK: 0,
        },
    },
    constants: {
        F_OK: 0,
    },
}));

import {
    access,
    appendFile,
    mkdir,
    readFile,
    readdir,
} from "fs/promises";
import { logAudit, readAuditLogs, getAvailableLogDates } from "@/lib/auditLog";

const mockedAccess = vi.mocked(access);
const mockedAppendFile = vi.mocked(appendFile);
const mockedMkdir = vi.mocked(mkdir);
const mockedReadFile = vi.mocked(readFile);
const mockedReaddir = vi.mocked(readdir);

describe("auditLog", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedMkdir.mockResolvedValue(undefined);
        mockedAppendFile.mockResolvedValue(undefined);
        mockedAccess.mockResolvedValue(undefined);
    });

    it("writes audit log asynchronously without throwing", async () => {
        expect(() => {
            logAudit("FILE_UPLOAD", "1", {
                userEmail: "tester@example.com",
                details: { fileName: "doc.pdf" },
            });
        }).not.toThrow();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockedMkdir).toHaveBeenCalledOnce();
        expect(mockedAppendFile).toHaveBeenCalledOnce();
        expect(mockedAppendFile.mock.calls[0]?.[0]).toEqual(
            expect.stringContaining("logs"),
        );
    });

    it("returns empty logs when file does not exist", async () => {
        mockedAccess.mockRejectedValue(new Error("ENOENT"));

        const result = await readAuditLogs("2026-01-01");

        expect(result).toEqual([]);
        expect(mockedReadFile).not.toHaveBeenCalled();
    });

    it("parses log lines from file content", async () => {
        mockedReadFile.mockResolvedValue(
            [
                JSON.stringify({
                    timestamp: "2026-01-01T10:00:00+07:00",
                    action: "FILE_UPLOAD",
                    userId: "1",
                }),
                JSON.stringify({
                    timestamp: "2026-01-01T10:05:00+07:00",
                    action: "FILE_DELETE",
                    userId: "1",
                }),
            ].join("\n"),
        );

        const result = await readAuditLogs("2026-01-01");

        expect(result).toHaveLength(2);
        expect(result[0]?.action).toBe("FILE_UPLOAD");
        expect(result[1]?.action).toBe("FILE_DELETE");
    });

    it("returns available audit dates sorted descending", async () => {
        mockedReaddir.mockResolvedValue([
            "audit-2026-01-01.log",
            "ignore.txt",
            "audit-2026-02-01.log",
        ] as never);

        const result = await getAvailableLogDates();

        expect(result).toEqual(["2026-02-01", "2026-01-01"]);
    });
});
