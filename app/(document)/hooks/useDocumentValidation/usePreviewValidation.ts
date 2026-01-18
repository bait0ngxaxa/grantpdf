"use client";

import { useCallback } from "react";
import { type UsePreviewValidationProps } from "./types";
import { scrollToFirstError, runFieldValidations } from "./helpers";

export function usePreviewValidation<T extends object>({
    validateForm,
    openPreview,
    formData,
    phoneFields,
    emailFields,
    citizenIdFields,
    setErrors,
}: UsePreviewValidationProps<T>) {
    const handlePreview = useCallback(
        (data: T) => {
            const result = validateForm(data);

            // Run field-specific validations
            runFieldValidations(
                data,
                result,
                phoneFields,
                emailFields,
                citizenIdFields,
            );

            setErrors(result.errors);

            if (result.isValid) {
                openPreview();
            } else {
                scrollToFirstError(Object.keys(result.errors));
            }
        },
        [
            validateForm,
            openPreview,
            phoneFields,
            emailFields,
            citizenIdFields,
            setErrors,
        ],
    );

    /**
     * Get a bound handlePreview function that uses formData from config
     */
    const getHandlePreview = useCallback((): void => {
        if (formData) {
            handlePreview(formData);
        } else {
            console.warn(
                "getHandlePreview called but formData is not provided in config",
            );
        }
    }, [formData, handlePreview]);

    return { handlePreview, getHandlePreview };
}
