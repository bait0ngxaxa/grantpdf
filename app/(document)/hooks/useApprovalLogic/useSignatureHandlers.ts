"use client";

import { useState, type ChangeEvent } from "react";
import { type UseSignatureHandlersReturn } from "./types";

export function useSignatureHandlers(): UseSignatureHandlersReturn {
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        null,
    );
    const [signatureCanvasData, setSignatureCanvasData] = useState<
        string | null
    >(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const file = e.target.files?.[0] || null;
        setSignatureFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = (): void => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSignaturePreview(null);
        }
    };

    const handleSignatureCanvasChange = (
        signatureDataURL: string | null,
    ): void => {
        setSignatureCanvasData(signatureDataURL);
    };

    return {
        signatureFile,
        signaturePreview,
        signatureCanvasData,
        handleFileChange,
        handleSignatureCanvasChange,
    };
}
