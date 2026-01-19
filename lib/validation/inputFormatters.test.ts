import { describe, it, expect } from "vitest";
import {
    formatPhoneInput,
    formatCitizenIdInput,
    validateAndFormatPhone,
    validateAndFormatCitizenId,
} from "./inputFormatters";

describe("formatPhoneInput", () => {
    it("should remove non-digit characters", () => {
        expect(formatPhoneInput("081-234-5678")).toBe("0812345678");
        expect(formatPhoneInput("081 234 5678")).toBe("0812345678");
        expect(formatPhoneInput("+66812345678")).toBe(
            "66812345678".slice(0, 10),
        );
    });

    it("should limit to 10 digits", () => {
        expect(formatPhoneInput("08123456789999")).toBe("0812345678");
    });

    it("should handle empty input", () => {
        expect(formatPhoneInput("")).toBe("");
    });
});

describe("formatCitizenIdInput", () => {
    it("should remove non-digit characters", () => {
        expect(formatCitizenIdInput("1-2345-67890-12-3")).toBe("1234567890123");
    });

    it("should limit to 13 digits", () => {
        expect(formatCitizenIdInput("12345678901234567")).toBe("1234567890123");
    });

    it("should handle empty input", () => {
        expect(formatCitizenIdInput("")).toBe("");
    });
});

describe("validateAndFormatPhone", () => {
    it("should format and validate valid phone", () => {
        const result = validateAndFormatPhone("0812345678");
        expect(result.value).toBe("0812345678");
        expect(result.error).toBeUndefined();
    });

    it("should format input and return error for invalid length", () => {
        const result = validateAndFormatPhone("081234567"); // 9 digits
        expect(result.value).toBe("081234567");
        expect(result.error).toBe("เบอร์โทรต้องมี 10 หลัก");
    });

    it("should strip non-digits and validate", () => {
        const result = validateAndFormatPhone("081-234-5678");
        expect(result.value).toBe("0812345678");
        expect(result.error).toBeUndefined();
    });
});

describe("validateAndFormatCitizenId", () => {
    it("should format and validate valid citizen ID", () => {
        const result = validateAndFormatCitizenId("1234567890123");
        expect(result.value).toBe("1234567890123");
        expect(result.error).toBeUndefined();
    });

    it("should format input and return error for invalid length", () => {
        const result = validateAndFormatCitizenId("123456789012"); // 12 digits
        expect(result.value).toBe("123456789012");
        expect(result.error).toBe("เลขบัตรประชาชนต้องมี 13 หลัก");
    });

    it("should strip non-digits and validate", () => {
        const result = validateAndFormatCitizenId("1-2345-67890-12-3");
        expect(result.value).toBe("1234567890123");
        expect(result.error).toBeUndefined();
    });
});
