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
                            type="number"
                            placeholder="ระบุเลขบัตรประชาชน 13 หลักผู้รับจ้าง"
                            value={formData.citizenid}
                            onChange={handleChange}
                            required
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
            />
        </PageLayout>
    );
}
