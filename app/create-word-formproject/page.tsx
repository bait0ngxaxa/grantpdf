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
import { ClipboardList, FileText } from "lucide-react";

interface WordDocumentData {
    fileName: string;
    projectName: string;
    person: string;
    address: string;
    tel: string;
    email: string;
    timeline: string;
    cost: string;
    rationale: string;
    objective: string;
    goal: string;
    target: string;
    product: string;
    scope: string;
    result: string;
    author: string;
}

export default function CreateFormProjectPage() {
    const { data: session } = useSession();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [formData, setFormData] = useState<WordDocumentData>({
        projectName: "",
        fileName: "",
        person: "",
        address: "",
        tel: "",
        email: "",
        timeline: "",
        cost: "",
        rationale: "",
        objective: "",
        goal: "",
        target: "",
        product: "",
        scope: "",
        result: "",
        author: "",
    });

    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useTitle("สร้างหนังสือข้อเสนอโครงการ | ระบบจัดการเอกสาร");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        const prepareThaiText = (text: string): string => {
            if (!text || typeof text !== "string") return text;
            return text
                .replace(/\u00A0/g, " ")
                .replace(/[\u200B-\u200D]/g, "")
                .replace(/\s{2,}/g, " ")
                .trim();
        };

        const processedValue = prepareThaiText(value);

        setFormData((prevData) => ({
            ...prevData,
            [name]: processedValue,
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
                data.append(key, formData[key as keyof WordDocumentData]);
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

            if ((session as { accessToken?: string })?.accessToken) {
                data.append(
                    "token",
                    (session as { accessToken?: string }).accessToken!
                );
            }

            const response = await fetch("/api/fill-formproject-template", {
                method: "POST",
                body: data,
                headers: {
                    Accept: "application/json",
                },
            });

            if (response.ok) {
                const contentType = response.headers.get("content-type");

                if (contentType && contentType.includes("application/json")) {
                    const result = await response.json();
                    if (result.downloadUrl) {
                        const fullUrl =
                            window.location.origin + result.downloadUrl;
                        setGeneratedFileUrl(fullUrl);
                        setMessage("สร้างเอกสาร Word สำเร็จแล้ว!");
                        setIsError(false);
                        setIsSuccessModalOpen(true);
                    } else {
                        throw new Error("ไม่พบ download URL ใน response");
                    }
                } else {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setGeneratedFileUrl(url);
                    setMessage("สร้างเอกสาร Word สำเร็จแล้ว!");
                    setIsError(false);
                    setIsSuccessModalOpen(true);
                }
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
            title="สร้างหนังสือข้อเสนอโครงการ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสาร"
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
