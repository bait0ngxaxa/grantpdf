"use client";

import { useCallback, type ChangeEvent, type DragEvent } from "react";
import {
    FILE_UPLOAD,
    getMaxUploadSizeBytesByFileName,
    getMaxUploadSizeMbByFileName,
} from "@/lib/constants";
import { type FileHandlersProps } from "./types";

export function useFileHandlers({
    setSelectedFile,
    setUploadMessage,
    setUploadSuccess,
}: FileHandlersProps) {
    const validateFile = useCallback(
        (file: File): boolean => {
            const fileName = file.name.toLowerCase();
            const isValidExtension = FILE_UPLOAD.ALLOWED_EXTENSIONS.some(
                (ext) => fileName.endsWith(ext),
            );

            if (!isValidExtension) {
                setUploadMessage("กรุณาเลือกไฟล์ .docx และ .pdf เท่านั้น");
                setUploadSuccess(false);
                return false;
            }

            const maxSizeBytes = getMaxUploadSizeBytesByFileName(file.name);
            const maxSizeMb = getMaxUploadSizeMbByFileName(file.name);

            if (file.size > maxSizeBytes) {
                setUploadMessage(
                    `ไฟล์มีขนาดใหญ่เกินไป (สูงสุด ${maxSizeMb}MB)`,
                );
                setUploadSuccess(false);
                return false;
            }

            return true;
        },
        [setUploadMessage, setUploadSuccess],
    );

    const handleFileSelect = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const file = event.target.files?.[0];
            if (file && validateFile(file)) {
                setSelectedFile(file);
                setUploadMessage("");
                setUploadSuccess(false);
            }
        },
        [validateFile, setSelectedFile, setUploadMessage, setUploadSuccess],
    );

    const handleDragOver = useCallback(
        (event: DragEvent<HTMLDivElement>): void => {
            event.preventDefault();
        },
        [],
    );

    const handleDrop = useCallback(
        (event: DragEvent<HTMLDivElement>): void => {
            event.preventDefault();
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (validateFile(file)) {
                    setSelectedFile(file);
                    setUploadMessage("");
                    setUploadSuccess(false);
                }
            }
        },
        [validateFile, setSelectedFile, setUploadMessage, setUploadSuccess],
    );

    return { handleFileSelect, handleDragOver, handleDrop };
}
