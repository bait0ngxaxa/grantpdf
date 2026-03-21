"use client";

import { useCallback } from "react";
import { type UseSubmitValidationProps } from "./types";
import { scrollToFirstError } from "./helpers";

export function useSubmitValidation<T extends object>({
    validateForm,
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

            setErrors(result.errors);

            if (result.isValid) {
                onValid(e);
            } else {
                scrollToFirstError(Object.keys(result.errors));
            }
        },
        [validateForm, setErrors],
    );

    return { validateBeforeSubmit };
}
