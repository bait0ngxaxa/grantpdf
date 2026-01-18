"use client";

import { useCallback } from "react";
import { validateAttachments, validateSignature } from "./helpers";

interface UsePreviewValidationProps {
    formData: { attachments: string[] };
    attachmentFiles: File[];
    signatureFile: File | null;
    signatureCanvasData: string | null;
}

export function usePreviewValidation({
    formData,
    attachmentFiles,
    signatureFile,
    signatureCanvasData,
}: UsePreviewValidationProps) {
    const getPreviewError = useCallback((): string | null => {
        // Validate attachments
        const attachmentError = validateAttachments(
            formData.attachments,
            attachmentFiles,
        );
        if (attachmentError) return attachmentError;

        // Validate signature
        const signatureError = validateSignature(
            signatureFile,
            signatureCanvasData,
        );
        if (signatureError) return signatureError;

        return null;
    }, [
        formData.attachments,
        attachmentFiles,
        signatureFile,
        signatureCanvasData,
    ]);

    return { getPreviewError };
}
