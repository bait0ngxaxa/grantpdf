"use client";

import { useSearchParams } from "next/navigation";

import { CreateDocSuccessModal } from "@/components/ui";
import { useTitle } from "@/lib/hooks/useTitle";

import {
    PageLayout,
    FormSection,
    FormActions,
    PreviewModal,
    FormField,
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
import { ClipboardList, Users, Calculator } from "lucide-react";
import { type SummaryData, initialSummaryData } from "@/config/initialData";
import { validateSummary } from "@/lib/validation";

export function SummaryForm() {
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

    const {
        isExitModalOpen,
        setIsExitModalOpen,
        handleConfirmExit,
        allowNavigation,
    } = useExitConfirmation({ isDirty });

    // Use validation hook
    const {
        errors,
        handlePreview: onPreview,
        validateBeforeSubmit,
    } = useDocumentValidation<SummaryData>({
        validateForm: validateSummary,
        openPreview,
    });

    // Wrap handlePreview to pass formData
    const handlePreview = () => onPreview(formData);

    // Wrap validateBeforeSubmit
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        validateBeforeSubmit(e, formData, handleSubmit);
    };

    if (!isClient) {
        return <LoadingSpinner />;
    }

    return (
        <PageLayout
            title="สร้างแบบสรุปโครงการ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารแบบสรุปโครงการ"
            isDirty={isDirty}
            isExitModalOpen={isExitModalOpen}
            setIsExitModalOpen={setIsExitModalOpen}
            onConfirmExit={handleConfirmExit}
        >
            <form onSubmit={onSubmit} className="space-y-8">
                {/* ข้อมูลโครงการ */}
                <FormSection
                    title="ข้อมูลโครงการ"
                    icon={<ClipboardList className="w-5 h-5 text-slate-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            label="ชื่อไฟล์"
                            name="fileName"
                            placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                            value={formData.fileName}
                            onChange={handleChange}
                            error={errors.fileName}
                            required
                        />
                        <FormField
                            label="ชื่อโครงการ"
                            name="projectName"
                            placeholder="ระบุชื่อโครงการ"
                            value={formData.projectName}
                            onChange={handleChange}
                            error={errors.projectName}
                            required
                        />
                        <FormField
                            label="รหัสชุดโครงการ"
                            name="projectCode"
                            placeholder="ระบุรหัสชุดโครงการ"
                            value={formData.projectCode}
                            onChange={handleChange}
                            error={errors.projectCode}
                        />
                        <FormField
                            label="รหัสภายใต้กิจกรรม"
                            name="projectActivity"
                            placeholder="ระบุรหัสภายใต้กิจกรรม"
                            value={formData.projectActivity}
                            onChange={handleChange}
                            error={errors.projectActivity}
                        />
                        <FormField
                            label="เลขที่สัญญา"
                            name="contractNumber"
                            placeholder="ระบุเลขที่สัญญา"
                            value={formData.contractNumber}
                            onChange={handleChange}
                            error={errors.contractNumber}
                        />
                        <FormField
                            label="หน่วยงานที่เสนอโครงการ"
                            name="organize"
                            placeholder="ระบุหน่วยงานที่เสนอโครงการ"
                            value={formData.organize}
                            onChange={handleChange}
                            error={errors.organize}
                        />
                        <FormField
                            label="เลขที่ มสช น."
                            name="projectNhf"
                            placeholder="ระบุเลขที่ มสช น."
                            value={formData.projectNhf}
                            onChange={handleChange}
                            error={errors.projectNhf}
                        />
                        <FormField
                            label="ชุดโครงการ"
                            name="projectCo"
                            placeholder="ระบุชุดโครงการ"
                            value={formData.projectCo}
                            onChange={handleChange}
                            error={errors.projectCo}
                        />
                        <FormField
                            label="ระยะเวลาดำเนินการ (เดือน)"
                            name="month"
                            type="number"
                            placeholder="ระบุจำนวนเดือน"
                            value={formData.month}
                            onChange={handleChange}
                            error={errors.month}
                        />
                        <FormField
                            label="ระยะเวลา"
                            name="timeline"
                            placeholder="ระบุระยะเวลา เช่น 1มกราคม 2568 - 31กันยายน 2568"
                            value={formData.timeline}
                            onChange={handleChange}
                            error={errors.timeline}
                        />
                    </div>
                </FormSection>

                {/* ข้อมูลผู้เกี่ยวข้อง */}
                <FormSection
                    title="ข้อมูลผู้เกี่ยวข้อง"
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                    headerBorderColor="border-blue-300"
                    icon={<Users className="w-5 h-5 text-blue-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            label="ผู้เสนอโครงการ"
                            name="projectOwner"
                            placeholder="ระบุผู้เสนอโครงการ"
                            value={formData.projectOwner}
                            onChange={handleChange}
                            error={errors.projectOwner}
                        />
                        <FormField
                            label="ผู้ทบทวนโครงการ"
                            name="projectReview"
                            placeholder="ระบุผู้ทบทวนโครงการ"
                            value={formData.projectReview}
                            onChange={handleChange}
                            error={errors.projectReview}
                        />
                        <FormField
                            label="ผู้ประสานงาน"
                            name="coordinator"
                            placeholder="ระบุผู้ประสานงาน"
                            value={formData.coordinator}
                            onChange={handleChange}
                            error={errors.coordinator}
                        />
                    </div>
                </FormSection>

                {/* ข้อมูลงบประมาณ */}
                <FormSection
                    title="ข้อมูลงบประมาณ"
                    bgColor="bg-green-50"
                    borderColor="border-green-200"
                    headerBorderColor="border-green-300"
                    icon={<Calculator className="w-5 h-5 text-green-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            label="งวด 1"
                            name="sec1"
                            type="number"
                            placeholder="ระบุจำนวนเงินงวด 1 (ตัวเลข)"
                            value={formData.sec1}
                            onChange={handleChange}
                            error={errors.sec1}
                        />
                        <FormField
                            label="งวด 2"
                            name="sec2"
                            type="number"
                            placeholder="ระบุจำนวนเงินงวด 2 (ตัวเลข)"
                            value={formData.sec2}
                            onChange={handleChange}
                            error={errors.sec2}
                        />
                        <FormField
                            label="งวด 3"
                            name="sec3"
                            type="number"
                            placeholder="ระบุจำนวนเงินงวด 3 (ตัวเลข)"
                            value={formData.sec3}
                            onChange={handleChange}
                            error={errors.sec3}
                        />
                        <FormField
                            label="รวม"
                            name="sum"
                            type="number"
                            placeholder="ระบุจำนวนเงินรวม (ตัวเลข)"
                            value={formData.sum}
                            onChange={handleChange}
                            error={errors.sum}
                        />
                        <FormField
                            label="แหล่งทุน"
                            name="funds"
                            placeholder="ระบุแหล่งทุน"
                            value={formData.funds}
                            onChange={handleChange}
                            error={errors.funds}
                        />
                    </div>
                </FormSection>

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
                        label="เลขที่สัญญา"
                        value={formData.contractNumber}
                    />
                    <PreviewField label="หน่วยงาน" value={formData.organize} />
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
                    <PreviewField label="จำนวนเดือน" value={formData.month} />
                    <PreviewField label="ระยะเวลา" value={formData.timeline} />
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
            </PreviewModal>

            {/* Success Modal */}
            <CreateDocSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                fileName={formData.fileName}
                downloadUrl={generatedFileUrl}
                documentType="เอกสาร Excel"
                onRedirect={allowNavigation}
            />
        </PageLayout>
    );
}
