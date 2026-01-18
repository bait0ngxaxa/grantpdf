"use client";

import { useState } from "react";
import { type FormStateReturn } from "./types";

export function useFormState<T extends object>(
    initialData: T,
): FormStateReturn<T> {
    const isClient = typeof window !== "undefined";

    const [formData, setFormData] = useState<T>(initialData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null,
    );

    return {
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
    };
}
