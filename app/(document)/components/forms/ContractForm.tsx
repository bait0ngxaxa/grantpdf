"use client";

import { type FormEvent } from "react";
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
import { type ContractData, initialContractData } from "@/config/initialData";
import { validateContract } from "@/lib/validation";
import {
    ProjectDetailsSection,
    ContractorInfoSection,
    BudgetSection,
} from "@/app/(document)/components/forms/contract";

export function ContractForm(): React.JSX.Element {
    const searchParams = useSearchParams();
    const contractCode = searchParams.get("contractCode") || "";
    const projectId = searchParams.get("projectId") || "";

    useTitle("สร้างหนังสือสัญญาเพื่อรับรองการลงนาม | ระบบจัดการเอกสาร");

    const { isPreviewOpen, openPreview, closePreview, confirmPreview } =
        usePreviewModal();

    const {
        formData,
        setFormData,
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
    } = useDocumentForm<ContractData>({
        initialData: initialContractData,
        apiEndpoint: "/api/generate/contract",
        documentType: "Word",
        projectId,
        prepareFormData: (_data, formDataObj) => {
            // Override contractnumber with contractCode if available
            if (contractCode) {
                formDataObj.set("contractnumber", contractCode);
            }
        },
    });

    // Use validation hook
    const {
        errors,
        handlePreview: onPreview,
        createCitizenIdChangeHandler,
        validateBeforeSubmit,
    } = useDocumentValidation<ContractData>({
        validateForm: validateContract,
        openPreview,
        citizenIdFields: ["citizenid"],
    });

    // Wrap handlePreview to pass formData
    const handlePreview = (): void => onPreview(formData);

    // Create citizen ID change handler
    const handleCitizenIdChange = createCitizenIdChangeHandler(
        "citizenid",
        setFormData
    );

    // Wrap validateBeforeSubmit
    const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
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
            title="สร้างหนังสือสัญญาเพื่อรับรองการลงนาม"
            subtitle={
                contractCode
                    ? `ประเภท: ${contractCode}`
                    : "กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารสัญญา"
            }
            isDirty={isDirty}
            isExitModalOpen={isExitModalOpen}
            setIsExitModalOpen={setIsExitModalOpen}
            onConfirmExit={handleConfirmExit}
        >
            <form onSubmit={onSubmit} className="space-y-8">
                <ProjectDetailsSection
                    formData={formData}
                    handleChange={handleChange}
                    errors={errors}
                    contractCode={contractCode}
                />

                <ContractorInfoSection
                    formData={formData}
                    handleChange={handleChange}
                    handleCitizenIdChange={handleCitizenIdChange}
                    errors={errors}
                />

                <BudgetSection
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

                {contractCode && (
                    <PreviewField label="รหัสสัญญา" value={contractCode} />
                )}

                <PreviewGrid>
                    <PreviewField label="วันที่" value={formData.date} />
                    <PreviewField
                        label="ระหว่าง"
                        value={formData.projectOffer}
                    />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField label="โดย" value={formData.owner} />
                    <PreviewField
                        label="รับดำเนินโครงการจาก"
                        value={formData.projectCo}
                    />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="รหัสโครงการ"
                        value={formData.projectCode}
                    />
                    <PreviewField
                        label="ตามข้อตกลงเลขที่"
                        value={formData.acceptNum}
                    />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="ชื่อผู้รับจ้าง"
                        value={formData.name}
                    />
                    <PreviewField label="ที่อยู่" value={formData.address} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="เลขบัตรประชาชน"
                        value={formData.citizenid}
                    />
                    <PreviewField
                        label="วันหมดอายุ"
                        value={formData.citizenexpire}
                    />
                </PreviewGrid>

                <PreviewField label="ชื่อพยาน" value={formData.witness} />

                <PreviewGrid>
                    <PreviewField label="งบประมาณ" value={formData.cost} />
                    <PreviewField
                        label="ระยะเวลา (เดือน)"
                        value={formData.timelineMonth}
                    />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="เริ่มตั้งแต่"
                        value={formData.timelineText}
                    />
                    <PreviewField label="จำนวนงวด" value={formData.section} />
                </PreviewGrid>
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
