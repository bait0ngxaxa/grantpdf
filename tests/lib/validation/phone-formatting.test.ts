import { describe, it, expect } from "vitest";
import {
    normalizePhoneNumber,
    optionalPhoneSchema,
    phoneSchema,
} from "@/lib/validation/schemas/shared";
import {
    formatPhoneInput,
    validateAndFormatPhone,
} from "@/lib/validation/inputFormatters";

describe("phone normalization and validation", () => {
    it("normalizes plain 10-digit number to xxx-xxxxxxx", () => {
        expect(normalizePhoneNumber("0891234567")).toBe("089-1234567");
    });

    it("keeps already normalized number as xxx-xxxxxxx", () => {
        expect(normalizePhoneNumber("089-1234567")).toBe("089-1234567");
    });

    it("phoneSchema accepts 10-digit plain input and transforms output", () => {
        const parsed = phoneSchema.parse("0891234567");
        expect(parsed).toBe("089-1234567");
    });

    it("phoneSchema accepts dashed input and keeps normalized output", () => {
        const parsed = phoneSchema.parse("089-1234567");
        expect(parsed).toBe("089-1234567");
    });

    it("phoneSchema rejects invalid format", () => {
        const result = phoneSchema.safeParse("089-123456");
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.message).toBe(
                "เบอร์โทรต้องเป็นรูปแบบ 10 หลัก หรือ xxx-xxxxxxx",
            );
        }
    });

    it("optionalPhoneSchema allows empty value", () => {
        const parsed = optionalPhoneSchema.parse("");
        expect(parsed).toBe("");
    });

    it("optionalPhoneSchema transforms valid plain value", () => {
        const parsed = optionalPhoneSchema.parse("0812345678");
        expect(parsed).toBe("081-2345678");
    });

    it("formatPhoneInput inserts dash after first 3 digits", () => {
        expect(formatPhoneInput("081234")).toBe("081-234");
    });

    it("validateAndFormatPhone returns normalized value when valid", () => {
        const result = validateAndFormatPhone("0812345678");
        expect(result.error).toBeUndefined();
        expect(result.value).toBe("081-2345678");
    });

    it("validateAndFormatPhone returns error when invalid", () => {
        const result = validateAndFormatPhone("08123");
        expect(result.error).toBe("เบอร์โทรต้องเป็นรูปแบบ 10 หลัก หรือ xxx-xxxxxxx");
        expect(result.value).toBe("081-23");
    });
});
