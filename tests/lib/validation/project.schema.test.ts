import { describe, expect, it } from "vitest";
import {
    createProjectSchema,
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_STATUS_NOTE_MAX_LENGTH,
    updateProjectStatusSchema,
    updateProjectSchema,
} from "@/lib/validation/schemas";

describe("project schema validation", () => {
    it("accepts project descriptions up to the shared maximum length", () => {
        const description = "ก".repeat(PROJECT_DESCRIPTION_MAX_LENGTH);

        const result = createProjectSchema.safeParse({
            name: "โครงการทดสอบ",
            description,
        });

        expect(result.success).toBe(true);
    });

    it("rejects project descriptions that exceed the shared maximum length", () => {
        const description = "ก".repeat(PROJECT_DESCRIPTION_MAX_LENGTH + 1);

        const result = updateProjectSchema.safeParse({
            name: "โครงการทดสอบ",
            description,
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("รายละเอียดโครงการยาวเกินไป");
    });

    it("rejects status notes that exceed the shared maximum length", () => {
        const statusNote = "ก".repeat(PROJECT_STATUS_NOTE_MAX_LENGTH + 1);

        const result = updateProjectStatusSchema.safeParse({
            projectId: 1,
            status: "กำลังดำเนินการ",
            statusNote,
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("หมายเหตุสถานะยาวเกินไป");
    });
});
