"use client";

import { useCallback } from "react";
import { type UseSubmitValidationProps } from "./types";
import { scrollToFirstError, runFieldValidations } from "./helpers";

export function useSubmitValidation<T extends object>({
    validateForm,
    phoneFields,
    citizenIdFields,
    setErrors,
}: UseSubmitValidationProps<T>) {
    const validateBeforeSubmit = useCallback(
        (
            e: React.FormEvent<HTMLFormElement>,
            formData: T,
            onValid: (e: React.FormEvent<HTMLFormElement>) => void,
        ) => {
            e.preventDefault();

            const result = validateForm(formData);

            // Run field-specific validations (phone and citizenId only for submit)
            runFieldValidations(
                formData,
                result,
                phoneFields,
                [],
                citizenIdFields,
            );

            setErrors(result.errors);

            if (result.isValid) {
                onValid(e);
            } else {
                scrollToFirstError(Object.keys(result.errors));
            }
        },
        [validateForm, phoneFields, citizenIdFields, setErrors],
    );

    return { validateBeforeSubmit };
}
