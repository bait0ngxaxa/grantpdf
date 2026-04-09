"use client";

import { useCallback } from "react";
import { type UseFileUploadProps } from "./types";
import {
    fetchWithUploadTimeout,
    isUploadTimeoutError,
} from "../uploadRequest";

const ATTACHMENT_UPLOAD_TIMEOUT_MESSAGE =
    "อัปโหลดไฟล์แนบไม่สำเร็จภายในเวลาที่กำหนด กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง";

function readUploadErrorMessage(data: unknown): string | null {
    if (
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof (data as { error?: unknown }).error === "string"
    ) {
        return (data as { error: string }).error;
    }

    return null;
}

export function useFileUpload({ session, projectId }: UseFileUploadProps) {
    const uploadAttachmentFiles = useCallback(
        async (files: File[]): Promise<string[]> => {
            const uploadedIds: string[] = [];

            if (!projectId) {
                throw new Error("กรุณาเลือกโครงการก่อนอัปโหลดไฟล์");
            }

            for (const file of files) {
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

                try {
                    const response = await fetchWithUploadTimeout("/api/file-upload", {
                        method: "POST",
                        body: uploadFormData,
                    });

                    const result: unknown = await response.json().catch(() => null);
                    if (!response.ok) {
                        throw new Error(
                            readUploadErrorMessage(result) ||
                                `อัปโหลดไฟล์แนบ "${file.name}" ไม่สำเร็จ`,
                        );
                    }

                    if (
                        typeof result === "object" &&
                        result !== null &&
                        "success" in result &&
                        result.success === true &&
                        "file" in result &&
                        typeof result.file === "object" &&
                        result.file !== null &&
                        "id" in result.file &&
                        typeof result.file.id === "string"
                    ) {
                        uploadedIds.push(result.file.id);
                    } else {
                        throw new Error(
                            `อัปโหลดไฟล์แนบ "${file.name}" ไม่สำเร็จ`,
                        );
                    }
                } catch (error) {
                    console.error(`Error uploading file ${file.name}:`, error);
                    if (isUploadTimeoutError(error)) {
                        throw new Error(ATTACHMENT_UPLOAD_TIMEOUT_MESSAGE);
                    }
                    throw error;
                }
            }

            return uploadedIds;
        },
        [session, projectId],
    );

    return { uploadAttachmentFiles };
}
