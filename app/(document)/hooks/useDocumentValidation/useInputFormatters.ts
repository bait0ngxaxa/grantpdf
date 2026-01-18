"use client";

import { useCallback, type ChangeEvent } from "react";
import {
    validateAndFormatPhone,
    validateAndFormatCitizenId,
} from "@/lib/validation";
import { type UseInputFormattersProps } from "./types";

export function useInputFormatters<T extends object>({
    setErrors,
}: UseInputFormattersProps<T>) {
    const createPhoneChangeHandler = useCallback(
        (
            fieldName: keyof T,
            handleChange: (e: ChangeEvent<HTMLInputElement>) => void,
            setFormData: React.Dispatch<React.SetStateAction<T>>,
        ) => {
            return (
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ): void => {
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
        [setErrors],
    );

    const createCitizenIdChangeHandler = useCallback(
        (
            fieldName: keyof T,
            setFormData: React.Dispatch<React.SetStateAction<T>>,
        ) => {
            return (
                e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ): void => {
                const { value } = e.target;
                const { value: formatted, error } =
                    validateAndFormatCitizenId(value);

                // Update form data with formatted value
                setFormData((prev) => ({ ...prev, [fieldName]: formatted }));

                // Update error state
                setErrors((prev) => ({ ...prev, [fieldName]: error }));
            };
        },
        [setErrors],
    );

    return { createPhoneChangeHandler, createCitizenIdChangeHandler };
}
