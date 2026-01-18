"use client";

import { type ChangeEvent, type FormEvent } from "react";
import { type Session } from "next-auth";
import { type ApprovalData } from "@/config/initialData";

// =====================================================
// Input Props
// =====================================================

export interface UseApprovalLogicProps {
    formData: ApprovalData;
    setFormData: React.Dispatch<React.SetStateAction<ApprovalData>>;
    session: Session | null;
    projectId: string;
    setMessage: (message: string | null) => void;
    setIsError: (isError: boolean) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    setIsSuccessModalOpen: (isOpen: boolean) => void;
}

// =====================================================
// Return Types
// =====================================================

export interface UseApprovalLogicReturn {
    signatureFile: File | null;
    signaturePreview: string | null;
    signatureCanvasData: string | null;
    attachmentFiles: File[];
    addAttachment: () => void;
    removeAttachment: (index: number) => void;
    updateAttachment: (index: number, value: string) => void;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSignatureCanvasChange: (signatureDataURL: string | null) => void;
    handleAttachmentFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachmentFile: (index: number) => void;
    handleApprovalSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>;
    getPreviewError: () => string | null;
}

export interface UseSignatureHandlersReturn {
    signatureFile: File | null;
    signaturePreview: string | null;
    signatureCanvasData: string | null;
    handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
    handleSignatureCanvasChange: (signatureDataURL: string | null) => void;
}

export interface UseAttachmentHandlersReturn {
    attachmentFiles: File[];
    addAttachment: () => void;
    removeAttachment: (index: number) => void;
    updateAttachment: (index: number, value: string) => void;
    handleAttachmentFilesChange: (e: ChangeEvent<HTMLInputElement>) => void;
    removeAttachmentFile: (index: number) => void;
}

export interface UseFileUploadProps {
    session: Session | null;
    projectId: string;
}

export interface UseFormSubmitProps extends UseApprovalLogicProps {
    signatureFile: File | null;
    signatureCanvasData: string | null;
    attachmentFiles: File[];
    uploadAttachmentFiles: (files: File[]) => Promise<string[]>;
}
