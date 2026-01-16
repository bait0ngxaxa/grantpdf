"use client";

import { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CreateDocSuccessModal } from "@/components/ui";
import { useTitle } from "@/lib/hooks/useTitle";

import {
    PageLayout,
    FormActions,
    PreviewModal,
    ErrorAlert,
    PreviewField,
    PreviewGrid,
} from "@/app/(document)/components";
import { LoadingSpinner } from "@/components/ui";
import {
    useDocumentForm,
    usePreviewModal,
    useDocumentValidation,
    useExitConfirmation,
} from "@/app/(document)/hooks";

import {
    type FormProjectData,
    initialFormProjectData,
} from "@/config/initialData";
import { validateFormProject } from "@/lib/validation";
import {
    BasicInfoSection,
    ProjectDetailSection,
} from "@/app/(document)/components/forms/project";

export function FormProjectForm() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId") || "";

    useTitle("สร้างหนังสือข้อเสนอโครงการ | ระบบจัดการเอกสาร");

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
    } = useDocumentForm<FormProjectData>({
        initialData: initialFormProjectData,
        apiEndpoint: "/api/generate/formproject",
        documentType: "Word",
        projectId,
    });

    // Use validation hook
    const {
        errors,
        handlePreview: onPreview,
        createPhoneChangeHandler,
        validateBeforeSubmit,
    } = useDocumentValidation<FormProjectData>({
        validateForm: validateFormProject,
        openPreview,
        phoneFields: ["tel"],
        emailFields: ["email"],
    });

    // Wrap handlePreview to pass formData
    const handlePreview = () => onPreview(formData);

    // Create phone change handler
    const handlePhoneChange = createPhoneChangeHandler(
        "tel",
        handleChange,
        () => {}
    );

    // Wrap validateBeforeSubmit
    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        validateBeforeSubmit(e, formData, handleSubmit);
    };

    const {
        isExitModalOpen,
        setIsExitModalOpen,
        handleConfirmExit,
        allowNavigation,
    } = useExitConfirmation({ isDirty });

    if (!isClient) {
        return <LoadingSpinner />;
    }

    return (
        <PageLayout
            title="สร้างหนังสือข้อเสนอโครงการ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสาร"
            isDirty={isDirty}
            isExitModalOpen={isExitModalOpen}
            setIsExitModalOpen={setIsExitModalOpen}
            onConfirmExit={handleConfirmExit}
        >
            <form onSubmit={onSubmit} className="space-y-8">
                <BasicInfoSection
                    formData={formData}
                    handleChange={handleChange}
                    handlePhoneChange={handlePhoneChange}
                    errors={errors}
                />

                <ProjectDetailSection
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                />

                <FormActions
                    onPreview={handlePreview}
                    isSubmitting={isSubmitting}
                />
            </form>

            <ErrorAlert message={message} isError={isError} />

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={closePreview}
                onConfirm={confirmPreview}
            >
                <PreviewGrid>
                    <PreviewField label="ชื่อไฟล์" value={formData.fileName} />
                    <PreviewField
                        label="ชื่อโครงการ"
                        value={formData.projectName}
                    />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="ผู้รับผิดชอบ"
                        value={formData.person}
                    />
                    <PreviewField label="ที่อยู่" value={formData.address} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField label="เบอร์โทรศัพท์" value={formData.tel} />
                    <PreviewField label="อีเมล" value={formData.email} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField label="ระยะเวลา" value={formData.timeline} />
                    <PreviewField label="งบประมาณ" value={formData.cost} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="ความเป็นมาและแนวคิด"
                        value={formData.rationale}
                    ></PreviewField>
                </PreviewGrid>

                <PreviewField label="เป้าประสงค์">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.goal || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="วัตถุประสงค์">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.objective || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="เป้าหมายโครงการ">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.target || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="กรอบการดำเนินงาน">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.scope || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="ผลผลิต">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.product || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="ผลลัพธ์">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.result || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="ประวัติผู้ช่วยวิทยากร">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.author || "-"}
                    </p>
                </PreviewField>
            </PreviewModal>

            {/* Success Modal */}
            <CreateDocSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                fileName={formData.fileName}
                downloadUrl={generatedFileUrl}
                documentType="เอกสาร Word"
                onRedirect={allowNavigation}
            />
        </PageLayout>
    );
}
