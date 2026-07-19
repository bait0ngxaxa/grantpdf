import { describe, expect, it } from "vitest";
import {
    createProjectSchema,
    PROJECT_DESCRIPTION_MAX_LENGTH,
    PROJECT_STATUS_NOTE_MAX_LENGTH,
    updateAdminProjectSchema,
    updateProjectCoOwnersSchema,
    updateProjectStatusSchema,
    updateProjectSchema,
} from "@/lib/validation/schemas";

describe("project schema validation", () => {
    it("accepts project descriptions up to the shared maximum length", () => {
        const description = "ก".repeat(PROJECT_DESCRIPTION_MAX_LENGTH);

        const result = createProjectSchema.safeParse({
            programId: 1,
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

    it("accepts nullable programId in admin project updates", () => {
        const result = updateAdminProjectSchema.safeParse({
            projectId: 1,
            status: "กำลังดำเนินการ",
            statusNote: "",
            programId: null,
        });

        expect(result.success).toBe(true);
    });

    it("accepts valid project co-owner updates", () => {
        const result = updateProjectCoOwnersSchema.safeParse({
            projectId: 1,
            allowCoOwners: true,
            coOwnerUserIds: [2, 3],
        });

        expect(result.success).toBe(true);
    });

    it("rejects invalid project co-owner user ids", () => {
        const result = updateProjectCoOwnersSchema.safeParse({
            projectId: 1,
            allowCoOwners: true,
            coOwnerUserIds: [0],
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe("รหัสผู้ใช้ไม่ถูกต้อง");
    });

    it("rejects enabled project co-owners without selected users", () => {
        const result = updateProjectCoOwnersSchema.safeParse({
            projectId: 1,
            allowCoOwners: true,
            coOwnerUserIds: [],
        });

        expect(result.success).toBe(false);
        expect(result.error?.issues[0]?.message).toBe(
            "กรุณาเลือกเจ้าของร่วมอย่างน้อย 1 คน",
        );
    });

    it("accepts disabled project co-owners without selected users", () => {
        const result = updateProjectCoOwnersSchema.safeParse({
            projectId: 1,
            allowCoOwners: false,
            coOwnerUserIds: [],
        });

        expect(result.success).toBe(true);
    });
});
