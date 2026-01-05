"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hooks/useTitle";
import { useExitConfirmation } from "@/hooks/useExitConfirmation";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
import { FormField } from "@/components/document-form/FormField";
import { ErrorAlert } from "@/components/document-form/ErrorAlert";
import { LoadingState } from "@/components/document-form/LoadingState";
import { useDocumentForm } from "@/components/document-form/useDocumentForm";
import { usePreviewModal } from "@/components/document-form/usePreviewModal";
import {
    PreviewField,
    PreviewGrid,
} from "@/components/document-form/PreviewField";
import { ClipboardList, User } from "lucide-react";
import { type ContractData, initialContractData } from "@/config/initialData";
import {
    validateAndFormatCitizenId,
    validateCitizenId,
} from "@/lib/validation";

export default function CreateContractPage() {
    // Use lazy initialization to get contractCode from localStorage
    const [contractCode] = useState<string>(() => {
        if (typeof window === "undefined") return "";
        const selectedTemplate = localStorage.getItem("selectedTorsTemplate");
        if (selectedTemplate) {
            try {
                const templateData = JSON.parse(selectedTemplate);
                return templateData.contractCode || "";
            } catch {
                return "";
            }
        }
        return "";
    });

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
        apiEndpoint: "/api/fill-contract-template",
        documentType: "Word",
        prepareFormData: (_data, formDataObj) => {
            // Override contractnumber with contractCode if available
            if (contractCode) {
                formDataObj.set("contractnumber", contractCode);
            }
        },
    });

    // Validation errors state
    const [errors, setErrors] = useState<{ citizenid?: string }>({});

    // Custom handler for citizen ID with validation
    const handleCitizenIdChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { value } = e.target;
        const { value: formatted, error } = validateAndFormatCitizenId(value);

        // Update form data with formatted value
        setFormData((prev) => ({ ...prev, citizenid: formatted }));

        // Update error state
        setErrors((prev) => ({ ...prev, citizenid: error }));
    };

    // Validate before submit
    const validateBeforeSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Validate citizen ID
        const citizenIdValidation = validateCitizenId(formData.citizenid);
        if (!citizenIdValidation.isValid) {
            setErrors((prev) => ({
                ...prev,
                citizenid: citizenIdValidation.error,
            }));
            return;
        }

        // If all validations pass, submit the form
        handleSubmit(e);
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
            <form onSubmit={validateBeforeSubmit} className="space-y-8">
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
                            required
                        />
                        <FormField
                            label="ชื่อโครงการ"
                            name="projectName"
                            placeholder="ระบุชื่อโครงการ"
                            value={formData.projectName}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="วันที่จัดทำสัญญา"
                            name="date"
                            placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2568"
                            value={formData.date}
                            onChange={handleChange}
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
                            required
                        />
                        <FormField
                            label="โดย"
                            name="owner"
                            placeholder="ระบุชื่อผู้อำนวยการ ผู้จัดการโครงการ"
                            value={formData.owner}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="รับดำเนินโครงการจาก"
                            name="projectCo"
                            placeholder="ระบุองค์กรให้ทุน"
                            value={formData.projectCo}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="รหัสโครงการ"
                            name="projectCode"
                            placeholder="ระบุรหัสโครงการ"
                            value={formData.projectCode}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ตามข้อตกลงเลขที่"
                            name="acceptNum"
                            placeholder="ระบุเลขที่ข้อตกลง"
                            value={formData.acceptNum}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ชื่อผู้รับจ้าง"
                            name="name"
                            placeholder="ระบุชื่อผู้รับจ้าง"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ที่อยู่"
                            name="address"
                            placeholder="ระบุที่อยู่ติดต่อผู้รับจ้าง"
                            value={formData.address}
                            onChange={handleChange}
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
                            required
                        />
                        <FormField
                            label="ชื่อพยาน"
                            name="witness"
                            placeholder="ระบุชื่อ-นามสกุล พยาน"
                            value={formData.witness}
                            onChange={handleChange}
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
                            required
                        />
                        <FormField
                            label="ระยะเวลา (เดือน)"
                            name="timelineMonth"
                            type="number"
                            placeholder="ระบุตัวเลข เช่น 12 (ใส่เฉพาะตัวเลข)"
                            value={formData.timelineMonth}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เริ่มตั้งแต่"
                            name="timelineText"
                            placeholder="ตัวอย่าง : 1 มกราคม 2568 ถึง 31 ธันวาคม 2568"
                            value={formData.timelineText}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="จำนวนงวด"
                            name="section"
                            type="number"
                            placeholder="ระบุเลขจำนวนงวด เช่น 3 (ใส่เฉพาะตัวเลข)"
                            value={formData.section}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </FormSection>

                <FormActions
                    onPreview={openPreview}
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
