"use client";

import { useState, FormEvent, ChangeEvent, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
import {
    ClipboardList,
    FileText,
    Folder,
    UserPen,
    Image as ImageIcon,
    PenTool,
    Upload,
} from "lucide-react";

// Dynamic import สำหรับ SignatureCanvas
const SignatureCanvasComponent = dynamic(
    () => import("@/components/ui/SignatureCanvas"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <p className="text-gray-500">กำลังโหลดพื้นที่วาดลายเซ็น...</p>
            </div>
        ),
    }
);

import type { SignatureCanvasRef } from "@/components/ui/SignatureCanvas";

interface WordDocumentData {
    head: string;
    fileName: string;
    projectName: string;
    date: string;
    topicdetail: string;
    todetail: string;
    attachments: string[];
    detail: string;
    name: string;
    depart: string;
    coor: string;
    tel: string;
    email: string;
    accept: string;
}

export default function CreateWordDocPage() {
    const { data: session } = useSession();

    const signatureCanvasRef = useRef<SignatureCanvasRef>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [formData, setFormData] = useState<WordDocumentData>({
        head: "",
        fileName: "",
        projectName: "",
        date: "",
        topicdetail: "",
        todetail: "",
        attachments: [],
        detail: "",
        name: "",
        depart: "",
        coor: "",
        tel: "",
        email: "",
        accept: "",
    });

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        null
    );
    const [signatureCanvasData, setSignatureCanvasData] = useState<
        string | null
    >(null);
    const [attachmentFiles, setAttachmentFiles] = useState<File[]>([]);
    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const fixedValues = {
        topic: "รายงานผลการปฏิบัติงาน",
        to: "ผู้จัดการฝ่ายบริหาร",
        attachment: "เอกสารแนบตามที่ระบุ",
        regard: "ขอแสดงความนับถืออย่างสูง",
    };
    useTitle("สร้างหนังสือขอนุมัติ | ระบบจัดการเอกสาร");

    const addAttachment = () => {
        setFormData((prev) => ({
            ...prev,
            attachments: [...prev.attachments, ""],
        }));
    };

    const removeAttachment = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index),
        }));
    };

    const updateAttachment = (index: number, value: string) => {
        setFormData((prev) => ({
            ...prev,
            attachments: prev.attachments.map((item, i) =>
                i === index ? value : item
            ),
        }));
    };

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setSignatureFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignaturePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setSignaturePreview(null);
        }
    };

    const handleSignatureCanvasChange = (signatureDataURL: string | null) => {
        setSignatureCanvasData(signatureDataURL);
    };

    const handleAttachmentFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setAttachmentFiles(files);
    };

    const removeAttachmentFile = (index: number) => {
        setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const uploadAttachmentFiles = async (files: File[]): Promise<string[]> => {
        const uploadedIds: string[] = [];

        // Get project ID from localStorage
        const selectedProjectId = localStorage.getItem("selectedProjectId");
        if (!selectedProjectId) {
            throw new Error("กรุณาเลือกโครงการก่อนอัปโหลดไฟล์");
        }

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("projectId", selectedProjectId); // Add required projectId

                if (session?.user?.id) {
                    formData.append("userId", session.user.id.toString());
                }
                if (session?.user?.email) {
                    formData.append("userEmail", session.user.email);
                }
                if ((session as { accessToken?: string })?.accessToken) {
                    formData.append(
                        "token",
                        (session as { accessToken?: string }).accessToken!
                    );
                }

                const response = await fetch("/api/file-upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.file && result.file.id) {
                        uploadedIds.push(result.file.id);
                    }
                }
            } catch (_error) {}
        }

        return uploadedIds;
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

        // ตรวจสอบว่ามีลายเซ็นทั้งสองแบบพร้อมกันหรือไม่
        if (signatureFile && signatureCanvasData) {
            setMessage(
                "กรุณาเลือกเพียงวิธีการหนึ่งในการเพิ่มลายเซ็น (อัปโหลดไฟล์ หรือ วาดลายเซ็นเอง)"
            );
            setIsError(true);
            return;
        }

        // ตรวจสอบว่ามีลายเซ็นอย่างน้อยหนึ่งอย่าง
        if (!signatureFile && !signatureCanvasData) {
            setMessage(
                "กรุณาเพิ่มลายเซ็นโดยการอัปโหลดไฟล์ หรือ วาดลายเซ็นบนหน้าจอ"
            );
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
                if (key === "attachments") {
                    data.append(
                        "attachments",
                        JSON.stringify(formData.attachments)
                    );
                } else {
                    data.append(
                        key,
                        formData[key as keyof WordDocumentData] as string
                    );
                }
            });

            Object.keys(fixedValues).forEach((key) => {
                data.append(key, fixedValues[key as keyof typeof fixedValues]);
            });

            if (signatureFile) {
                data.append("signatureFile", signatureFile);
            }

            if (signatureCanvasData) {
                try {
                    if (!signatureCanvasData.startsWith("data:image/")) {
                        throw new Error("Invalid signature data format");
                    }

                    const parts = signatureCanvasData.split(",");
                    if (parts.length !== 2) {
                        throw new Error("Invalid base64 data structure");
                    }

                    const byteString = atob(parts[1]);
                    const mimeString = signatureCanvasData
                        .split(",")[0]
                        .split(":")[1]
                        .split(";")[0];

                    const ab = new ArrayBuffer(byteString.length);
                    const ia = new Uint8Array(ab);
                    for (let i = 0; i < byteString.length; i++) {
                        ia[i] = byteString.charCodeAt(i);
                    }

                    const canvasSignatureFile = new File(
                        [ab],
                        "canvas-signature.png",
                        {
                            type: mimeString,
                        }
                    );

                    if (canvasSignatureFile.size === 0) {
                        throw new Error("Generated signature file is empty");
                    }

                    data.append("canvasSignatureFile", canvasSignatureFile);
                } catch (error: unknown) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : "Unknown error";
                    setMessage(
                        `เกิดข้อผิดพลาดในการประมวลผลลายเซ็น: ${errorMessage}`
                    );
                    setIsError(true);
                    setIsSubmitting(false);
                    return;
                }
            }

            if (attachmentFiles.length > 0) {
                const uploadedAttachments = await uploadAttachmentFiles(
                    attachmentFiles
                );
                data.append(
                    "attachmentFileIds",
                    JSON.stringify(uploadedAttachments)
                );
            }

            if (session.user?.id) {
                data.append("userId", session.user.id.toString());
            }
            if (session.user?.email) {
                data.append("userEmail", session.user.email);
            }
            if ((session as { accessToken?: string })?.accessToken) {
                data.append(
                    "token",
                    (session as { accessToken?: string }).accessToken!
                );
            }

            const selectedProjectId = localStorage.getItem("selectedProjectId");
            if (selectedProjectId) {
                data.append("projectId", selectedProjectId);
            }

            const response = await fetch("/api/fill-approval-template", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.downloadUrl) {
                    setGeneratedFileUrl(result.downloadUrl);
                    setMessage(
                        `สร้างเอกสาร Word สำเร็จแล้ว! โครงการ: ${
                            result.project?.name || "ไม่ระบุ"
                        }`
                    );
                    setIsError(false);
                    setIsSuccessModalOpen(true);
                } else {
                    setMessage("ไม่สามารถสร้างเอกสาร Word ได้");
                    setIsError(true);
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
        } catch (_error) {
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

    const isDirty =
        Object.values(formData).some((value) => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== "";
        }) ||
        attachmentFiles.length > 0 ||
        !!signatureFile ||
        !!signatureCanvasData;

    return (
        <PageLayout
            title="สร้างหนังสือขออนุมัติของมูลนิธิ"
            subtitle="กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารขออนุมัติ"
            isDirty={isDirty}
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ข้อมูลพื้นฐาน */}
                <FormSection
                    title="ข้อมูลพื้นฐาน"
                    icon={<ClipboardList className="w-5 h-5 text-slate-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อเอกสาร{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="projectName"
                                placeholder="ระบุชื่อเอกสาร"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เลขที่หนังสือ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="head"
                                placeholder="ระบุเลขที่หนังสือ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.head}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                วันที่สร้างหนังสือ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="date"
                                placeholder="ระบุวัน เดือน ปีเช่น 14 สิงหาคม 2568"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </FormSection>

                {/* รายละเอียดหนังสือ */}
                <FormSection
                    title="รายละเอียดหนังสือ"
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                    headerBorderColor="border-blue-300"
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เรื่อง <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="topicdetail"
                                placeholder="หัวข้อหนังสือ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.topicdetail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เรียน <span className="text-red-500">*</span>
                            </label>
                            <Input
                                name="todetail"
                                placeholder="ระบุผู้รับ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.todetail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </FormSection>

                {/* สิ่งที่ส่งมาด้วย - เปลี่ยนเป็นระบบเพิ่ม/ลด */}
                <FormSection
                    title="สิ่งที่ส่งมาด้วยและเนื้อหา"
                    bgColor="bg-green-50"
                    borderColor="border-green-200"
                    headerBorderColor="border-green-300"
                    icon={<Folder className="w-5 h-5 text-green-600" />}
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                สิ่งที่ส่งมาด้วย
                            </label>
                            {/* แสดงรายการ attachments */}
                            {formData.attachments.map((attachment, index) => (
                                <div key={index} className="flex gap-2 mb-3">
                                    <Input
                                        type="text"
                                        placeholder={`รายละเอียดสิ่งที่ส่งมาด้วย ${
                                            index + 1
                                        }`}
                                        className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={attachment}
                                        onChange={(e) =>
                                            updateAttachment(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeAttachment(index)}
                                        className="px-3 py-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                    >
                                        ลบ
                                    </Button>
                                </div>
                            ))}

                            {/* ปุ่มเพิ่ม attachment */}
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAttachment}
                                className="w-full py-2 border-dashed border-2 border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                            >
                                + เพิ่มสิ่งที่ส่งมาด้วย
                            </Button>

                            {/* แสดงข้อความช่วยเหลือ */}
                            {formData.attachments.length === 0 && (
                                <p className="text-sm text-slate-500 mt-2">
                                    คลิกปุ่ม &quot;เพิ่มสิ่งที่ส่งมาด้วย&quot;
                                    เพื่อเพิ่มรายการ (ถ้ามี)
                                </p>
                            )}

                            {/* อัปโหลดไฟล์แนบ - แสดงเฉพาะเมื่อมีสิ่งที่ส่งมาด้วย */}
                            {formData.attachments.length > 0 && (
                                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                    <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                                        <Upload className="w-5 h-5 mr-2 text-orange-600" />
                                        อัปโหลดไฟล์แนบ
                                    </h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                เลือกไฟล์แนบ
                                                (สามารถเลือกหลายไฟล์)
                                            </label>
                                            <Input
                                                type="file"
                                                multiple
                                                className={`border border-slate-300 rounded-lg 
                                                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                                                  transition-colors file:mr-4 file:py-2 file:px-4 
                                                                  file:rounded-md file:border-0 file:text-sm 
                                                                  file:font-medium file:bg-orange-50 file:text-orange-700 
                                                                  hover:file:bg-orange-100`}
                                                onChange={
                                                    handleAttachmentFilesChange
                                                }
                                                accept=".pdf,.doc,.docx"
                                            />
                                            <p className="text-xs text-slate-500 mt-1">
                                                รองรับไฟล์: PDF, Word
                                            </p>
                                        </div>

                                        {/* แสดงรายการไฟล์ที่เลือก */}
                                        {attachmentFiles.length > 0 && (
                                            <div className="mt-4">
                                                <h5 className="text-sm font-medium text-slate-700 mb-2">
                                                    ไฟล์ที่เลือก (
                                                    {attachmentFiles.length}{" "}
                                                    ไฟล์):
                                                </h5>
                                                <div className="space-y-2">
                                                    {attachmentFiles.map(
                                                        (file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <FileText className="w-4 h-4 text-slate-500" />
                                                                    <span className="text-sm text-slate-700">
                                                                        {
                                                                            file.name
                                                                        }
                                                                    </span>
                                                                    <span className="text-xs text-slate-500">
                                                                        (
                                                                        {(
                                                                            file.size /
                                                                            1024 /
                                                                            1024
                                                                        ).toFixed(
                                                                            2
                                                                        )}{" "}
                                                                        MB)
                                                                    </span>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() =>
                                                                        removeAttachmentFile(
                                                                            index
                                                                        )
                                                                    }
                                                                    className="px-2 py-1 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                                                >
                                                                    ลบ
                                                                </Button>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เนื้อหา <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="detail"
                                placeholder="รายละเอียดเนื้อหา"
                                className="w-full px-4 py-3 h-96 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                value={formData.detail}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* ข้อมูลผู้ลงนาม */}
                <FormSection
                    title="ข้อมูลผู้ขออนุมัติ"
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                    headerBorderColor="border-purple-300"
                    icon={<UserPen className="w-5 h-5 text-purple-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อผู้ขออนุมัติ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="ระบุชื่อ-นามสกุลผู้ขออนุมัติ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ตำแหน่ง/แผนก{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="depart"
                                placeholder="ระบุตำแหน่ง/แผนกผู้ขออนุมัติ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.depart}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ผู้ประสานงาน{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="coor"
                                placeholder="ระบุชื่อ-นามสกุลผู้ประสานงาน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.coor}
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
                                type="number"
                                name="tel"
                                placeholder="ระบุเบอร์โทรศัพท์ผู้ประสานงาน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.tel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                อีเมล <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="email"
                                name="email"
                                placeholder="ระบุอีเมลผู้ประสานงาน"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </FormSection>

                {/* ข้อมูลผู้อนุมัติ */}
                <FormSection
                    title="ข้อมูลผู้ลงนามอนุมัติ"
                    bgColor="bg-red-50"
                    borderColor="border-red-200"
                    headerBorderColor="border-red-300"
                    icon={<UserPen className="w-5 h-5 text-red-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ชื่อผู้อนุมัติ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="accept"
                                placeholder="ระบุชื่อ-นามสกุลผู้อนุมัติ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                value={formData.accept}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </FormSection>

                {/* อัปโหลดลายเซ็น */}
                <FormSection
                    title="อัปโหลดลายเซ็นผู้ขออนุมัติ"
                    bgColor="bg-white"
                    borderColor="border-yellow-200"
                    headerBorderColor="border-yellow-300"
                    icon={<ImageIcon className="w-5 h-5 text-yellow-600" />}
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 ">
                            อัปโหลดลายเซ็น (.png, .jpeg)
                        </label>
                        <Input
                            type="file"
                            name="signatureFile"
                            className={`border border-slate-300 rounded-lg 
                                      focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                      transition-colors file:mr-4 file:py-2 file:px-4 
                                      file:rounded-md file:border-0 file:text-sm 
                                      file:font-medium file:bg-blue-50 file:text-blue-700 
                                      hover:file:bg-blue-100`}
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                        {signaturePreview && (
                            <div className="flex justify-center mt-4 p-4 border border-dashed rounded-lg bg-slate-50">
                                <Image
                                    src={signaturePreview}
                                    alt="Signature Preview"
                                    width={320}
                                    height={200}
                                    className="max-w-xs h-auto object-contain border rounded-lg shadow-sm"
                                />
                            </div>
                        )}
                    </div>
                </FormSection>

                {/* Divider ระหว่างอัปโหลดกับวาดลายเซ็น */}
                <div className="relative my-8">
                    <div
                        className="absolute inset-0 flex items-center"
                        aria-hidden="true"
                    >
                        <div className="w-full border-t-2 border-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-full border-2 border-blue-200 shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <Upload className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        อัปโหลด
                                    </span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <span className="text-lg font-bold text-blue-600 uppercase tracking-wider">
                                        หรือ
                                    </span>
                                    <span className="text-xs text-slate-600 font-medium whitespace-nowrap">
                                        เลือกอย่างใดอย่างหนึ่ง
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <PenTool className="w-5 h-5" />
                                    <span className="text-sm font-medium">
                                        วาดลายเซ็น
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-3">
                        <p className="text-xs text-slate-500 italic">
                            💡คุณสามารถอัปโหลดไฟล์ลายเซ็นที่มีอยู่แล้ว หรือ
                            วาดลายเซ็นใหม่บนหน้าจอได้
                        </p>
                    </div>
                </div>

                {/* วาดลายเซ็นออนไลน์ */}
                <FormSection
                    title="วาดลายเซ็นผู้ขออนุมัติ"
                    bgColor="bg-indigo-50"
                    borderColor="border-indigo-200"
                    headerBorderColor="border-indigo-300"
                    icon={<PenTool className="w-5 h-5 text-indigo-600" />}
                >
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            วาดลายเซ็นของผู้ขออนุมัติ
                        </label>
                        {isClient ? (
                            <SignatureCanvasComponent
                                ref={signatureCanvasRef}
                                onSignatureChange={handleSignatureCanvasChange}
                                canvasProps={{
                                    width: 400,
                                    height: 200,
                                    backgroundColor: "rgba(255, 255, 255, 1)",
                                    penColor: "black",
                                }}
                            />
                        ) : (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                                <p className="text-gray-500">
                                    กำลังโหลดพื้นที่วาดลายเซ็น...
                                </p>
                            </div>
                        )}
                        {signatureCanvasData && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-slate-700 mb-2">
                                    ตัวอย่างลายเซ็นที่วาด:
                                </p>
                                <div className="flex justify-center p-4 border border-dashed rounded-lg bg-slate-50">
                                    <Image
                                        src={signatureCanvasData}
                                        alt="Canvas Signature Preview"
                                        width={320}
                                        height={200}
                                        className="max-w-xs h-auto object-contain border rounded-lg shadow-sm"
                                    />
                                </div>
                            </div>
                        )}
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
                    // Use a more robust way to submit if form ref is available, but querySelector works for simple case
                    const form = document.querySelector("form");
                    if (form) form.requestSubmit();
                }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ชื่อไฟล์:
                        </h4>
                        <p className="text-sm">{formData.projectName || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            เลขที่หนังสือ:
                        </h4>
                        <p className="text-sm">{formData.head || "-"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            วันที่:
                        </h4>
                        <p className="text-sm">{formData.date || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            เรื่อง:
                        </h4>
                        <p className="text-sm">{formData.topicdetail || "-"}</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-gray-600">
                        ผู้รับ:
                    </h4>
                    <p className="text-sm">{formData.todetail || "-"}</p>
                </div>

                {/* ส่วนแสดงผล attachments ใน preview */}
                <div>
                    <h4 className="font-medium text-slate-700 mb-2">
                        สิ่งที่ส่งมาด้วย:
                    </h4>
                    {formData.attachments.length > 0 ? (
                        <ul className="text-sm list-disc list-inside">
                            {formData.attachments.map((attachment, index) => (
                                <li key={index} className="mb-1">
                                    {attachment ||
                                        `รายการที่ ${
                                            index + 1
                                        } (ยังไม่ได้กรอก)`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-slate-500">
                            ไม่มีสิ่งที่ส่งมาด้วย
                        </p>
                    )}
                </div>

                <div>
                    <h4 className="font-semibold text-sm text-gray-600">
                        เนื้อหา:
                    </h4>
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.detail || "-"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ชื่อผู้ลงนาม:
                        </h4>
                        <p className="text-sm">{formData.name || "-"}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ตำแหน่ง/แผนก:
                        </h4>
                        <p className="text-sm">{formData.depart || "-"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ผู้ประสานงาน:
                        </h4>
                        <p className="text-sm">{formData.coor || "-"}</p>
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

                {(signaturePreview || signatureCanvasData) && (
                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            ลายเซ็น:
                        </h4>
                        {signaturePreview && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">
                                    จากการอัปโหลดไฟล์:
                                </p>
                                <Image
                                    src={signaturePreview}
                                    alt="Signature Preview"
                                    width={320}
                                    height={200}
                                    className="max-w-xs h-auto object-contain mt-2 border rounded"
                                />
                            </div>
                        )}
                        {signatureCanvasData && (
                            <div className={signaturePreview ? "mt-4" : ""}>
                                <p className="text-xs text-gray-500 mb-2">
                                    จากการวาดออนไลน์:
                                </p>
                                <Image
                                    src={signatureCanvasData}
                                    alt="Canvas Signature Preview"
                                    width={320}
                                    height={200}
                                    className="max-w-xs h-auto object-contain mt-2 border rounded"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* แสดงไฟล์แนบในการพรีวิว */}
                {formData.attachments.length > 0 &&
                    attachmentFiles.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ไฟล์แนบ ({attachmentFiles.length} ไฟล์):
                            </h4>
                            <div className="mt-2 space-y-1">
                                {attachmentFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center space-x-2 text-sm"
                                    >
                                        <FileText className="w-4 h-4 text-slate-500" />
                                        <span>{file.name}</span>
                                        <span className="text-xs text-slate-500">
                                            (
                                            {(file.size / 1024 / 1024).toFixed(
                                                2
                                            )}{" "}
                                            MB)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
