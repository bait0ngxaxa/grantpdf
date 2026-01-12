"use client";

import { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/lib/hooks/useTitle";
import { useExitConfirmation } from "@/app/(document)/hooks/useExitConfirmation";
import { PageLayout } from "@/app/(document)/components/document-form/PageLayout";
import { FormSection } from "@/app/(document)/components/document-form/FormSection";
import { FormActions } from "@/app/(document)/components/document-form/FormActions";
import { PreviewModal } from "@/app/(document)/components/document-form/PreviewModal";
import { FormField } from "@/app/(document)/components/document-form/FormField";
import { ErrorAlert } from "@/app/(document)/components/document-form/ErrorAlert";
import { LoadingState } from "@/app/(document)/components/document-form/LoadingState";
import { useDocumentForm } from "@/app/(document)/hooks/useDocumentForm";
import { usePreviewModal } from "@/app/(document)/hooks/usePreviewModal";
import {
    PreviewField,
    PreviewGrid,
} from "@/app/(document)/components/document-form/PreviewField";
import { ClipboardList, User } from "lucide-react";
import { type ContractData, initialContractData } from "@/config/initialData";
import { validateContract } from "@/lib/validation";
import { useDocumentValidation } from "@/app/(document)/hooks/useDocumentValidation";

export function ContractForm() {
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
    const handlePreview = () => onPreview(formData);

    // Create citizen ID change handler
    const handleCitizenIdChange = createCitizenIdChangeHandler(
        "citizenid",
        setFormData
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
        return <LoadingState />;
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
                            label="วันที่จัดทำสัญญา"
                            name="date"
                            placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2568"
                            value={formData.date}
                            onChange={handleChange}
                            error={errors.date}
                            required
                        />

                        {contractCode && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    รหัสสัญญา
                                </label>
                                <div className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-100 text-slate-600">
                                    {contractCode}
                                </div>
                                <p className="text-sm text-slate-500 mt-1">
                                    รหัสนี้จะใช้เป็นเลขที่สัญญาโดยอัตโนมัติ
                                </p>
                            </div>
                        )}

                        <FormField
                            label="ระหว่าง"
                            name="projectOffer"
                            placeholder="ระบุหน่วยงานที่ดำเนินการร่วมกัน เช่น สพบ. และ สสส."
                            value={formData.projectOffer}
                            onChange={handleChange}
                            error={errors.projectOffer}
                            required
                        />
                        <FormField
                            label="โดย"
                            name="owner"
                            placeholder="ระบุชื่อผู้อำนวยการ ผู้จัดการโครงการ"
                            value={formData.owner}
                            onChange={handleChange}
                            error={errors.owner}
                            required
                        />
                        <FormField
                            label="รับดำเนินโครงการจาก"
                            name="projectCo"
                            placeholder="ระบุองค์กรให้ทุน"
                            value={formData.projectCo}
                            onChange={handleChange}
                            error={errors.projectCo}
                            required
                        />
                        <FormField
                            label="รหัสโครงการ"
                            name="projectCode"
                            placeholder="ระบุรหัสโครงการ"
                            value={formData.projectCode}
                            onChange={handleChange}
                            error={errors.projectCode}
                            required
                        />
                        <FormField
                            label="ตามข้อตกลงเลขที่"
                            name="acceptNum"
                            placeholder="ระบุเลขที่ข้อตกลง"
                            value={formData.acceptNum}
                            onChange={handleChange}
                            error={errors.acceptNum}
                            required
                        />
                        <FormField
                            label="ชื่อผู้รับจ้าง"
                            name="name"
                            placeholder="ระบุชื่อผู้รับจ้าง"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            required
                        />
                        <FormField
                            label="ที่อยู่"
                            name="address"
                            placeholder="ระบุที่อยู่ติดต่อผู้รับจ้าง"
                            value={formData.address}
                            onChange={handleChange}
                            error={errors.address}
                            required
                        />
                        <FormField
                            label="บัตรประชาชนเลขที่"
                            name="citizenid"
                            type="tel"
                            placeholder="ระบุเลขบัตรประชาชน 13 หลักผู้รับจ้าง"
                            value={formData.citizenid}
                            onChange={handleCitizenIdChange}
                            required
                            maxLength={13}
                            error={errors.citizenid}
                        />
                        <FormField
                            label="วันหมดอายุบัตรประชาชน"
                            name="citizenexpire"
                            placeholder="ระบุวันหมดอายุ ตัวอย่าง 31 ธันวาคม 2568"
                            value={formData.citizenexpire}
                            onChange={handleChange}
                            error={errors.citizenexpire}
                            required
                        />
                        <FormField
                            label="ชื่อพยาน"
                            name="witness"
                            placeholder="ระบุชื่อ-นามสกุล พยาน"
                            value={formData.witness}
                            onChange={handleChange}
                            error={errors.witness}
                            required
                        />
                    </div>
                </FormSection>

                {/* ข้อมูลงบประมาณ */}
                <FormSection
                    title="ข้อมูลงบประมาณ ระยะเวลา จำนวนงวด"
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                    headerBorderColor="border-blue-300"
                    icon={<User className="w-5 h-5 text-blue-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            label="งบประมาณ"
                            name="cost"
                            placeholder="ตัวอย่าง : 500,000 บาท (ห้าแสนบาทถ้วน)"
                            value={formData.cost}
                            onChange={handleChange}
                            error={errors.cost}
                            required
                        />
                        <FormField
                            label="ระยะเวลา (เดือน)"
                            name="timelineMonth"
                            type="number"
                            placeholder="ระบุตัวเลข เช่น 12 (ใส่เฉพาะตัวเลข)"
                            value={formData.timelineMonth}
                            onChange={handleChange}
                            error={errors.timelineMonth}
                            required
                        />
                        <FormField
                            label="เริ่มตั้งแต่"
                            name="timelineText"
                            placeholder="ตัวอย่าง : 1 มกราคม 2568 ถึง 31 ธันวาคม 2568"
                            value={formData.timelineText}
                            onChange={handleChange}
                            error={errors.timelineText}
                            required
                        />
                        <FormField
                            label="จำนวนงวด"
                            name="section"
                            type="number"
                            placeholder="ระบุเลขจำนวนงวด เช่น 3 (ใส่เฉพาะตัวเลข)"
                            value={formData.section}
                            onChange={handleChange}
                            error={errors.section}
                            required
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
