import { describe, it, expect } from "vitest";
import {
    validatePhone,
    validateEmail,
    validateCitizenId,
} from "./fieldValidators";

describe("validatePhone", () => {
    it("should return valid for empty input", () => {
        expect(validatePhone("")).toEqual({ isValid: true });
        expect(validatePhone("   ")).toEqual({ isValid: true });
    });

    it("should return valid for correct 10-digit phone", () => {
        expect(validatePhone("0812345678")).toEqual({ isValid: true });
    });

    it("should return error for non-numeric characters", () => {
        const result = validatePhone("081-234-5678");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("เบอร์โทรต้องเป็นตัวเลขเท่านั้น");
    });

    it("should return error for incorrect length", () => {
        const result = validatePhone("123456789"); // 9 digits
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("เบอร์โทรต้องมี 10 หลัก");
    });

    it("should return error for too many digits", () => {
        const result = validatePhone("08123456789"); // 11 digits
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("เบอร์โทรต้องมี 10 หลัก");
    });
});

describe("validateEmail", () => {
    it("should return valid for empty input", () => {
        expect(validateEmail("")).toEqual({ isValid: true });
        expect(validateEmail("   ")).toEqual({ isValid: true });
    });

    it("should return valid for correct email format", () => {
        expect(validateEmail("test@example.com")).toEqual({ isValid: true });
        expect(validateEmail("user.name@domain.co.th")).toEqual({
            isValid: true,
        });
    });

    it("should return error for invalid email format", () => {
        const result = validateEmail("invalid-email");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(
            "รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)",
        );
    });

    it("should return error for email without @", () => {
        const result = validateEmail("testexample.com");
        expect(result.isValid).toBe(false);
    });

    it("should return error for email without domain", () => {
        const result = validateEmail("test@");
        expect(result.isValid).toBe(false);
    });
});

describe("validateCitizenId", () => {
    it("should return valid for empty input", () => {
        expect(validateCitizenId("")).toEqual({ isValid: true });
        expect(validateCitizenId("   ")).toEqual({ isValid: true });
    });

    it("should return valid for correct 13-digit ID", () => {
        expect(validateCitizenId("1234567890123")).toEqual({ isValid: true });
    });

    it("should return error for non-numeric characters", () => {
        const result = validateCitizenId("1-2345-67890-12-3");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น");
    });

    it("should return error for incorrect length", () => {
        const result = validateCitizenId("123456789012"); // 12 digits
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("เลขบัตรประชาชนต้องมี 13 หลัก");
    });

    it("should return error for too many digits", () => {
        const result = validateCitizenId("12345678901234"); // 14 digits
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("เลขบัตรประชาชนต้องมี 13 หลัก");
    });
});
