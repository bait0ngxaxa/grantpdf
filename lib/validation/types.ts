export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export interface DocumentValidationResult<T> {
    isValid: boolean;
    errors: ValidationErrors<T>;
}
