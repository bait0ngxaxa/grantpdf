"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { type Session } from "next-auth";
import { type ApprovalData, approvalFixedValues } from "@/config/initialData";

interface UseApprovalLogicProps {
    formData: ApprovalData;
    setFormData: React.Dispatch<React.SetStateAction<ApprovalData>>;
    session: Session | null;
    projectId: string;
    setMessage: (message: string | null) => void;
    setIsError: (isError: boolean) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    setIsSuccessModalOpen: (isOpen: boolean) => void;
}

export function useApprovalLogic({
    formData,
    setFormData,
    session,
    projectId,
    setMessage,
    setIsError,
    setIsSubmitting,
    setIsSuccessModalOpen,
}: UseApprovalLogicProps) {
    // Signature states
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        null
    );
    const [signatureCanvasData, setSignatureCanvasData] = useState<
        string | null
    >(null);

    // Attachment file states (for upload)
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

    // Attachment string array handlers (for formData)
    const addAttachment = () => {
        setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ""],
        }));
    };

    const removeAttachment = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    const updateAttachment = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.map((item, i) =>
                i === index ? value : item
            ),
        }));
    };

    // Signature handlers
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSignatureFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSignaturePreview(null);
        }
    };

    const handleSignatureCanvasChange = (signatureDataURL: string | null) => {
        setSignatureCanvasData(signatureDataURL);
    };

    // Attachment file handlers
    const handleAttachmentFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachmentFiles(files);
    };

    const removeAttachmentFile = (index: number) => {
        setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    // Upload internal logic
    const uploadAttachmentFiles = async (files: File[]): Promise<string[]> => {
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
                    uploadFormData.append("userId", session.user.id.toString());
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
            } catch {
                // Silent fail for individual files
            }
        }

        return uploadedIds;
    };

    // Submit handler
    const handleApprovalSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!session) {
            setMessage("คุณต้องเข้าสู่ระบบก่อน");
            setIsError(true);
            return;
        }

        if (signatureFile && signatureCanvasData) {
            setMessage(
                "กรุณาเลือกเพียงวิธีการหนึ่งในการเพิ่มลายเซ็น (อัปโหลดไฟล์ หรือ วาดลายเซ็นเอง)"
            );
            setIsError(true);
            return;
        }

        if (!signatureFile && !signatureCanvasData) {
            setMessage(
                "กรุณาเพิ่มลายเซ็นโดยการอัปโหลดไฟล์ หรือ วาดลายเซ็นบนหน้าจอ"
            );
            setIsError(true);
            return;
        }

        setIsSubmitting(true);
        setMessage(null);
        setIsError(false);

        try {
            const data = new FormData();

            Object.keys(formData).forEach((key) => {
                if (key === "attachments") {
                    data.append(
                        "attachments",
                        JSON.stringify(formData.attachments)
                    );
                } else {
                    data.append(
                        key,
                        formData[key as keyof ApprovalData] as string
                    );
                }
            });

            Object.keys(approvalFixedValues).forEach((key) => {
                data.append(
                    key,
                    approvalFixedValues[key as keyof typeof approvalFixedValues]
                );
            });

            if (signatureFile) {
                data.append("signatureFile", signatureFile);
            }

            if (signatureCanvasData) {
                try {
                    if (!signatureCanvasData.startsWith("data:image/")) {
                        throw new Error("Invalid signature data format");
                    }

                    const parts = signatureCanvasData.split(",");
                    if (parts.length !== 2) {
                        throw new Error("Invalid base64 data structure");
                    }

                    const byteString = atob(parts[1]);
                    const mimeString = signatureCanvasData
                        .split(",")[0]
                        .split(":")[1]
                        .split(";")[0];

                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    const canvasSignatureFile = new File(
                        [ab],
                        "canvas-signature.png",
                        {
                            type: mimeString,
                        }
                    );

                    if (canvasSignatureFile.size === 0) {
                        throw new Error("Generated signature file is empty");
                    }

                    data.append("canvasSignatureFile", canvasSignatureFile);
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : "Unknown error";
                    setMessage(
                        `เกิดข้อผิดพลาดในการประมวลผลลายเซ็น: ${errorMessage}`
                    );
                    setIsError(true);
                    return;
                }
            }

            if (attachmentFiles.length > 0) {
                const uploadedAttachments = await uploadAttachmentFiles(
                    attachmentFiles
                );
                data.append(
                    "attachmentFileIds",
                    JSON.stringify(uploadedAttachments)
                );
            }

            if (session.user?.id) {
                data.append("userId", session.user.id.toString());
            }
            if (session.user?.email) {
                data.append("userEmail", session.user.email);
            }

            if (projectId) {
                data.append("projectId", projectId);
            }

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
                    }`
                );
                setIsError(true);
            }
        } catch {
            setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        signatureFile,
        signaturePreview,
        signatureCanvasData,
        attachmentFiles,
        addAttachment,
        removeAttachment,
        updateAttachment,
        handleFileChange,
        handleSignatureCanvasChange,
        handleAttachmentFilesChange,
        removeAttachmentFile,
        handleApprovalSubmit,
    };
}
