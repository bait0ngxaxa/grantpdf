"use client";

import { useCallback } from "react";
import { type UseSubmitValidationProps } from "./types";
import { scrollToFirstError } from "./helpers";

export function useSubmitValidation<T extends object>({
    validateForm,
    setErrors,
}: UseSubmitValidationProps<T>) {
    const validateBeforeSubmit = useCallback(
        async (
            e: React.FormEvent<HTMLFormElement>,
            formData: T,
            onValid: (e: React.FormEvent<HTMLFormElement>) => void,
        ): Promise<void> => {
            e.preventDefault();

            const result = await validateForm(formData);

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
