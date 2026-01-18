"use client";

import { useCallback, type FormEvent } from "react";
import { type UseFormSubmitProps } from "./types";
import { buildFormData, appendSessionInfo } from "./helpers";

export function useFormSubmit<T extends object>({
    session,
    formData,
    apiEndpoint,
    documentType,
    projectId,
    prepareFormData,
    onSuccess,
    setIsSubmitting,
    setMessage,
    setIsError,
    setGeneratedFileUrl,
    setIsSuccessModalOpen,
}: UseFormSubmitProps<T>) {
    const handleSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!session) {
                setMessage("คุณต้องเข้าสู่ระบบก่อน");
                setIsError(true);
                return;
            }

            setIsSubmitting(true);
            setMessage(null);
            setGeneratedFileUrl(null);
            setIsError(false);

            try {
                const data = buildFormData(formData);

                // Append session info
                const sessionWithToken = session as { accessToken?: string };
                appendSessionInfo(
                    data,
                    session,
                    projectId,
                    sessionWithToken?.accessToken,
                );

                // Custom form data preparation
                if (prepareFormData) {
                    prepareFormData(formData, data);
                }

                const response = await fetch(apiEndpoint, {
                    method: "POST",
                    body: data,
                });

                if (response.ok) {
                    const contentType = response.headers.get("content-type");

                    if (
                        contentType &&
                        contentType.includes("application/json")
                    ) {
                        const result = await response.json();
                        const fileUrl =
                            result.storagePath || result.downloadUrl;

                        if (result.success && fileUrl) {
                            setGeneratedFileUrl(fileUrl);
                            setMessage(
                                `สร้างเอกสาร ${documentType} สำเร็จแล้ว!${
                                    result.project?.name
                                        ? ` โครงการ: ${result.project.name}`
                                        : ""
                                }`,
                            );
                            setIsError(false);
                            setIsSuccessModalOpen(true);
                            if (onSuccess) onSuccess(result);
                        } else if (fileUrl) {
                            const fullUrl = window.location.origin + fileUrl;
                            setGeneratedFileUrl(fullUrl);
                            setMessage(
                                `สร้างเอกสาร ${documentType} สำเร็จแล้ว!`,
                            );
                            setIsError(false);
                            setIsSuccessModalOpen(true);
                            if (onSuccess) onSuccess(result);
                        } else {
                            setMessage(
                                `ไม่สามารถสร้างเอกสาร ${documentType} ได้`,
                            );
                            setIsError(true);
                        }
                    } else {
                        // Handle blob response
                        const blob = await response.blob();
                        const url = URL.createObjectURL(blob);
                        setGeneratedFileUrl(url);
                        setMessage(`สร้างเอกสาร ${documentType} สำเร็จแล้ว!`);
                        setIsError(false);
                        setIsSuccessModalOpen(true);
                    }
                } else {
                    // Handle error response inline
                    const errorText = await response.text();
                    setMessage(
                        `เกิดข้อผิดพลาด: ${
                            errorText ||
                            `ไม่สามารถสร้างเอกสาร ${documentType} ได้`
                        }`,
                    );
                    setIsError(true);
                }
            } catch (error) {
                console.error("Error submitting form:", error);
                setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
                setIsError(true);
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            session,
            formData,
            apiEndpoint,
            documentType,
            projectId,
            prepareFormData,
            onSuccess,
            setIsSubmitting,
            setMessage,
            setIsError,
            setGeneratedFileUrl,
            setIsSuccessModalOpen,
        ],
    );

    return { handleSubmit };
}
