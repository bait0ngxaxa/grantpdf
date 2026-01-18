import {
    type ValidationErrors,
    type DocumentValidationResult,
    validatePhone,
    validateEmail,
    validateCitizenId,
} from "@/lib/validation";

export function scrollToFirstError(errorFields: string[]): void {
    if (errorFields.length === 0) return;

    const firstErrorField = document.querySelector(
        `[name="${errorFields[0]}"]`,
    );

    if (firstErrorField) {
        firstErrorField.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
        (firstErrorField as HTMLElement).focus();
    }
}

/**
 * Run field-specific validations (phone, email, citizenId)
 * Mutates the result object with additional errors
 */
export function runFieldValidations<T extends object>(
    formData: T,
    result: DocumentValidationResult<T>,
    phoneFields: (keyof T)[],
    emailFields: (keyof T)[],
    citizenIdFields: (keyof T)[],
): void {
    // Validate phone format for specified fields
    for (const field of phoneFields) {
        const value = formData[field] as string;
        const phoneValidation = validatePhone(value);
        if (!phoneValidation.isValid) {
            result.errors[field] =
                phoneValidation.error as ValidationErrors<T>[keyof T];
            result.isValid = false;
        }
    }

    // Validate email format for specified fields
    for (const field of emailFields) {
        const value = formData[field] as string;
        const emailValidation = validateEmail(value);
        if (!emailValidation.isValid) {
            result.errors[field] =
                emailValidation.error as ValidationErrors<T>[keyof T];
            result.isValid = false;
        }
    }

    // Validate citizen ID format for specified fields
    for (const field of citizenIdFields) {
        const value = formData[field] as string;
        const citizenValidation = validateCitizenId(value);
        if (!citizenValidation.isValid) {
            result.errors[field] =
                citizenValidation.error as ValidationErrors<T>[keyof T];
            result.isValid = false;
        }
    }
}
