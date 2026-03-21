import { type ZodTypeAny, type ZodError } from "zod";
import type { ValidationErrors, DocumentValidationResult } from "./types";

/**
 * Adapter ระหว่าง Zod schema กับ DocumentValidationResult format เดิม
 * เพื่อให้ useDocumentValidation hook และ document validators ใช้ร่วมกันได้
 */
export function zodValidate<T extends object>(
    schema: ZodTypeAny,
    data: T,
): DocumentValidationResult<T> {
    const result = schema.safeParse(data);

    if (result.success) {
        return { isValid: true, errors: {} };
    }

    // แปลง Zod errors → ValidationErrors<T>
    const zodError = result.error as ZodError;
    const errors: ValidationErrors<T> = {};

    for (const issue of zodError.issues) {
        const field = issue.path[0] as keyof T | undefined;
        if (field !== undefined && !(field in errors)) {
            errors[field] = issue.message;
        }
    }

    return { isValid: false, errors };
}

/** @deprecated ใช้ zodValidate แทน */
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
