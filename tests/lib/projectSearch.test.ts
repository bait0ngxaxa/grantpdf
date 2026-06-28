import { describe, expect, it } from "vitest";
import { parseProjectSearchTerm } from "@/lib/domain/projects/search";

describe("parseProjectSearchTerm", () => {
    it("parses numeric search as an exact project id candidate", () => {
        expect(parseProjectSearchTerm(" 12 ")).toEqual({
            normalized: "12",
            projectIdText: "12",
            projectIdNumber: 12,
        });
    });

    it("keeps non-numeric search as text search only", () => {
        expect(parseProjectSearchTerm("โครงการ 12")).toEqual({
            normalized: "โครงการ 12",
            projectIdText: null,
            projectIdNumber: null,
        });
    });

    it("rejects unsafe numeric ids", () => {
        expect(parseProjectSearchTerm("9007199254740993")).toEqual({
            normalized: "9007199254740993",
            projectIdText: null,
            projectIdNumber: null,
        });
    });
});
