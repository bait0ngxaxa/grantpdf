import type { ValidationResult } from "./types";

export function validatePhone(value: string): ValidationResult {
    const digitsOnly = value.replace(/\D/g, "");

    if (!value || value.trim() === "") {
        return { isValid: true };
    }

    if (!/^\d+$/.test(value)) {
        return {
            isValid: false,
            error: "เบอร์โทรต้องเป็นตัวเลขเท่านั้น",
        };
    }

    if (digitsOnly.length !== 10) {
        return {
            isValid: false,
            error: "เบอร์โทรต้องมี 10 หลัก",
        };
    }

    return { isValid: true };
}

/**
 * Validate email format
 */
export function validateEmail(value: string): ValidationResult {
    if (!value || value.trim() === "") {
        return { isValid: true };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        return {
            isValid: false,
            error: "รูปแบบอีเมลไม่ถูกต้อง (เช่น example@mail.com)",
        };
    }

    return { isValid: true };
}

/**
 * Validate Thai citizen ID (must be exactly 13 digits)
 */
export function validateCitizenId(value: string): ValidationResult {
    const digitsOnly = value.replace(/\D/g, "");

    if (!value || value.trim() === "") {
        return { isValid: true };
    }

    if (!/^\d+$/.test(value)) {
        return {
            isValid: false,
            error: "เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น",
        };
    }

    if (digitsOnly.length !== 13) {
        return {
            isValid: false,
            error: "เลขบัตรประชาชนต้องมี 13 หลัก",
        };
    }

    return { isValid: true };
}
