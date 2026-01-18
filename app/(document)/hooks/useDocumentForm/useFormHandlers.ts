"use client";

import { useCallback, type ChangeEvent } from "react";

interface UseFormHandlersProps<T> {
    initialData: T;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
    setGeneratedFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useFormHandlers<T extends object>({
    initialData,
    setFormData,
    setMessage,
    setIsError,
    setGeneratedFileUrl,
}: UseFormHandlersProps<T>) {
    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        },
        [setFormData],
    );

    /**
     * Reset form to initial state
     */
    const resetForm = useCallback(() => {
        setFormData(initialData);
        setMessage(null);
        setIsError(false);
        setGeneratedFileUrl(null);
    }, [initialData, setFormData, setMessage, setIsError, setGeneratedFileUrl]);

    return { handleChange, resetForm };
}
