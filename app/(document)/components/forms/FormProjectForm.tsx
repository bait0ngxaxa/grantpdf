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
import { ClipboardList, FileText } from "lucide-react";
import {
    type FormProjectData,
    initialFormProjectData,
} from "@/config/initialData";
import { validateFormProject } from "@/lib/validation";
import { useDocumentValidation } from "@/app/(document)/hooks/useDocumentValidation";

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
        return <LoadingState />;
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
                            label="ผู้รับผิดชอบ"
                            name="person"
                            placeholder="ระบุชื่อผู้รับผิดชอบโครงการ"
                            value={formData.person}
                            onChange={handleChange}
                            error={errors.person}
                            required
                        />
                        <FormField
                            label="ที่อยู่ สถานที่ติดต่อ"
                            name="address"
                            placeholder="ระบุที่อยู่ติดต่อผู้รับผิดชอบ"
                            value={formData.address}
                            onChange={handleChange}
                            error={errors.address}
                            required
                        />
                        <FormField
                            label="เบอร์โทรศัพท์"
                            name="tel"
                            type="tel"
                            placeholder="ระบุเบอร์โทรศัพท์ผู้รับผิดชอบ"
                            value={formData.tel}
                            onChange={handlePhoneChange}
                            required
                            maxLength={10}
                            error={errors.tel}
                        />
                        <FormField
                            label="อีเมล"
                            name="email"
                            type="email"
                            placeholder="ระบุอีเมลผู้รับผิดชอบ example@mail.com"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            required
                        />
                        <FormField
                            label="ระยะเวลาดำเนินการ"
                            name="timeline"
                            placeholder="ตัวอย่าง 1 มกราคม 2566 - 31 ธันวาคม 2566"
                            value={formData.timeline}
                            onChange={handleChange}
                            error={errors.timeline}
                            required
                        />
                        <FormField
                            label="งบประมาณ"
                            name="cost"
                            placeholder="ตัวอย่าง 1000000 บาท (หนึ่งล้านบาทถ้วน)"
                            value={formData.cost}
                            onChange={handleChange}
                            error={errors.cost}
                            required
                        />
                    </div>
                </FormSection>

                {/* รายละเอียดโครงการ */}
                <FormSection
                    title="รายละเอียดโครงการ"
                    bgColor="bg-green-50"
                    borderColor="border-green-200"
                    headerBorderColor="border-green-300"
                    icon={<FileText className="w-5 h-5 text-green-600" />}
                >
                    <div className="space-y-6">
                        <FormField
                            label="ความเป็นมาและแนวคิดการจัดโครงการ"
                            name="rationale"
                            type="textarea"
                            placeholder="ระบุเหตุผลความจำเป็นในการดำเนินโครงการ"
                            value={formData.rationale}
                            onChange={handleChange}
                            error={errors.rationale}
                            rows={12}
                            className="h-96"
                        />
                        <FormField
                            label="เป้าประสงค์"
                            name="goal"
                            type="textarea"
                            placeholder="ระบุเป้าประสงค์โครงการ"
                            value={formData.goal}
                            onChange={handleChange}
                            error={errors.goal}
                            rows={4}
                            className="h-30"
                        />
                        <FormField
                            label="วัตถุประสงค์"
                            name="objective"
                            type="textarea"
                            placeholder="ระบุวัตถุประสงค์โครงการ"
                            value={formData.objective}
                            onChange={handleChange}
                            error={errors.objective}
                            rows={4}
                            className="h-30"
                        />
                        <FormField
                            label="เป้าหมายโครงการ"
                            name="target"
                            type="textarea"
                            placeholder="ระบุเป้าหมายโครงการ"
                            value={formData.target}
                            onChange={handleChange}
                            error={errors.target}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="กรอบการดำเนินงาน"
                            name="scope"
                            type="textarea"
                            placeholder="ระบุกรอบการดำเนินงาน"
                            value={formData.scope}
                            onChange={handleChange}
                            error={errors.scope}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="ผลผลิต"
                            name="product"
                            type="textarea"
                            placeholder="ระบุผลผลิตโครงการ"
                            value={formData.product}
                            onChange={handleChange}
                            error={errors.product}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="ผลลัพธ์"
                            name="result"
                            type="textarea"
                            placeholder="ระบุผลลัพธ์โครงการ"
                            value={formData.result}
                            onChange={handleChange}
                            error={errors.result}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="ประวัติผู้ช่วยวิทยากรกระบวนการถอดบทเรียน"
                            name="author"
                            type="textarea"
                            placeholder="กรอกประวัติส่วนตัว"
                            value={formData.author}
                            onChange={handleChange}
                            error={errors.author}
                            rows={6}
                            className="h-40"
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

                <PreviewField label="ความเป็นมาและแนวคิด">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.rationale || "-"}
                    </p>
                </PreviewField>

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
