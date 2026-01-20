"use client";

import { useSearchParams } from "next/navigation";
import { useTitle } from "@/lib/hooks/useTitle";

import {
    PreviewField,
    PreviewGrid,
    DocumentEditorLayout,
} from "@/app/(document)/components";
import { LoadingSpinner } from "@/components/ui";
import {
    useDocumentForm,
    usePreviewModal,
    useDocumentValidation,
    useExitConfirmation,
} from "@/app/(document)/hooks";

import { type SummaryData, initialSummaryData } from "@/config/initialData";
import { validateSummary } from "@/lib/validation";
import {
    BasicInfoSection,
    PersonInfoSection,
    BudgetSection,
} from "@/app/(document)/components/forms/summary";

export function SummaryForm(): React.JSX.Element {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || "";

    useTitle("สร้างแบบสรุปโครงการ | ระบบจัดการเอกสาร");

    const { isPreviewOpen, openPreview, closePreview, confirmPreview } =
        usePreviewModal();

    const {
        formData,
        handleChange,
        handleSubmit,
        isSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        isDirty,
        isClient,
    } = useDocumentForm<SummaryData>({
        initialData: initialSummaryData,
        apiEndpoint: "/api/generate/summary",
        documentType: "Excel",
        projectId,
    });

    const { handleConfirmExit, allowNavigation } = useExitConfirmation({
        isDirty,
    });

    // Use validation hook
    const {
        errors,
        getHandlePreview: handlePreview,
        validateBeforeSubmit,
    } = useDocumentValidation<SummaryData>({
        validateForm: validateSummary,
        openPreview,
        formData,
    });

    // Wrap validateBeforeSubmit
    const onSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        validateBeforeSubmit(e, formData, handleSubmit);
    };

    if (!isClient) {
        return <LoadingSpinner />;
    }

    return (
        <DocumentEditorLayout
            title="สร้างแบบสรุปโครงการ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารแบบสรุปโครงการ"
            onSubmit={onSubmit}
            isSubmitting={isSubmitting}
            isDirty={isDirty}
            onConfirmExit={handleConfirmExit}
            onPreview={handlePreview}
            message={message}
            isError={isError}
            isPreviewOpen={isPreviewOpen}
            onClosePreview={closePreview}
            onConfirmPreview={confirmPreview}
            previewContent={
                <>
                    <PreviewGrid>
                        <PreviewField
                            label="ชื่อไฟล์"
                            value={formData.fileName}
                        />
                        <PreviewField
                            label="ชื่อโครงการ"
                            value={formData.projectName}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="เลขที่สัญญา"
                            value={formData.contractNumber}
                        />
                        <PreviewField
                            label="หน่วยงาน"
                            value={formData.organize}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="รหัสชุดโครงการ"
                            value={formData.projectCode}
                        />
                        <PreviewField
                            label="รหัสกิจกรรม"
                            value={formData.projectActivity}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="เลขที่ มสช"
                            value={formData.projectNhf}
                        />
                        <PreviewField
                            label="ชุดโครงการ"
                            value={formData.projectCo}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="จำนวนเดือน"
                            value={formData.month}
                        />
                        <PreviewField
                            label="ระยะเวลา"
                            value={formData.timeline}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="เจ้าของโครงการ"
                            value={formData.projectOwner}
                        />
                        <PreviewField
                            label="ผู้ตรวจสอบโครงการ"
                            value={formData.projectReview}
                        />
                    </PreviewGrid>

                    <PreviewField
                        label="ผู้ประสานงาน"
                        value={formData.coordinator}
                    />

                    <PreviewGrid>
                        <PreviewField label="งวด 1" value={formData.sec1} />
                        <PreviewField label="งวด 2" value={formData.sec2} />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField label="งวด 3" value={formData.sec3} />
                        <PreviewField label="รวม" value={formData.sum} />
                    </PreviewGrid>

                    <PreviewField label="แหล่งทุน" value={formData.funds} />
                </>
            }
            isSuccessOpen={isSuccessModalOpen}
            onCloseSuccess={() => setIsSuccessModalOpen(false)}
            fileName={formData.fileName}
            downloadUrl={generatedFileUrl}
            successDocumentType="เอกสาร Excel"
            onSuccessRedirect={allowNavigation}
        >
            <BasicInfoSection
                formData={formData}
                handleChange={handleChange}
                errors={errors}
            />

            <PersonInfoSection
                formData={formData}
                handleChange={handleChange}
                errors={errors}
            />

            <BudgetSection
                formData={formData}
                handleChange={handleChange}
                errors={errors}
            />
        </DocumentEditorLayout>
    );
}
