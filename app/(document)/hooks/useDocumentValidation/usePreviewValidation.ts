"use client";

import { useCallback } from "react";
import { type UsePreviewValidationProps } from "./types";
import { scrollToFirstError } from "./helpers";

export function usePreviewValidation<T extends object>({
    validateForm,
    openPreview,
    formData,
    setErrors,
}: UsePreviewValidationProps<T>) {
    const handlePreview = useCallback(
        async (data: T): Promise<void> => {
            const result = await validateForm(data);

            setErrors(result.errors);

            if (result.isValid) {
                openPreview();
            } else {
                scrollToFirstError(Object.keys(result.errors));
            }
        },
        [validateForm, openPreview, setErrors],
    );

    /**
     * Get a bound handlePreview function that uses formData from config
     */
    const getHandlePreview = useCallback((): void => {
        if (formData) {
            void handlePreview(formData);
        } else {
            console.warn(
                "getHandlePreview called but formData is not provided in config",
            );
        }
    }, [formData, handlePreview]);

    return { handlePreview, getHandlePreview };
}
