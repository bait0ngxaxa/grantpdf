"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
import { FormField } from "@/components/document-form/FormField";
import {
    PreviewField,
    PreviewGrid,
} from "@/components/document-form/PreviewField";
import { ClipboardList, Users, Calculator } from "lucide-react";

interface SummaryData {
    fileName: string;
    projectName: string;
    contractNumber: string;
    organize: string;
    projectOwner: string;
    projectReview: string;
    inspector: string;
    coordinator: string;
    projectCode: string;
    projectActivity: string;
    projectNhf: string;
    projectCo: string;
    month: string;
    timeline: string;
    sec1: string;
    sec2: string;
    sec3: string;
    sum: string;
    funds: string;
}

export default function CreateWordSummaryPage() {
    const { data: session } = useSession();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [formData, setFormData] = useState<SummaryData>({
        fileName: "",
        projectName: "",
        contractNumber: "",
        organize: "",
        projectOwner: "",
        projectReview: "",
        inspector: "",
        coordinator: "",
        projectCode: "",
        projectActivity: "",
        projectNhf: "",
        projectCo: "",
        month: "",
        timeline: "",
        sec1: "",
        sec2: "",
        sec3: "",
        sum: "",
        funds: "",
    });

    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useTitle("สร้างแบบสรุปโครงการ | ระบบจัดการเอกสาร");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!session) {
            setMessage("คุณต้องเข้าสู่ระบบก่อน");
            setIsError(true);
            return;
        }

        setIsSubmitting(true);
        setMessage(null);
        setGeneratedFileUrl(null);
        setIsError(false);

        try {
            const data = new FormData();
            Object.keys(formData).forEach((key) => {
                data.append(key, formData[key as keyof SummaryData]);
            });

            if (session.user?.id) {
                data.append("userId", session.user.id.toString());
            }
            if (session.user?.email) {
                data.append("userEmail", session.user.email);
            }

            const selectedProjectId = localStorage.getItem("selectedProjectId");
            if (selectedProjectId) {
                data.append("projectId", selectedProjectId);
            }

            const response = await fetch("/api/fill-excel-summary-template", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.downloadUrl) {
                    setGeneratedFileUrl(result.downloadUrl);
                    setMessage("สร้างเอกสาร Excel สำเร็จแล้ว!");
                    setIsError(false);
                    setIsSuccessModalOpen(true);
                }
            } else {
                const errorText = await response.text();
                setMessage(
                    `เกิดข้อผิดพลาด: ${
                        errorText || "ไม่สามารถสร้างเอกสาร Excel ได้"
                    }`
                );
                setIsError(true);
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isDirty = Object.values(formData).some((value) => value !== "");

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    return (
        <PageLayout
            title="สร้างแบบสรุปโครงการ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารแบบสรุปโครงการ"
            isDirty={isDirty}
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
                            label="รหัสชุดโครงการ"
                            name="projectCode"
                            placeholder="ระบุรหัสชุดโครงการ"
                            value={formData.projectCode}
                            onChange={handleChange}
                        />
                        <FormField
                            label="รหัสภายใต้กิจกรรม"
                            name="projectActivity"
                            placeholder="ระบุรหัสภายใต้กิจกรรม"
                            value={formData.projectActivity}
                            onChange={handleChange}
                        />
                        <FormField
                            label="เลขที่สัญญา"
                            name="contractNumber"
                            placeholder="ระบุเลขที่สัญญา"
                            value={formData.contractNumber}
                            onChange={handleChange}
                        />
                        <FormField
                            label="หน่วยงานที่เสนอโครงการ"
                            name="organize"
                            placeholder="ระบุหน่วยงานที่เสนอโครงการ"
                            value={formData.organize}
                            onChange={handleChange}
                        />
                        <FormField
                            label="เลขที่ มสช น."
                            name="projectNhf"
                            placeholder="ระบุเลขที่ มสช น."
                            value={formData.projectNhf}
                            onChange={handleChange}
                        />
                        <FormField
                            label="ชุดโครงการ"
                            name="projectCo"
                            placeholder="ระบุชุดโครงการ"
                            value={formData.projectCo}
                            onChange={handleChange}
                        />
                        <FormField
                            label="ระยะเวลาดำเนินการ (เดือน)"
                            name="month"
                            type="number"
                            placeholder="ระบุจำนวนเดือน"
                            value={formData.month}
                            onChange={handleChange}
                        />
                        <FormField
                            label="ระยะเวลา"
                            name="timeline"
                            placeholder="ระบุระยะเวลา เช่น 1มกราคม 2568 - 31กันยายน 2568"
                            value={formData.timeline}
                            onChange={handleChange}
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
                        />
                        <FormField
                            label="ผู้ทบทวนโครงการ"
                            name="projectReview"
                            placeholder="ระบุผู้ทบทวนโครงการ"
                            value={formData.projectReview}
                            onChange={handleChange}
                        />
                        <FormField
                            label="ผู้ประสานงาน"
                            name="coordinator"
                            placeholder="ระบุผู้ประสานงาน"
                            value={formData.coordinator}
                            onChange={handleChange}
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
                        />
                        <FormField
                            label="งวด 2"
                            name="sec2"
                            type="number"
                            placeholder="ระบุจำนวนเงินงวด 2 (ตัวเลข)"
                            value={formData.sec2}
                            onChange={handleChange}
                        />
                        <FormField
                            label="งวด 3"
                            name="sec3"
                            type="number"
                            placeholder="ระบุจำนวนเงินงวด 3 (ตัวเลข)"
                            value={formData.sec3}
                            onChange={handleChange}
                        />
                        <FormField
                            label="รวม"
                            name="sum"
                            type="number"
                            placeholder="ระบุจำนวนเงินรวม (ตัวเลข)"
                            value={formData.sum}
                            onChange={handleChange}
                        />
                        <FormField
                            label="แหล่งทุน"
                            name="funds"
                            placeholder="ระบุแหล่งทุน"
                            value={formData.funds}
                            onChange={handleChange}
                        />
                    </div>
                </FormSection>

                <FormActions
                    onPreview={() => setIsPreviewOpen(true)}
                    isSubmitting={isSubmitting}
                />
            </form>

            {/* Error Message */}
            {message && isError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
                    <div className="flex items-center">
                        <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{message}</span>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                onConfirm={() => {
                    setIsPreviewOpen(false);
                    const form = document.querySelector("form");
                    if (form) form.requestSubmit();
                }}
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
            />
        </PageLayout>
    );
}
