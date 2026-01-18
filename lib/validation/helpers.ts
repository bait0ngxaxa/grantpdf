import type { ValidationErrors, DocumentValidationResult } from "./types";

export function validateRequired<T extends object>(
    data: T,
    requiredFields: (keyof T)[],
    labels: Record<keyof T, string>,
): DocumentValidationResult<T> {
    const errors: ValidationErrors<T> = {};

    for (const field of requiredFields) {
        const value = data[field];
        if (value === null || value === undefined) {
            errors[field] = `กรุณาระบุ${labels[field]}`;
        } else if (typeof value === "string" && value.trim() === "") {
            errors[field] = `กรุณาระบุ${labels[field]}`;
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
