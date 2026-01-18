"use client";

import { useState } from "react";
import { type ValidationErrors } from "@/lib/validation";
import {
    type UseDocumentValidationConfig,
    type UseDocumentValidationReturn,
} from "./types";
import { usePreviewValidation } from "./usePreviewValidation";
import { useInputFormatters } from "./useInputFormatters";
import { useSubmitValidation } from "./useSubmitValidation";

export type {
    UseDocumentValidationConfig,
    UseDocumentValidationReturn,
} from "./types";

export function useDocumentValidation<T extends object>(
    config: UseDocumentValidationConfig<T>,
): UseDocumentValidationReturn<T> {
    const {
        validateForm,
        openPreview,
        formData,
        phoneFields = [],
        emailFields = [],
        citizenIdFields = [],
    } = config;

    const [errors, setErrors] = useState<ValidationErrors<T>>({});

    // Preview validation
    const { handlePreview, getHandlePreview } = usePreviewValidation({
        validateForm,
        openPreview,
        formData,
        phoneFields,
        emailFields,
        citizenIdFields,
        setErrors,
    });

    // Input formatters
    const { createPhoneChangeHandler, createCitizenIdChangeHandler } =
        useInputFormatters({ setErrors });

    // Submit validation
    const { validateBeforeSubmit } = useSubmitValidation({
        validateForm,
        phoneFields,
        citizenIdFields,
        setErrors,
    });

    return {
        errors,
        setErrors,
        handlePreview,
        getHandlePreview,
        createPhoneChangeHandler,
        createCitizenIdChangeHandler,
        validateBeforeSubmit,
    };
}
