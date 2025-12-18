"use client";

import { useState } from "react";

import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hooks/useTitle";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
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
import { ClipboardList, FileText } from "lucide-react";
import {
    type FormProjectData,
    initialFormProjectData,
} from "@/config/initialData";

export default function CreateFormProjectPage() {
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
        apiEndpoint: "/api/fill-formproject-template",
        documentType: "Word",
    });

    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const { allowNavigation } = usePreventNavigation({
        isDirty,
        onNavigationAttempt: () => setIsExitModalOpen(true),
    });

    const handleConfirmExit = () => {
        allowNavigation();
        window.history.back();
    };

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
            <form onSubmit={handleSubmit} className="space-y-8">
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
                            label="ผู้รับผิดชอบ"
                            name="person"
                            placeholder="ระบุชื่อผู้รับผิดชอบโครงการ"
                            value={formData.person}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ที่อยู่ สถานที่ติดต่อ"
                            name="address"
                            placeholder="ระบุที่อยู่ติดต่อผู้รับผิดชอบ"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เบอร์โทรศัพท์"
                            name="tel"
                            type="tel"
                            placeholder="ระบุเบอร์โทรศัพท์ผู้รับผิดชอบ"
                            value={formData.tel}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="อีเมล"
                            name="email"
                            type="email"
                            placeholder="ระบุอีเมลผู้รับผิดชอบ example@mail.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ระยะเวลาดำเนินการ"
                            name="timeline"
                            placeholder="ตัวอย่าง 1 มกราคม 2566 - 31 ธันวาคม 2566"
                            value={formData.timeline}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="งบประมาณ"
                            name="cost"
                            placeholder="ตัวอย่าง 1000000 บาท (หนึ่งล้านบาทถ้วน)"
                            value={formData.cost}
                            onChange={handleChange}
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
                            rows={6}
                            className="h-40"
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
            />
        </PageLayout>
    );
}
