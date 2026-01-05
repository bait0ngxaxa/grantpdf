// lib/validation.ts
// Client-side validation utilities for form inputs

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validate Thai phone number (must be exactly 10 digits)
 */
export function validatePhone(value: string): ValidationResult {
    // Remove all non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, "");

    if (!value || value.trim() === "") {
        return { isValid: true }; // Empty is valid (use required for mandatory)
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
 * Validate Thai citizen ID (must be exactly 13 digits)
 */
export function validateCitizenId(value: string): ValidationResult {
    // Remove all non-digit characters for validation
    const digitsOnly = value.replace(/\D/g, "");

    if (!value || value.trim() === "") {
        return { isValid: true }; // Empty is valid (use required for mandatory)
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

/**
 * Format phone number as user types (optional helper)
 * Removes non-digit characters
 */
export function formatPhoneInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 10);
}

/**
 * Format citizen ID as user types (optional helper)
 * Removes non-digit characters
 */
export function formatCitizenIdInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 13);
}

/**
 * Validate on change handler - returns formatted value and error
 */
export function validateAndFormatPhone(value: string): {
    value: string;
    error?: string;
} {
    const formatted = formatPhoneInput(value);
    const validation = validatePhone(formatted);
    return {
        value: formatted,
        error: validation.error,
    };
}

/**
 * Validate on change handler - returns formatted value and error
 */
export function validateAndFormatCitizenId(value: string): {
    value: string;
    error?: string;
} {
    const formatted = formatCitizenIdInput(value);
    const validation = validateCitizenId(formatted);
    return {
        value: formatted,
        error: validation.error,
    };
}
