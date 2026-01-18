import { validatePhone, validateCitizenId } from "./fieldValidators";

export function formatPhoneInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 10);
}

export function formatCitizenIdInput(value: string): string {
    return value.replace(/\D/g, "").slice(0, 13);
}

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
