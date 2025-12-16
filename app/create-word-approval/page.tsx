"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
import { FormField } from "@/components/document-form/FormField";
import { AttachmentList } from "@/components/document-form/AttachmentList";
import { AttachmentUpload } from "@/components/document-form/AttachmentUpload";
import { SignatureSection } from "@/components/document-form/SignatureSection";
import {
    PreviewField,
    PreviewGrid,
    PreviewList,
} from "@/components/document-form/PreviewField";
import { ClipboardList, FileText, Folder, UserPen } from "lucide-react";

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

    // Attachment handlers
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

    // Form handlers
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

    // Upload attachment files
    const uploadAttachmentFiles = async (files: File[]): Promise<string[]> => {
        const uploadedIds: string[] = [];
        const selectedProjectId = localStorage.getItem("selectedProjectId");
        if (!selectedProjectId) {
            throw new Error("กรุณาเลือกโครงการก่อนอัปโหลดไฟล์");
        }

        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("projectId", selectedProjectId);

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
                    if (result.success && result.file?.id) {
                        uploadedIds.push(result.file.id);
                    }
                }
            } catch (_error) {
                // Silent fail for individual files
            }
        }

        return uploadedIds;
    };

    // Submit handler
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!session) {
            setMessage("คุณต้องเข้าสู่ระบบก่อน");
            setIsError(true);
            return;
        }

        if (signatureFile && signatureCanvasData) {
            setMessage(
                "กรุณาเลือกเพียงวิธีการหนึ่งในการเพิ่มลายเซ็น (อัปโหลดไฟล์ หรือ วาดลายเซ็นเอง)"
            );
            setIsError(true);
            return;
        }

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
                        <FormField
                            label="ชื่อเอกสาร"
                            name="projectName"
                            placeholder="ระบุชื่อเอกสาร"
                            value={formData.projectName}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เลขที่หนังสือ"
                            name="head"
                            placeholder="ระบุเลขที่หนังสือ"
                            value={formData.head}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="วันที่สร้างหนังสือ"
                            name="date"
                            placeholder="ระบุวัน เดือน ปีเช่น 14 สิงหาคม 2568"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
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
                        <FormField
                            label="เรื่อง"
                            name="topicdetail"
                            placeholder="หัวข้อหนังสือ"
                            value={formData.topicdetail}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เรียน"
                            name="todetail"
                            placeholder="ระบุผู้รับ"
                            value={formData.todetail}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </FormSection>

                {/* สิ่งที่ส่งมาด้วยและเนื้อหา */}
                <FormSection
                    title="สิ่งที่ส่งมาด้วยและเนื้อหา"
                    bgColor="bg-green-50"
                    borderColor="border-green-200"
                    headerBorderColor="border-green-300"
                    icon={<Folder className="w-5 h-5 text-green-600" />}
                >
                    <div className="space-y-6">
                        <AttachmentList
                            attachments={formData.attachments}
                            onAdd={addAttachment}
                            onRemove={removeAttachment}
                            onUpdate={updateAttachment}
                        />

                        {formData.attachments.length > 0 && (
                            <AttachmentUpload
                                files={attachmentFiles}
                                onFilesChange={handleAttachmentFilesChange}
                                onRemoveFile={removeAttachmentFile}
                            />
                        )}

                        <FormField
                            label="เนื้อหา"
                            name="detail"
                            type="textarea"
                            placeholder="รายละเอียดเนื้อหา"
                            value={formData.detail}
                            onChange={handleChange}
                            rows={12}
                            className="h-96"
                        />
                    </div>
                </FormSection>

                {/* ข้อมูลผู้ขออนุมัติ */}
                <FormSection
                    title="ข้อมูลผู้ขออนุมัติ"
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                    headerBorderColor="border-purple-300"
                    icon={<UserPen className="w-5 h-5 text-purple-600" />}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <FormField
                            label="ชื่อผู้ขออนุมัติ"
                            name="name"
                            placeholder="ระบุชื่อ-นามสกุลผู้ขออนุมัติ"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ตำแหน่ง/แผนก"
                            name="depart"
                            placeholder="ระบุตำแหน่ง/แผนกผู้ขออนุมัติ"
                            value={formData.depart}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ผู้ประสานงาน"
                            name="coor"
                            placeholder="ระบุชื่อ-นามสกุลผู้ประสานงาน"
                            value={formData.coor}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เบอร์โทรศัพท์"
                            name="tel"
                            type="number"
                            placeholder="ระบุเบอร์โทรศัพท์ผู้ประสานงาน"
                            value={formData.tel}
                            onChange={handleChange}
                            required
                        />
                        <div className="lg:col-span-2">
                            <FormField
                                label="อีเมล"
                                name="email"
                                type="email"
                                placeholder="ระบุอีเมลผู้ประสานงาน"
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
                    <FormField
                        label="ชื่อผู้อนุมัติ"
                        name="accept"
                        placeholder="ระบุชื่อ-นามสกุลผู้อนุมัติ"
                        value={formData.accept}
                        onChange={handleChange}
                        required
                    />
                </FormSection>

                {/* ลายเซ็น */}
                <SignatureSection
                    signaturePreview={signaturePreview}
                    signatureCanvasData={signatureCanvasData}
                    onFileChange={handleFileChange}
                    onCanvasChange={handleSignatureCanvasChange}
                    signatureCanvasRef={signatureCanvasRef}
                    uploadTitle="อัปโหลดลายเซ็นผู้ขออนุมัติ"
                    canvasTitle="วาดลายเซ็นผู้ขออนุมัติ"
                />

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
                    <PreviewField
                        label="ชื่อไฟล์"
                        value={formData.projectName}
                    />
                    <PreviewField label="เลขที่หนังสือ" value={formData.head} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField label="วันที่" value={formData.date} />
                    <PreviewField label="เรื่อง" value={formData.topicdetail} />
                </PreviewGrid>

                <PreviewField label="ผู้รับ" value={formData.todetail} />

                <PreviewList
                    label="สิ่งที่ส่งมาด้วย"
                    items={formData.attachments}
                    emptyMessage="ไม่มีสิ่งที่ส่งมาด้วย"
                />

                <PreviewField label="เนื้อหา">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.detail || "-"}
                    </p>
                </PreviewField>

                <PreviewGrid>
                    <PreviewField label="ชื่อผู้ลงนาม" value={formData.name} />
                    <PreviewField
                        label="ตำแหน่ง/แผนก"
                        value={formData.depart}
                    />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField label="ผู้ประสานงาน" value={formData.coor} />
                    <PreviewField label="เบอร์โทรศัพท์" value={formData.tel} />
                </PreviewGrid>

                <PreviewField label="อีเมล" value={formData.email} />

                {(signaturePreview || signatureCanvasData) && (
                    <PreviewField label="ลายเซ็น">
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
                    </PreviewField>
                )}

                {formData.attachments.length > 0 &&
                    attachmentFiles.length > 0 && (
                        <PreviewField
                            label={`ไฟล์แนบ (${attachmentFiles.length} ไฟล์)`}
                        >
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
                        </PreviewField>
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
