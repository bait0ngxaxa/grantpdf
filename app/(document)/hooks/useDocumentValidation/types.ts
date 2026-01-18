import { type ChangeEvent } from "react";
import {
    type ValidationErrors,
    type DocumentValidationResult,
} from "@/lib/validation";

// =====================================================
// Config Types
// =====================================================

export interface UseDocumentValidationConfig<T extends object> {
    /** Function to validate all form fields */
    validateForm: (data: T) => DocumentValidationResult<T>;
    /** Function to open preview modal */
    openPreview: () => void;
    /** Optional: current form data for bound preview handler */
    formData?: T;
    /** Optional: fields that need phone format validation */
    phoneFields?: (keyof T)[];
    /** Optional: fields that need email format validation */
    emailFields?: (keyof T)[];
    /** Optional: fields that need citizen ID format validation */
    citizenIdFields?: (keyof T)[];
}

// =====================================================
// Return Types
// =====================================================

export interface UseDocumentValidationReturn<T extends object> {
    /** Current validation errors */
    errors: ValidationErrors<T>;
    /** Set validation errors manually */
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors<T>>>;
    /** Handle preview button click with validation (requires formData param) */
    handlePreview: (formData: T) => void;
    /** Get a bound handlePreview function (use when formData is passed in config) */
    getHandlePreview: () => void;
    /** Create a phone input change handler for a specific field */
    createPhoneChangeHandler: (
        fieldName: keyof T,
        handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
        setFormData: React.Dispatch<React.SetStateAction<T>>,
    ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    /** Create a citizen ID input change handler for a specific field */
    createCitizenIdChangeHandler: (
        fieldName: keyof T,
        setFormData: React.Dispatch<React.SetStateAction<T>>,
    ) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    /** Validate form before submit */
    validateBeforeSubmit: (
        e: React.FormEvent<HTMLFormElement>,
        formData: T,
        onValid: (e: React.FormEvent<HTMLFormElement>) => void,
    ) => void;
}

// =====================================================
// Sub-hook Return Types
// =====================================================

export interface UsePreviewValidationProps<T extends object> {
    validateForm: (data: T) => DocumentValidationResult<T>;
    openPreview: () => void;
    formData?: T;
    phoneFields: (keyof T)[];
    emailFields: (keyof T)[];
    citizenIdFields: (keyof T)[];
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors<T>>>;
}

export interface UseInputFormattersProps<T extends object> {
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors<T>>>;
}

export interface UseSubmitValidationProps<T extends object> {
    validateForm: (data: T) => DocumentValidationResult<T>;
    phoneFields: (keyof T)[];
    citizenIdFields: (keyof T)[];
    setErrors: React.Dispatch<React.SetStateAction<ValidationErrors<T>>>;
}
