"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
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

        // ฟังก์ชันเตรียม text ก่อนส่งไปยัง backend
        const prepareThaiText = (text: string): string => {
            if (!text || typeof text !== "string") return text;

            // ปรับปรุงการจัดการ Thai text input
            return text
                .replace(/\u00A0/g, " ") // Non-breaking space → normal space
                .replace(/[\u200B-\u200D]/g, "") // ลบ zero-width characters
                .replace(/\s{2,}/g, " ") // Multiple spaces → single space
                .trim();
        };

        const processedValue = prepareThaiText(value);

        setFormData((prevData) => ({
            ...prevData,
            [name]: processedValue,
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

    if (!isClient) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500">กำลังโหลด...</p>
                </div>
            </div>
        );
    }

    const isDirty = Object.values(formData).some((value) => value !== "");

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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อไฟล์ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="fileName"
                                placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผู้รับผิดชอบ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="person"
                                placeholder="ระบุชื่อผู้รับผิดชอบโครงการ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.person}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ที่อยู่ สถานที่ติดต่อ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="address"
                                placeholder="ระบุที่อยู่ติดต่อผู้รับผิดชอบ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เบอร์โทรศัพท์{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="tel"
                                name="tel"
                                placeholder="ระบุเบอร์โทรศัพท์ผู้รับผิดชอบ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.tel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                อีเมล <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="ระบุอีเมลผู้รับผิดชอบ example@mail.com"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ระยะเวลาดำเนินการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="timeline"
                                placeholder="ตัวอย่าง 1 มกราคม 2566 - 31 ธันวาคม 2566"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.timeline}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                งบประมาณ <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="cost"
                                placeholder="ตัวอย่าง 1000000 บาท (หนึ่งล้านบาทถ้วน)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                            />
                        </div>
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ความเป็นมาและแนวคิดการจัดโครงการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="rationale"
                                placeholder="ระบุเหตุผลความจำเป็นในการดำเนินโครงการ"
                                className="w-full px-4 py-3 h-96 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.rationale}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เป้าประสงค์{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="goal"
                                placeholder="ระบุเป้าประสงค์โครงการ"
                                className="w-full px-4 py-3 h-30 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.goal}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                วัตถุประสงค์{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="objective"
                                placeholder="ระบุวัตถุประสงค์โครงการ"
                                className="w-full px-4 py-3 h-30 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.objective}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เป้าหมายโครงการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="target"
                                placeholder="ระบุเป้าหมายโครงการ"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.target}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                กรอบการดำเนินงาน{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="scope"
                                placeholder="ระบุกรอบการดำเนินงาน"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.scope}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผลผลิต <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="product"
                                placeholder="ระบุผลผลิตโครงการ"
                                className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.product}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผลลัพธ์ <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="result"
                                placeholder="ระบุผลลัพธ์โครงการ"
                                className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.result}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ประวัติผู้ช่วยวิทยากรกระบวนการถอดบทเรียน
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="author"
                                placeholder="กรอกประวัติส่วนตัว"
                                className="w-full px-4 h-40 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.author}
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
                                {formData.projectName || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ชื่อผู้รับผิดชอบ:
                            </h4>
                            <p className="text-sm">{formData.person || "-"}</p>
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
                                เบอร์โทรศัพท์:
                            </h4>
                            <p className="text-sm">{formData.tel || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            อีเมล:
                        </h4>
                        <p className="text-sm">{formData.email || "-"}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ระยะเวลา:
                        </h4>
                        <p className="text-sm">{formData.timeline || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ค่าใช้จ่าย:
                        </h4>
                        <p className="text-sm">{formData.cost || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ความเป็นมาและแนวคิด:
                        </h4>
                        <p className="text-sm">{formData.rationale || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            เป้าประสงค์:
                        </h4>
                        <p className="text-sm">{formData.goal || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            วัตถุประสงค์:
                        </h4>
                        <p className="text-sm">{formData.objective || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            เป้าหมายโครงการ:
                        </h4>
                        <p className="text-sm">{formData.target || "-"}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            กรอบการดำเนินงาน:
                        </h4>
                        <p className="text-sm">{formData.scope || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ผลผลิต:
                        </h4>
                        <p className="text-sm">{formData.product || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ผลลัพธ์:
                        </h4>
                        <p className="text-sm">{formData.result || "-"}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ระยะเวลาดำเนินการ
                        </h4>
                        <p className="text-sm">{formData.timeline || "-"}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ประวัติผู้ช่วยวิทยากรกระบวรการถอดบทเรียน:
                        </h4>
                        <p className="text-sm">{formData.author || "-"}</p>
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
