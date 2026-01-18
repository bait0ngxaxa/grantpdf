"use client";

import { useState, type ChangeEvent } from "react";
import { type ApprovalData } from "@/config/initialData";
import { type UseAttachmentHandlersReturn } from "./types";

interface UseAttachmentHandlersProps {
    setFormData: React.Dispatch<React.SetStateAction<ApprovalData>>;
}

export function useAttachmentHandlers({
    setFormData,
}: UseAttachmentHandlersProps): UseAttachmentHandlersReturn {
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

    // Add new attachment text entry
    const addAttachment = (): void => {
        setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ""],
        }));
    };

    // Remove attachment text entry by index
    const removeAttachment = (index: number): void => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    // Update attachment text entry by index
    const updateAttachment = (index: number, value: string): void => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.map((item, i) =>
                i === index ? value : item,
            ),
        }));
    };

    // Handle file input change for attachments
    const handleAttachmentFilesChange = (
        e: ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(e.target.files || []);
        setAttachmentFiles((prev) => {
            const newFiles = files.filter(
                (file) =>
                    !prev.some(
                        (existingFile) =>
                            existingFile.name === file.name &&
                            existingFile.size === file.size,
                    ),
            );
            return [...prev, ...newFiles];
        });

        e.target.value = "";
    };

    // Remove attachment file by index
    const removeAttachmentFile = (index: number): void => {
        setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return {
        attachmentFiles,
        addAttachment,
        removeAttachment,
        updateAttachment,
        handleAttachmentFilesChange,
        removeAttachmentFile,
    };
}
