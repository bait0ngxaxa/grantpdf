import { useState, useCallback, ChangeEvent } from "react";
import {
    ValidationErrors,
    DocumentValidationResult,
    validatePhone,
    validateEmail,
    validateCitizenId,
    validateAndFormatPhone,
    validateAndFormatCitizenId,
} from "@/lib/validation";

/**
 * Configuration for document validation hook
 */
interface UseDocumentValidationConfig<T extends object> {
    /** Function to validate all form fields */
    validateForm: (data: T) => DocumentValidationResult<T>;
    /** Function to open preview modal */
    openPreview: () => void;
    /** Optional: fields that need phone format validation */
    phoneFields?: (keyof T)[];
    /** Optional: fields that need email format validation */
    emailFields?: (keyof T)[];
    /** Optional: fields that need citizen ID format validation */
    citizenIdFields?: (keyof T)[];
}

/**
 * Return type for the document validation hook
 */
interface UseDocumentValidationReturn<T extends object> {
    /** Current validation errors */
    errors: ValidationErrors<T>;
    /** Set validation errors manually */
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors<T>>>;
    /** Handle preview button click with validation */
    handlePreview: (formData: T) => void;
    /** Create a phone input change handler for a specific field */
    createPhoneChangeHandler: (
        fieldName: keyof T,
        handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
        setFormData: React.Dispatch<React.SetStateAction<T>>
    ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    /** Create a citizen ID input change handler for a specific field */
    createCitizenIdChangeHandler: (
        fieldName: keyof T,
        setFormData: React.Dispatch<React.SetStateAction<T>>
    ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    /** Validate form before submit */
    validateBeforeSubmit: (
        e: React.FormEvent<HTMLFormElement>,
        formData: T,
        onValid: (e: React.FormEvent<HTMLFormElement>) => void
    ) => void;
}

/**
 * Scroll to and focus the first error field
 */
function scrollToFirstError(errorFields: string[]): void {
    if (errorFields.length === 0) return;

    const firstErrorField = document.querySelector(
        `[name="${errorFields[0]}"]`
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
 * Custom hook for document form validation
 * Centralizes validation logic with scroll-to-error, field format validation, and preview handling
 */
export function useDocumentValidation<T extends object>(
    config: UseDocumentValidationConfig<T>
): UseDocumentValidationReturn<T> {
    const {
        validateForm,
        openPreview,
        phoneFields = [],
        emailFields = [],
        citizenIdFields = [],
    } = config;

    const [errors, setErrors] = useState<ValidationErrors<T>>({});

    /**
     * Handle preview with full validation and scroll-to-error
     */
    const handlePreview = useCallback(
        (formData: T) => {
            const result = validateForm(formData);

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

            setErrors(result.errors);

            if (result.isValid) {
                openPreview();
            } else {
                scrollToFirstError(Object.keys(result.errors));
            }
        },
        [validateForm, openPreview, phoneFields, emailFields, citizenIdFields]
    );

    /**
     * Create a phone input change handler with formatting and validation
     */
    const createPhoneChangeHandler = useCallback(
        (
            fieldName: keyof T,
            handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
            setFormData: React.Dispatch<React.SetStateAction<T>>
        ) => {
            return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { value } = e.target;
                const { value: formatted, error } =
                    validateAndFormatPhone(value);

                // Update form data with formatted value
                setFormData((prev) => ({ ...prev, [fieldName]: formatted }));

                // Update error state
                setErrors((prev) => ({ ...prev, [fieldName]: error }));

                // Call original handleChange with synthetic event
                const syntheticEvent = {
                    target: { name: fieldName as string, value: formatted },
                } as ChangeEvent<HTMLInputElement>;
                handleChange(syntheticEvent);
            };
        },
        []
    );

    /**
     * Create a citizen ID input change handler with formatting and validation
     */
    const createCitizenIdChangeHandler = useCallback(
        (
            fieldName: keyof T,
            setFormData: React.Dispatch<React.SetStateAction<T>>
        ) => {
            return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                const { value } = e.target;
                const { value: formatted, error } =
                    validateAndFormatCitizenId(value);

                // Update form data with formatted value
                setFormData((prev) => ({ ...prev, [fieldName]: formatted }));

                // Update error state
                setErrors((prev) => ({ ...prev, [fieldName]: error }));
            };
        },
        []
    );

    /**
     * Validate form before submitting
     */
    const validateBeforeSubmit = useCallback(
        (
            e: React.FormEvent<HTMLFormElement>,
            formData: T,
            onValid: (e: React.FormEvent<HTMLFormElement>) => void
        ) => {
            e.preventDefault();

            const result = validateForm(formData);

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

            setErrors(result.errors);

            if (result.isValid) {
                onValid(e);
            } else {
                scrollToFirstError(Object.keys(result.errors));
            }
        },
        [validateForm, phoneFields, citizenIdFields]
    );

    return {
        errors,
        setErrors,
        handlePreview,
        createPhoneChangeHandler,
        createCitizenIdChangeHandler,
        validateBeforeSubmit,
    };
}
