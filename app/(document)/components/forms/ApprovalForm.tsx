"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTitle } from "@/lib/hooks/useTitle";
import {
    useDocumentForm,
    usePreviewModal,
    useDocumentValidation,
    useExitConfirmation,
    useApprovalLogic,
} from "@/app/(document)/hooks";
import {
    PreviewField,
    PreviewGrid,
    PreviewList,
    DocumentEditorLayout,
} from "@/app/(document)/components";
import { LoadingSpinner } from "@/components/ui";
import { FileText } from "lucide-react";
import { type ApprovalData, initialApprovalData } from "@/config/initialData";
import { validateApproval } from "@/lib/validation";
import {
    BasicInfoSection,
    DocumentDetailSection,
    AttachmentSection,
    ApproverInfoSection,
    SignatureSection,
    type SignatureCanvasRef,
} from "@/app/(document)/components/forms/approval";

export function ApprovalForm(): React.JSX.Element {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || "";
    const signatureCanvasRef = useRef<SignatureCanvasRef>(null);

    useTitle("สร้างหนังสือขอนุมัติ | ระบบจัดการเอกสาร");

    const { isPreviewOpen, openPreview, closePreview, confirmPreview } =
        usePreviewModal();

    const {
        formData,
        setFormData,
        handleChange,
        isSubmitting,
        setIsSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        isClient,
        setMessage,
        setIsError,
    } = useDocumentForm<ApprovalData>({
        initialData: initialApprovalData,
        apiEndpoint: "/api/generate/approval",
        documentType: "Word",
    });

    const {
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
    } = useApprovalLogic({
        formData,
        setFormData,
        session,
        projectId,
        setMessage,
        setIsError,
        setIsSubmitting,
        setIsSuccessModalOpen,
    });

    // Use validation hook
    const {
        errors,
        getHandlePreview: handlePreview,
        createPhoneChangeHandler,
        validateBeforeSubmit,
    } = useDocumentValidation<ApprovalData>({
        validateForm: validateApproval,
        openPreview,
        formData,
        phoneFields: ["tel"],
        emailFields: ["email"],
    });

    // Create phone change handler
    const handlePhoneChange = createPhoneChangeHandler(
        "tel",
        handleChange,
        setFormData,
    );

    const isDirty =
        Object.values(formData).some((value) => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== "";
        }) ||
        attachmentFiles.length > 0 ||
        !!signatureFile ||
        !!signatureCanvasData;

    const { handleConfirmExit, allowNavigation } = useExitConfirmation({
        isDirty,
    });

    if (!isClient) {
        return <LoadingSpinner />;
    }

    return (
        <DocumentEditorLayout
            title="สร้างหนังสือขออนุมัติของมูลนิธิ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารขออนุมัติ"
            onSubmit={(e) =>
                validateBeforeSubmit(e, formData, handleApprovalSubmit)
            }
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            onConfirmExit={handleConfirmExit}
            onPreview={handlePreview}
            message={message}
            isError={isError}
            isPreviewOpen={isPreviewOpen}
            onClosePreview={closePreview}
            onConfirmPreview={confirmPreview}
            previewErrorMessage={getPreviewError() || undefined}
            previewContent={
                <>
                    <PreviewGrid>
                        <PreviewField
                            label="ชื่อไฟล์"
                            value={formData.projectName}
                        />
                        <PreviewField
                            label="เลขที่หนังสือ"
                            value={formData.head}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField label="วันที่" value={formData.date} />
                        <PreviewField
                            label="เรื่อง"
                            value={formData.topicdetail}
                        />
                    </PreviewGrid>

                    <PreviewField label="ผู้รับ" value={formData.todetail} />

                    <PreviewList
                        label="สิ่งที่ส่งมาด้วย"
                        items={formData.attachments}
                        emptyMessage="ไม่มีสิ่งที่ส่งมาด้วย"
                    />

                    <PreviewField label="เนื้อหา">
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.detail || "-"}
                        </p>
                    </PreviewField>

                    <PreviewGrid>
                        <PreviewField
                            label="ชื่อผู้ลงนาม"
                            value={formData.name}
                        />
                        <PreviewField
                            label="ตำแหน่ง/แผนก"
                            value={formData.depart}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="ผู้ประสานงาน"
                            value={formData.coor}
                        />
                        <PreviewField
                            label="เบอร์โทรศัพท์"
                            value={formData.tel}
                        />
                    </PreviewGrid>

                    <PreviewField label="อีเมล" value={formData.email} />

                    {(signaturePreview || signatureCanvasData) && (
                        <PreviewField label="ลายเซ็น">
                            {signaturePreview && (
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                                        จากการอัปโหลดไฟล์:
                                    </p>
                                    <Image
                                        src={signaturePreview}
                                        alt="Signature Preview"
                                        width={320}
                                        height={200}
                                        className="max-w-xs h-auto object-contain mt-2 border dark:border-slate-600 rounded"
                                    />
                                </div>
                            )}
                            {signatureCanvasData && (
                                <div className={signaturePreview ? "mt-4" : ""}>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                                        จากการวาดออนไลน์:
                                    </p>
                                    <Image
                                        src={signatureCanvasData}
                                        alt="Canvas Signature Preview"
                                        width={320}
                                        height={200}
                                        className="max-w-xs h-auto object-contain mt-2 border dark:border-slate-600 rounded"
                                    />
                                </div>
                            )}
                        </PreviewField>
                    )}

                    {formData.attachments.length > 0 &&
                        attachmentFiles.length > 0 && (
                            <PreviewField
                                label={`ไฟล์แนบ (${attachmentFiles.length} ไฟล์)`}
                            >
                                <div className="mt-2 space-y-1">
                                    {attachmentFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center space-x-2 text-sm"
                                        >
                                            <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                            <span>{file.name}</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                (
                                                {(
                                                    file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB)
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </PreviewField>
                        )}
                </>
            }
            isSuccessOpen={isSuccessModalOpen}
            onCloseSuccess={() => setIsSuccessModalOpen(false)}
            fileName={
                formData.fileName || formData.projectName || "หนังสือขออนุมัติ"
            }
            downloadUrl={generatedFileUrl}
            successDocumentType="เอกสาร Word"
            onSuccessRedirect={allowNavigation}
        >
            <BasicInfoSection
                formData={formData}
                handleChange={handleChange}
                errors={errors}
            />

            <DocumentDetailSection
                formData={formData}
                handleChange={handleChange}
                errors={errors}
            />

            <AttachmentSection
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                attachmentFiles={attachmentFiles}
                handleAttachmentFilesChange={handleAttachmentFilesChange}
                removeAttachmentFile={removeAttachmentFile}
                addAttachment={addAttachment}
                removeAttachment={removeAttachment}
                updateAttachment={updateAttachment}
            />

            <ApproverInfoSection
                formData={formData}
                handleChange={handleChange}
                handlePhoneChange={handlePhoneChange}
                errors={errors}
            />

            {/* ลายเซ็น */}
            <SignatureSection
                signaturePreview={signaturePreview}
                signatureCanvasData={signatureCanvasData}
                onFileChange={handleFileChange}
                onCanvasChange={handleSignatureCanvasChange}
                signatureCanvasRef={signatureCanvasRef}
                uploadTitle="อัปโหลดลายเซ็นผู้ขออนุมัติ"
                canvasTitle="วาดลายเซ็นผู้ขออนุมัติ"
            />
        </DocumentEditorLayout>
    );
}
