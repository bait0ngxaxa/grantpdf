"use client";

import { useCallback } from "react";
import { type FileUploadProps } from "./types";
import {
    createUploadIdempotencyKey,
    fetchWithUploadRetry,
    isUploadTimeoutError,
} from "../uploadRequest";

const UPLOAD_TIMEOUT_MESSAGE =
    "อัปโหลดไฟล์ไม่สำเร็จภายในเวลาที่กำหนด กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง";

export function useFileUpload({
    selectedFile,
    selectedProjectId,
    fileInputRef,
    setIsUploading,
    setUploadMessage,
    setUploadSuccess,
    setSelectedFile,
}: FileUploadProps) {
    const handleUpload = useCallback(async (): Promise<void> => {
        if (!selectedFile) {
            setUploadMessage("กรุณาเลือกไฟล์ก่อน");
            setUploadSuccess(false);
            return;
        }

        if (!selectedProjectId) {
            setUploadMessage("กรุณาเลือกโครงการก่อน");
            setUploadSuccess(false);
            return;
        }

        setIsUploading(true);
        setUploadMessage("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("projectId", selectedProjectId);

            const response = await fetchWithUploadRetry("/api/file-upload", {
                method: "POST",
                body: formData,
            }, createUploadIdempotencyKey());

            const result = await response.json();

            if (response.ok && result.success) {
                setUploadMessage(`อัพโหลดไฟล์ "${selectedFile.name}" สำเร็จ!`);
                setUploadSuccess(true);
                setSelectedFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                setUploadMessage(result.error || "เกิดข้อผิดพลาดในการอัพโหลด");
                setUploadSuccess(false);
            }
        } catch (error) {
            console.error("Upload error:", error);
            setUploadMessage(
                isUploadTimeoutError(error)
                    ? UPLOAD_TIMEOUT_MESSAGE
                    : "เกิดข้อผิดพลาดในการอัพโหลด",
            );
            setUploadSuccess(false);
        } finally {
            setIsUploading(false);
        }
    }, [
        selectedFile,
        selectedProjectId,
        fileInputRef,
        setIsUploading,
        setUploadMessage,
        setUploadSuccess,
        setSelectedFile,
    ]);

    return { handleUpload };
}
