"use client";

import {
    type UseApprovalLogicProps,
    type UseApprovalLogicReturn,
} from "./types";
import { useSignatureHandlers } from "./useSignatureHandlers";
import { useAttachmentHandlers } from "./useAttachmentHandlers";
import { useFileUpload } from "./useFileUpload";
import { useFormSubmit } from "./useFormSubmit";
import { usePreviewValidation } from "./usePreviewValidation";

export type { UseApprovalLogicProps, UseApprovalLogicReturn } from "./types";

export function useApprovalLogic(
    props: UseApprovalLogicProps,
): UseApprovalLogicReturn {
    const { formData, setFormData, session, projectId } = props;

    // Signature handling
    const {
        signatureFile,
        signaturePreview,
        signatureCanvasData,
        handleFileChange,
        handleSignatureCanvasChange,
    } = useSignatureHandlers();

    // Attachment handling
    const {
        attachmentFiles,
        addAttachment,
        removeAttachment,
        updateAttachment,
        handleAttachmentFilesChange,
        removeAttachmentFile,
    } = useAttachmentHandlers({ setFormData });

    // File upload
    const { uploadAttachmentFiles } = useFileUpload({ session, projectId });

    // Form submission
    const { handleApprovalSubmit } = useFormSubmit({
        ...props,
        signatureFile,
        signatureCanvasData,
        attachmentFiles,
        uploadAttachmentFiles,
    });

    // Preview validation
    const { getPreviewError } = usePreviewValidation({
        formData,
        attachmentFiles,
        signatureFile,
        signatureCanvasData,
    });

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
        getPreviewError,
    };
}
