"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
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

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const openPreviewModal = () => {
        setIsPreviewOpen(true);
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อไฟล์ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="fileName"
                                placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.fileName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อโครงการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="projectName"
                                placeholder="ระบุชื่อโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                รหัสชุดโครงการ
                            </label>
                            <Input
                                type="text"
                                name="projectCode"
                                placeholder="ระบุรหัสชุดโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectCode}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                รหัสภายใต้กิจกรรม
                            </label>
                            <Input
                                type="text"
                                name="projectActivity"
                                placeholder="ระบุรหัสภายใต้กิจกรรม"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectActivity}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เลขที่สัญญา
                            </label>
                            <Input
                                type="text"
                                name="contractNumber"
                                placeholder="ระบุเลขที่สัญญา"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.contractNumber}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                หน่วยงานที่เสนอโครงการ
                            </label>
                            <Input
                                type="text"
                                name="organize"
                                placeholder="ระบุหน่วยงานที่เสนอโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.organize}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เลขที่ มสช น.
                            </label>
                            <Input
                                type="text"
                                name="projectNhf"
                                placeholder="ระบุเลขที่ มสช น."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectNhf}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชุดโครงการ
                            </label>
                            <Input
                                type="text"
                                name="projectCo"
                                placeholder="ระบุชุดโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectCo}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ระยะเวลาดำเนินการ (เดือน)
                            </label>
                            <Input
                                type="number"
                                name="month"
                                placeholder="ระบุจำนวนเดือน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.month}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ระยะเวลา
                            </label>
                            <Input
                                type="text"
                                name="timeline"
                                placeholder="ระบุระยะเวลา เช่น 1มกราคม 2568 - 31กันยายน 2568"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.timeline}
                                onChange={handleChange}
                            />
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผู้เสนอโครงการ
                            </label>
                            <Input
                                type="text"
                                name="projectOwner"
                                placeholder="ระบุผู้เสนอโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectOwner}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผู้ทบทวนโครงการ
                            </label>
                            <Input
                                type="text"
                                name="projectReview"
                                placeholder="ระบุผู้ทบทวนโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectReview}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผู้ประสานงาน
                            </label>
                            <Input
                                type="text"
                                name="coordinator"
                                placeholder="ระบุผู้ประสานงาน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.coordinator}
                                onChange={handleChange}
                            />
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                งวด 1
                            </label>
                            <Input
                                type="number"
                                name="sec1"
                                placeholder="ระบุจำนวนเงินงวด 1 (ตัวเลข)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.sec1}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                งวด 2
                            </label>
                            <Input
                                type="number"
                                name="sec2"
                                placeholder="ระบุจำนวนเงินงวด 2 (ตัวเลข)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.sec2}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                งวด 3
                            </label>
                            <Input
                                type="number"
                                name="sec3"
                                placeholder="ระบุจำนวนเงินงวด 3 (ตัวเลข)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.sec3}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                รวม
                            </label>
                            <Input
                                type="number"
                                name="sum"
                                placeholder="ระบุจำนวนเงินรวม (ตัวเลข)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.sum}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                แหล่งทุน
                            </label>
                            <Input
                                type="text"
                                name="funds"
                                placeholder="ระบุแหล่งทุน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.funds}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </FormSection>

                <FormActions
                    onPreview={openPreviewModal}
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
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ชื่อไฟล์:
                            </h4>
                            <p className="text-sm">
                                {formData.fileName || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ชื่อโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectName || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เลขที่สัญญา:
                            </h4>
                            <p className="text-sm">
                                {formData.contractNumber || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                หน่วยงาน:
                            </h4>
                            <p className="text-sm">
                                {formData.organize || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                รหัสชุดโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectCode || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                รหัสกิจกรรม:
                            </h4>
                            <p className="text-sm">
                                {formData.projectActivity || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เลขที่ มสช:
                            </h4>
                            <p className="text-sm">
                                {formData.projectNhf || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ชุดโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectCo || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                จำนวนเดือน:
                            </h4>
                            <p className="text-sm">{formData.month || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ระยะเวลา:
                            </h4>
                            <p className="text-sm">
                                {formData.timeline || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เจ้าของโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectOwner || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ผู้ตรวจสอบโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectReview || "-"}
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ผู้ประสานงาน:
                            </h4>
                            <p className="text-sm">
                                {formData.coordinator || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                งวด 1:
                            </h4>
                            <p className="text-sm">{formData.sec1 || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                งวด 2:
                            </h4>
                            <p className="text-sm">{formData.sec2 || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                งวด 3:
                            </h4>
                            <p className="text-sm">{formData.sec3 || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                รวม:
                            </h4>
                            <p className="text-sm">{formData.sum || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                แหล่งทุน:
                            </h4>
                            <p className="text-sm">{formData.funds || "-"}</p>
                        </div>
                    </div>
                </div>
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
