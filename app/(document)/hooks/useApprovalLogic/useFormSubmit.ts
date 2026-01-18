"use client";

import { useCallback, type FormEvent } from "react";
import { type ApprovalData, approvalFixedValues } from "@/config/initialData";
import { type UseFormSubmitProps } from "./types";
import {
    dataURLtoFile,
    validateAttachments,
    validateSignature,
} from "./helpers";

export function useFormSubmit({
    formData,
    session,
    projectId,
    setMessage,
    setIsError,
    setIsSubmitting,
    setIsSuccessModalOpen,
    signatureFile,
    signatureCanvasData,
    attachmentFiles,
    uploadAttachmentFiles,
}: UseFormSubmitProps) {
    const handleApprovalSubmit = useCallback(
        async (e: FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            // Validate session
            if (!session) {
                setMessage("คุณต้องเข้าสู่ระบบก่อน");
                setIsError(true);
                return;
            }

            // Validate signature
            const signatureError = validateSignature(
                signatureFile,
                signatureCanvasData,
            );
            if (signatureError) {
                setMessage(signatureError);
                setIsError(true);
                return;
            }

            // Validate attachments
            const attachmentError = validateAttachments(
                formData.attachments,
                attachmentFiles,
            );
            if (attachmentError) {
                setMessage(attachmentError);
                setIsError(true);
                return;
            }

            setIsSubmitting(true);
            setMessage(null);
            setIsError(false);

            try {
                const data = new FormData();

                // Append form data
                Object.keys(formData).forEach((key) => {
                    if (key === "attachments") {
                        data.append(
                            "attachments",
                            JSON.stringify(formData.attachments),
                        );
                    } else {
                        data.append(
                            key,
                            formData[key as keyof ApprovalData] as string,
                        );
                    }
                });

                // Append fixed values
                Object.keys(approvalFixedValues).forEach((key) => {
                    data.append(
                        key,
                        approvalFixedValues[
                            key as keyof typeof approvalFixedValues
                        ],
                    );
                });

                // Handle signature file
                if (signatureFile) {
                    data.append("signatureFile", signatureFile);
                }

                // Handle canvas signature
                if (signatureCanvasData) {
                    const canvasSignatureFile = dataURLtoFile(
                        signatureCanvasData,
                        "canvas-signature.png",
                    );

                    if (!canvasSignatureFile) {
                        setMessage("เกิดข้อผิดพลาดในการประมวลผลลายเซ็น");
                        setIsError(true);
                        setIsSubmitting(false);
                        return;
                    }

                    data.append("canvasSignatureFile", canvasSignatureFile);
                }

                // Upload attachment files
                if (attachmentFiles.length > 0) {
                    const uploadedAttachments =
                        await uploadAttachmentFiles(attachmentFiles);
                    data.append(
                        "attachmentFileIds",
                        JSON.stringify(uploadedAttachments),
                    );
                }

                // Append user info
                if (session.user?.id) {
                    data.append("userId", session.user.id.toString());
                }
                if (session.user?.email) {
                    data.append("userEmail", session.user.email);
                }

                // Append project ID
                if (projectId) {
                    data.append("projectId", projectId);
                }

                // Submit to API
                const response = await fetch("/api/generate/approval", {
                    method: "POST",
                    body: data,
                });

                if (response.ok) {
                    const result = await response.json();
                    if (
                        result.success &&
                        (result.storagePath || result.downloadUrl)
                    ) {
                        setIsSuccessModalOpen(true);
                    } else {
                        setMessage("ไม่สามารถสร้างเอกสาร Word ได้");
                        setIsError(true);
                    }
                } else {
                    const errorText = await response.text();
                    setMessage(
                        `เกิดข้อผิดพลาด: ${
                            errorText || "ไม่สามารถสร้างเอกสาร Word ได้"
                        }`,
                    );
                    setIsError(true);
                }
            } catch {
                setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
                setIsError(true);
            } finally {
                setIsSubmitting(false);
            }
        },
        [
            formData,
            session,
            projectId,
            signatureFile,
            signatureCanvasData,
            attachmentFiles,
            uploadAttachmentFiles,
            setMessage,
            setIsError,
            setIsSubmitting,
            setIsSuccessModalOpen,
        ],
    );

    return { handleApprovalSubmit };
}
