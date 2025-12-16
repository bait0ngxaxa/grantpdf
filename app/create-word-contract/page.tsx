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
import { ClipboardList, User } from "lucide-react";

interface WordDocumentData {
    fileName: string;
    projectName: string;
    contractnumber: string;
    projectOffer: string;
    projectCo: string;
    owner: string;
    acceptNum: string;
    projectCode: string;
    cost: string;
    timelineMonth: string;
    timelineText: string;
    section: string;
    date: string;
    name: string;
    address: string;
    citizenid: string;
    citizenexpire: string;
    witness: string;
}

export default function CreateContractPage() {
    const { data: session } = useSession();
    const [isClient, setIsClient] = useState(false);
    const [contractCode, setContractCode] = useState<string>("");

    useEffect(() => {
        setIsClient(true);
        // Load contract code from localStorage on component mount
        const selectedTemplate = localStorage.getItem("selectedTorsTemplate");
        if (selectedTemplate) {
            try {
                const templateData = JSON.parse(selectedTemplate);
                if (templateData.contractCode) {
                    setContractCode(templateData.contractCode);
                }
            } catch {
                // Ignore parsing errors
            }
        }
    }, []);

    const [formData, setFormData] = useState<WordDocumentData>({
        fileName: "",
        projectName: "",
        contractnumber: "",
        projectOffer: "",
        projectCo: "",
        owner: "",
        acceptNum: "",
        projectCode: "",
        cost: "",
        timelineMonth: "",
        timelineText: "",
        section: "",
        name: "",
        address: "",
        citizenid: "",
        citizenexpire: "",
        date: "",
        witness: "",
    });

    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useTitle("สร้างหนังสือสัญญาเพื่อรับรองการลงนาม | ระบบจัดการเอกสาร");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
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
                if (key !== "contractnumber") {
                    data.append(key, formData[key as keyof WordDocumentData]);
                }
            });

            if (contractCode) {
                data.append("contractnumber", contractCode);
            }

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

            if ((session as { accessToken?: string })?.accessToken) {
                data.append(
                    "token",
                    (session as { accessToken?: string }).accessToken!
                );
            }

            const response = await fetch("/api/fill-contract-template", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setGeneratedFileUrl(url);
                setMessage("สร้างเอกสาร Word สำเร็จแล้ว!");
                setIsError(false);
                setIsSuccessModalOpen(true);
            } else {
                const errorText = await response.text();
                setMessage(
                    `เกิดข้อผิดพลาด: ${
                        errorText || "ไม่สามารถสร้างเอกสาร Word ได้"
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
            title="สร้างหนังสือสัญญาเพื่อรับรองการลงนาม"
            subtitle={
                contractCode
                    ? `ประเภท: ${contractCode}`
                    : "กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารสัญญา"
            }
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
                                วันที่จัดทำสัญญา{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="date"
                                placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2568"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ระหว่าง <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="projectOffer"
                                placeholder="ระบุหน่วยงานที่ดำเนินการร่วมกัน เช่น สพบ. และ สสส."
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectOffer}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                โดย <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="owner"
                                placeholder="ระบุชื่อผู้อำนวยการ ผู้จัดการโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.owner}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                                รับดำเนินโครงการจาก{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="projectCo"
                                placeholder="ระบุองค์กรให้ทุน"
                                className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectCo}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                                รหัสโครงการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="projectCode"
                                placeholder="ระบุรหัสโครงการ"
                                className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectCode}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ตามข้อตกลงเลขที่{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="acceptNum"
                                placeholder="ระบุเลขที่ข้อตกลง"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.acceptNum}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อผู้รับจ้าง{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="ระบุชื่อผู้รับจ้าง"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ที่อยู่ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="address"
                                placeholder="ระบุที่อยู่ติดต่อผู้รับจ้าง"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                                บัตรประชาชนเลขที่{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                name="citizenid"
                                placeholder="ระบุเลขบัตรประชาชน 13 หลักผู้รับจ้าง"
                                className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.citizenid}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2  w-full">
                                วันหมดอายุบัตรประชาชน{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="citizenexpire"
                                placeholder="ระบุวันหมดอายุ ตัวอย่าง 31 ธันวาคม 2568"
                                className=" w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.citizenexpire}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อพยาน <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="witness"
                                placeholder="ระบุชื่อ-นามสกุล พยาน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.witness}
                                onChange={handleChange}
                                required
                            />
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                งบประมาณ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="cost"
                                placeholder="ตัวอย่าง : 500,000 บาท (ห้าแสนบาทถ้วน)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ระยะเวลา (เดือน){" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                name="timelineMonth"
                                placeholder="ระบุตัวเลข เช่น 12 (ใส่เฉพาะตัวเลข)"
                                className="w-full px-4 py-3  border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                value={formData.timelineMonth}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เริ่มตั้งแต่{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="timelineText"
                                placeholder="ตัวอย่าง : 1 มกราคม 2568 ถึง 31 ธันวาคม 2568"
                                className="w-full px-4 py-3  border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                value={formData.timelineText}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                จำนวนงวด <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="number"
                                name="section"
                                placeholder="ระบุเลขจำนวนงวด เช่น 3 (ใส่เฉพาะตัวเลข)"
                                className="w-full px-4 py-3  border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                                value={formData.section}
                                onChange={handleChange}
                                required
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
                        {contractCode && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    รหัสสัญญา:
                                </h4>
                                <p className="text-sm">{contractCode}</p>
                            </div>
                        )}
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วันที่:
                            </h4>
                            <p className="text-sm">{formData.date || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ระหว่าง:
                            </h4>
                            <p className="text-sm">
                                {formData.projectOffer || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                โดย:
                            </h4>
                            <p className="text-sm">{formData.owner || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                รับดำเนินโครงการจาก:
                            </h4>
                            <p className="text-sm">
                                {formData.projectCo || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                รหัสโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectCode || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ตามข้อตกลงเลขที่:
                            </h4>
                            <p className="text-sm">
                                {formData.acceptNum || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ชื่อผู้จ้าง:
                            </h4>
                            <p className="text-sm">{formData.name || "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ที่อยู่:
                            </h4>
                            <p className="text-sm">{formData.address || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เลขบัตรประชาชน:
                            </h4>
                            <p className="text-sm">
                                {formData.citizenid || "-"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            วันหมดอายุ:
                        </h4>
                        <p className="text-sm">
                            {formData.citizenexpire || "-"}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ชื่อพยาน:
                        </h4>
                        <p className="text-sm">{formData.witness || "-"}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            งบประมาณ:
                        </h4>
                        <p className="text-sm">{formData.cost || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ระยะเวลา (เดือน):
                        </h4>
                        <p className="text-sm">
                            {formData.timelineMonth || "-"}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            เริ่มตั้งแต่:
                        </h4>
                        <p className="text-sm">
                            {formData.timelineText || "-"}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            จำนวนงวด:
                        </h4>
                        <p className="text-sm">{formData.section || "-"}</p>
                    </div>
                </div>
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
