"use client";

import { useSession } from "next-auth/react";
import {
    type UseDocumentFormOptions,
    type UseDocumentFormReturn,
} from "./types";
import { useFormState } from "./useFormState";
import { useFormHandlers } from "./useFormHandlers";
import { useFormSubmit } from "./useFormSubmit";
import { checkIsDirty } from "./helpers";

export type { UseDocumentFormOptions, UseDocumentFormReturn } from "./types";

export function useDocumentForm<T extends object>({
    initialData,
    apiEndpoint,
    documentType,
    projectId,
    prepareFormData,
    onSuccess,
}: UseDocumentFormOptions<T>): UseDocumentFormReturn<T> {
    const { data: session } = useSession();

    // Form state
    const {
        formData,
        setFormData,
        isSubmitting,
        setIsSubmitting,
        message,
        setMessage,
        isError,
        setIsError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        setGeneratedFileUrl,
        isClient,
    } = useFormState<T>(initialData);

    // Form handlers
    const { handleChange, resetForm } = useFormHandlers({
        initialData,
        setFormData,
        setMessage,
        setIsError,
        setGeneratedFileUrl,
    });

    // Form submit
    const { handleSubmit } = useFormSubmit({
        session,
        formData,
        apiEndpoint,
        documentType,
        projectId,
        prepareFormData,
        onSuccess,
        setIsSubmitting,
        setMessage,
        setIsError,
        setGeneratedFileUrl,
        setIsSuccessModalOpen,
    });

    // Calculate isDirty
    const isDirty = checkIsDirty(formData);

    return {
        // State
        formData,
        setFormData,
        isSubmitting,
        setIsSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        setGeneratedFileUrl,
        isClient,

        // Handlers
        handleChange,
        handleSubmit,
        isDirty,

        // Utilities
        resetForm,
        setMessage,
        setIsError,
    };
}
