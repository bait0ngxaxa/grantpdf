import { describe, expect, it } from "vitest";
import { approvalSchema } from "@/lib/validation/schemas";

const validApproval = {
    head: "ที่ 1/2569",
    fileName: "Approval Letter",
    projectName: "Project A",
    date: "2026-08-09",
    topicdetail: "เรื่องทดสอบ",
    todetail: "ผู้รับทดสอบ",
    attachments: [],
    detail: "รายละเอียด",
    name: "ผู้ลงนาม",
    depart: "หน่วยงาน",
    coor: "ผู้ประสานงาน",
    tel: "0812345678",
    email: "tester@example.com",
    accept: "ผู้อนุมัติ",
};

describe("approvalSchema filename contract", () => {
    it.each([undefined, "", "   "])(
        "rejects a missing or blank filename (%s)",
        (fileName) => {
            const input = { ...validApproval, fileName };

            expect(approvalSchema.safeParse(input).success).toBe(false);
        },
    );

    it("accepts and trims a submitted filename", () => {
        const result = approvalSchema.safeParse({
            ...validApproval,
            fileName: "  Approval Letter  ",
        });

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.fileName).toBe("Approval Letter");
        }
    });
});
