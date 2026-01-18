"use client";

import { useCallback } from "react";
import { type UseFileUploadProps } from "./types";

export function useFileUpload({ session, projectId }: UseFileUploadProps) {
    const uploadAttachmentFiles = useCallback(
        async (files: File[]): Promise<string[]> => {
            const uploadedIds: string[] = [];

            if (!projectId) {
                throw new Error("กรุณาเลือกโครงการก่อนอัปโหลดไฟล์");
            }

            for (const file of files) {
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append("file", file);
                    uploadFormData.append("projectId", projectId);

                    if (session?.user?.id) {
                        uploadFormData.append(
                            "userId",
                            session.user.id.toString(),
                        );
                    }
                    if (session?.user?.email) {
                        uploadFormData.append("userEmail", session.user.email);
                    }

                    const response = await fetch("/api/file-upload", {
                        method: "POST",
                        body: uploadFormData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.file?.id) {
                            uploadedIds.push(result.file.id);
                        }
                    }
                } catch (error) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    // Silent fail for individual files to allow others to proceed
                }
            }

            return uploadedIds;
        },
        [session, projectId],
    );

    return { uploadAttachmentFiles };
}
