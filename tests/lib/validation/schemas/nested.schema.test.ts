import { describe, expect, it } from "vitest";
import {
    activitiesJsonSchema,
    attachmentFileIdsJsonSchema,
    attachmentsJsonSchema,
} from "@/lib/validation/schemas";

function createActivity(): Record<string, string> {
    return {
        activity: "กิจกรรม",
        manager: "ผู้รับผิดชอบ",
        evaluation2: "วิธีประเมินผล",
        duration: "ระยะเวลา",
    };
}

describe("nested document payload schemas", () => {
    it("rejects malformed and non-array JSON payloads", () => {
        expect(attachmentsJsonSchema.safeParse("{").success).toBe(false);
        expect(attachmentsJsonSchema.safeParse(JSON.stringify({})).success).toBe(
            false,
        );
        expect(activitiesJsonSchema.safeParse("not-json").success).toBe(false);
    });

    it("rejects unknown nested activity fields", () => {
        const activity = {
            ...createActivity(),
            unexpected: "ไม่ควรรับค่า",
        };

        expect(activitiesJsonSchema.safeParse(JSON.stringify([activity])).success).toBe(
            false,
        );
    });

    it("enforces item count and nested string length", () => {
        const tooManyActivities = Array.from({ length: 51 }, createActivity);
        const tooLongAttachment = "ก".repeat(4001);

        expect(
            activitiesJsonSchema.safeParse(JSON.stringify(tooManyActivities)).success,
        ).toBe(false);
        expect(
            attachmentsJsonSchema.safeParse(JSON.stringify([tooLongAttachment]))
                .success,
        ).toBe(false);
    });

    it("enforces total serialized payload size", () => {
        const largeAttachments = Array.from({ length: 30 }, () => "ก".repeat(3500));

        expect(
            attachmentsJsonSchema.safeParse(JSON.stringify(largeAttachments)).success,
        ).toBe(false);
    });

    it("rejects invalid and duplicate attachment file IDs", () => {
        expect(attachmentFileIdsJsonSchema.safeParse(JSON.stringify([0])).success).toBe(
            false,
        );
        expect(
            attachmentFileIdsJsonSchema.safeParse(JSON.stringify([7, "7"])).success,
        ).toBe(false);
    });
});
