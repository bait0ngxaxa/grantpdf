"use client";

import { useState, type ChangeEvent } from "react";
import { type UseSignatureHandlersReturn } from "./types";
import {
    isAllowedSignatureMimeType,
    optimizeSignatureImageFile,
    SIGNATURE_MAX_SIZE_BYTES,
} from "./helpers";
import { SIGNATURE_UPLOAD } from "@/lib/constants";

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
        const inputElement = e.target;
        inputElement.setCustomValidity("");

        if (!file) {
            setSignatureFile(null);
            setSignaturePreview(null);
            return;
        }

        if (!isAllowedSignatureMimeType(file.type)) {
            inputElement.setCustomValidity(
                "ไฟล์ลายเซ็นต้องเป็น PNG หรือ JPEG เท่านั้น",
            );
            inputElement.reportValidity();
            inputElement.value = "";
            setSignatureFile(null);
            setSignaturePreview(null);
            return;
        }

        void (async () => {
            try {
                const optimizedFile = await optimizeSignatureImageFile(file);

                if (optimizedFile.size > SIGNATURE_MAX_SIZE_BYTES) {
                    inputElement.setCustomValidity(
                        `ไฟล์ลายเซ็นมีขนาดใหญ่เกินไป (สูงสุด ${SIGNATURE_UPLOAD.MAX_SIZE_MB}MB)`,
                    );
                    inputElement.reportValidity();
                    inputElement.value = "";
                    setSignatureFile(null);
                    setSignaturePreview(null);
                    return;
                }

                setSignatureFile(optimizedFile);
                setSignatureCanvasData(null);

                const reader = new FileReader();
                reader.onloadend = (): void => {
                    setSignaturePreview(reader.result as string);
                };
                reader.readAsDataURL(optimizedFile);
            } catch (error) {
                console.error("Error processing signature image:", error);
                inputElement.setCustomValidity(
                    "ไม่สามารถประมวลผลไฟล์ลายเซ็นได้",
                );
                inputElement.reportValidity();
                inputElement.value = "";
                setSignatureFile(null);
                setSignaturePreview(null);
            }
        })();
    };

    const handleSignatureCanvasChange = (
        signatureDataURL: string | null,
    ): void => {
        if (signatureDataURL) {
            setSignatureFile(null);
            setSignaturePreview(null);
        }
        setSignatureCanvasData(signatureDataURL);
    };

    const clearSignatureFile = (): void => {
        setSignatureFile(null);
        setSignaturePreview(null);
    };

    const clearSignatureCanvas = (): void => {
        setSignatureCanvasData(null);
    };

    return {
        signatureFile,
        signaturePreview,
        signatureCanvasData,
        handleFileChange,
        handleSignatureCanvasChange,
        clearSignatureFile,
        clearSignatureCanvas,
    };
}
