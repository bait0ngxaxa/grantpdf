import { describe, expect, it } from "vitest";
import { hasProjectDraftChanges } from "@/lib/projectDraftChanges";

const baseProject = {
    name: "โครงการทดสอบ",
    description: "รายละเอียดเดิม",
};

describe("hasProjectDraftChanges", () => {
    it("returns false when the draft matches the original project", () => {
        expect(
            hasProjectDraftChanges(
                baseProject,
                "โครงการทดสอบ",
                "รายละเอียดเดิม",
            ),
        ).toBe(false);
    });

    it("ignores leading and trailing whitespace", () => {
        expect(
            hasProjectDraftChanges(
                baseProject,
                "  โครงการทดสอบ  ",
                "  รายละเอียดเดิม  ",
            ),
        ).toBe(false);
    });

    it("returns false when empty description matches a missing description", () => {
        expect(
            hasProjectDraftChanges(
                {
                    name: "โครงการทดสอบ",
                    description: undefined,
                },
                "โครงการทดสอบ",
                "",
            ),
        ).toBe(false);
    });

    it("returns true when the project name changes", () => {
        expect(
            hasProjectDraftChanges(
                baseProject,
                "โครงการใหม่",
                "รายละเอียดเดิม",
            ),
        ).toBe(true);
    });

    it("returns true when the project description changes", () => {
        expect(
            hasProjectDraftChanges(
                baseProject,
                "โครงการทดสอบ",
                "รายละเอียดใหม่",
            ),
        ).toBe(true);
    });
});
