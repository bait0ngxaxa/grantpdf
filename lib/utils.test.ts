import { describe, it, expect } from "vitest";
import { getStatusColor, truncateFileName } from "./utils";
import { PROJECT_STATUS } from "@/type/models";

describe("getStatusColor", () => {
    it("should return yellow classes for IN_PROGRESS status", () => {
        const result = getStatusColor(PROJECT_STATUS.IN_PROGRESS);
        expect(result).toBe(
            "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30",
        );
    });

    it("should return green classes for APPROVED status", () => {
        const result = getStatusColor(PROJECT_STATUS.APPROVED);
        expect(result).toBe(
            "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
        );
    });

    it("should return red classes for REJECTED status", () => {
        const result = getStatusColor(PROJECT_STATUS.REJECTED);
        expect(result).toBe(
            "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30",
        );
    });

    it("should return orange classes for EDIT status", () => {
        const result = getStatusColor(PROJECT_STATUS.EDIT);
        expect(result).toBe(
            "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/30",
        );
    });

    it("should return gray classes for CLOSED status", () => {
        const result = getStatusColor(PROJECT_STATUS.CLOSED);
        expect(result).toBe(
            "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
        );
    });

    it("should return gray classes for unknown status", () => {
        const result = getStatusColor("unknown");
        expect(result).toBe(
            "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800",
        );
    });
});

describe("truncateFileName", () => {
    it("should return default message for null input", () => {
        const result = truncateFileName(null);
        expect(result).toBe("ไม่มีชื่อไฟล์");
    });

    it("should return default message for undefined input", () => {
        const result = truncateFileName(undefined);
        expect(result).toBe("ไม่มีชื่อไฟล์");
    });

    it("should return original filename if within max length", () => {
        const result = truncateFileName("short.pdf");
        expect(result).toBe("short.pdf");
    });

    it("should truncate filename with extension correctly", () => {
        const longName = "this_is_a_very_long_filename_that_exceeds_limit.pdf";
        const result = truncateFileName(longName, 30);
        expect(result).toContain("...");
        expect(result).toContain(".pdf");
        expect(result.length).toBeLessThanOrEqual(30);
    });

    it("should truncate filename without extension", () => {
        const longName = "this_is_a_very_long_filename_without_extension";
        const result = truncateFileName(longName, 20);
        expect(result).toContain("...");
        expect(result.length).toBeLessThanOrEqual(20);
    });

    it("should handle custom max length", () => {
        const result = truncateFileName("medium_length_file.txt", 15);
        expect(result.length).toBeLessThanOrEqual(15);
    });
});
