"use client";

import { type ChangeEvent, type FormEvent } from "react";
import { type Session } from "next-auth";

// =====================================================
// Config Types
// =====================================================

export interface UseDocumentFormOptions<T> {
    initialData: T;
    apiEndpoint: string;
    documentType: string;
    projectId?: string;
    prepareFormData?: (data: T, formData: FormData) => void;
    onSuccess?: (result: unknown) => void;
}

// =====================================================
// Return Types
// =====================================================

export interface UseDocumentFormReturn<T> {
    // State
    formData: T;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    message: string | null;
    isError: boolean;
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    generatedFileUrl: string | null;
    setGeneratedFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
    isClient: boolean;

    // Handlers
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    isDirty: boolean;

    // Utilities
    resetForm: () => void;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
}

// =====================================================
// Sub-hook Props Types
// =====================================================

export interface FormStateReturn<T> {
    formData: T;
    setFormData: React.Dispatch<React.SetStateAction<T>>;
    isSubmitting: boolean;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    message: string | null;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    isError: boolean;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
    isSuccessModalOpen: boolean;
    setIsSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    generatedFileUrl: string | null;
    setGeneratedFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
    isClient: boolean;
}

export interface UseFormSubmitProps<T> {
    session: Session | null;
    formData: T;
    apiEndpoint: string;
    documentType: string;
    projectId?: string;
    prepareFormData?: (data: T, formData: FormData) => void;
    onSuccess?: (result: unknown) => void;
    setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
    setMessage: React.Dispatch<React.SetStateAction<string | null>>;
    setIsError: React.Dispatch<React.SetStateAction<boolean>>;
    setGeneratedFileUrl: React.Dispatch<React.SetStateAction<string | null>>;
    setIsSuccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
