"use client";

import { type FormEvent } from "react";
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

import {
    type FormProjectData,
    initialFormProjectData,
} from "@/config/initialData";
import { validateFormProject } from "@/lib/validation";
import {
    BasicInfoSection,
    ProjectDetailSection,
} from "@/app/(document)/components/forms/project";

export function FormProjectForm(): React.JSX.Element {
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
        getHandlePreview: handlePreview,
        createPhoneChangeHandler,
        validateBeforeSubmit,
    } = useDocumentValidation<FormProjectData>({
        validateForm: validateFormProject,
        openPreview,
        formData,
        phoneFields: ["tel"],
        emailFields: ["email"],
    });

    // Create phone change handler
    const handlePhoneChange = createPhoneChangeHandler(
        "tel",
        handleChange,
        () => {},
    );

    // Wrap validateBeforeSubmit
    const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
        validateBeforeSubmit(e, formData, handleSubmit);
    };

    const { handleConfirmExit, allowNavigation } = useExitConfirmation({
        isDirty,
    });

    if (!isClient) {
        return <LoadingSpinner />;
    }

    return (
        <DocumentEditorLayout
            title="สร้างหนังสือข้อเสนอโครงการ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสาร"
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
                            label="ผู้รับผิดชอบ"
                            value={formData.person}
                        />
                        <PreviewField
                            label="ที่อยู่"
                            value={formData.address}
                        />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="เบอร์โทรศัพท์"
                            value={formData.tel}
                        />
                        <PreviewField label="อีเมล" value={formData.email} />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="ระยะเวลา"
                            value={formData.timeline}
                        />
                        <PreviewField label="งบประมาณ" value={formData.cost} />
                    </PreviewGrid>

                    <PreviewGrid>
                        <PreviewField
                            label="ความเป็นมาและแนวคิด"
                            value={formData.rationale}
                        />
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
                </>
            }
            isSuccessOpen={isSuccessModalOpen}
            onCloseSuccess={() => setIsSuccessModalOpen(false)}
            fileName={formData.fileName}
            downloadUrl={generatedFileUrl}
            successDocumentType="เอกสาร Word"
            onSuccessRedirect={allowNavigation}
        >
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
        </DocumentEditorLayout>
    );
}
