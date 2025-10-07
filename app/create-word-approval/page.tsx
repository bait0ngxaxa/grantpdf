"use client";

import { useState, FormEvent, ChangeEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hook/useTitle";
import SignatureCanvasComponent, { SignatureCanvasRef } from "@/components/ui/SignatureCanvas";

interface WordDocumentData {
    head: string;
    fileName: string;
    projectName: string; // เพิ่มชื่อโครงการ
    date: string;
    topicdetail: string;
    todetail: string;
    attachments: string[]; // เปลี่ยนจาก attachmentdetail, attachmentdetail2, attachmentdetail3 เป็น array
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
    const router = useRouter();
    const signatureCanvasRef = useRef<SignatureCanvasRef>(null);

    const [formData, setFormData] = useState<WordDocumentData>({
        head: "", //เลขที่หนังสือ
        fileName: "", //ชื่อไฟล์
        projectName: "", //ชื่อโครงการ
        date: "", //วันที่
        topicdetail: "", //เรื่อง
        todetail: "", //ผู้รับ
        attachments: [], //รายการสิ่งที่ส่งมาด้วย (แบบ array)
        detail: "", //เนื้อหา
        name: "", //ชื่อผู้ลงนาม
        depart: "", //ตำแหน่ง/แผนก
        coor: "", //ผู้ประสานงาน
        tel: "", //เบอร์โทรศัพท์
        email: "", //อีเมล
        accept: "", //ยอมรับ
    });

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        null
    );
    const [signatureCanvasData, setSignatureCanvasData] = useState<string | null>(null);
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

    // เพิ่มฟังก์ชันสำหรับจัดการ attachments
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

    const handleBack = () => {
        router.push("/createdocs");
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

    // ฟังก์ชันสำหรับอัปโหลดไฟล์แนบไปยัง file-upload API
    const uploadAttachmentFiles = async (files: File[]): Promise<string[]> => {
        const uploadedIds: string[] = [];
        console.log(`Starting upload of ${files.length} attachment files`);

        // Get project ID from localStorage
        const selectedProjectId = localStorage.getItem('selectedProjectId');
        if (!selectedProjectId) {
            console.error('No project selected for file upload');
            throw new Error('กรุณาเลือกโครงการก่อนอัปโหลดไฟล์');
        }

        for (const file of files) {
            try {
                console.log(
                    `Uploading file: ${file.name}, size: ${file.size} bytes`
                );
                const formData = new FormData();
                formData.append("file", file);
                formData.append("projectId", selectedProjectId); // Add required projectId

                if (session?.user?.id) {
                    formData.append("userId", session.user.id.toString());
                }
                if (session?.user?.email) {
                    formData.append("userEmail", session.user.email);
                }
                if ((session as any)?.accessToken) {
                    formData.append("token", (session as any).accessToken);
                }

                const response = await fetch("/api/file-upload", {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log("Upload response:", result);
                    if (result.success && result.file && result.file.id) {
                        uploadedIds.push(result.file.id);
                        console.log(
                            `Successfully uploaded ${file.name}, ID: ${result.file.id}`
                        );
                    } else {
                        console.error(
                            "Upload succeeded but no file ID returned:",
                            result
                        );
                    }
                } else {
                    const errorText = await response.text();
                    console.error(
                        `Failed to upload attachment ${file.name}:`,
                        response.status,
                        errorText
                    );
                }
            } catch (error) {
                console.error("Error uploading attachment:", error);
            }
        }

        console.log(
            `Upload completed. Total uploaded IDs: ${uploadedIds.length}`,
            uploadedIds
        );
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

        setIsSubmitting(true);
        setMessage(null);
        setGeneratedFileUrl(null);
        setIsError(false);

        try {
            const data = new FormData();
            // ส่งข้อมูลฟอร์มปกติ
            Object.keys(formData).forEach((key) => {
                if (key === "attachments") {
                    // ส่ง attachments เป็น JSON string
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

            // เพิ่มข้อมูลจาก signature canvas
            if (signatureCanvasData) {
                // แปลง data URL เป็น File object
                const byteString = atob(signatureCanvasData.split(',')[1]);
                const mimeString = signatureCanvasData.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const canvasSignatureFile = new File([ab], 'canvas-signature.png', { type: mimeString });
                data.append("canvasSignatureFile", canvasSignatureFile);
            }

            // เพิ่มไฟล์แนบ - ส่งไปที่ file-upload API ก่อน
            if (attachmentFiles.length > 0) {
                console.log("Uploading attachment files...");
                const uploadedAttachments = await uploadAttachmentFiles(
                    attachmentFiles
                );
                console.log(
                    "Attachment file IDs to send:",
                    uploadedAttachments
                );
                data.append(
                    "attachmentFileIds",
                    JSON.stringify(uploadedAttachments)
                );
            } else {
                console.log("No attachment files to upload");
            }

            if (session.user?.id) {
                data.append("userId", session.user.id.toString());
            }
            if (session.user?.email) {
                data.append("userEmail", session.user.email);
            }
            if ((session as any)?.accessToken) {
                data.append("token", (session as any).accessToken);
            }
            
            // Add project ID if available
            const selectedProjectId = localStorage.getItem('selectedProjectId');
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
        } catch (error) {
            console.error("Error submitting form:", error);
            setMessage("เกิดข้อผิดพลาดในการเชื่อมต่อ");
            setIsError(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans antialiased">
            <div className="bg-white rounded-2xl shadow-lg mb-6 w-full max-w-5xl p-4">
                <div className="flex items-center">
                    <Button
                        onClick={handleBack}
                        className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        <span className="ml-2">กลับ</span>
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                    <h2 className="text-3xl font-bold text-center">
                        สร้างหนังสือขออนุมัติของมูลนิธิ
                    </h2>
                    <p className="text-center mt-2 text-blue-100">
                        กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารขออนุมัติ
                    </p>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* ข้อมูลพื้นฐาน */}
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-300">
                                📋 ข้อมูลพื้นฐาน
                            </h3>
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
                        </div>

                        {/* รายละเอียดหนังสือ */}
                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-blue-300">
                                📄 รายละเอียดหนังสือ
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        เรื่อง{" "}
                                        <span className="text-red-500">*</span>
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
                                        เรียน{" "}
                                        <span className="text-red-500">*</span>
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
                        </div>

                        {/* สิ่งที่ส่งมาด้วย - เปลี่ยนเป็นระบบเพิ่ม/ลด */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-green-300">
                                📁 สิ่งที่ส่งมาด้วยและเนื้อหา
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        สิ่งที่ส่งมาด้วย
                                    </label>
                                    {/* แสดงรายการ attachments */}
                                    {formData.attachments.map(
                                        (attachment, index) => (
                                            <div
                                                key={index}
                                                className="flex gap-2 mb-3"
                                            >
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
                                                    onClick={() =>
                                                        removeAttachment(index)
                                                    }
                                                    className="px-3 py-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                                >
                                                    ลบ
                                                </Button>
                                            </div>
                                        )
                                    )}

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
                                            คลิกปุ่ม "เพิ่มสิ่งที่ส่งมาด้วย"
                                            เพื่อเพิ่มรายการ (ถ้ามี)
                                        </p>
                                    )}

                                    {/* อัปโหลดไฟล์แนบ - แสดงเฉพาะเมื่อมีสิ่งที่ส่งมาด้วย */}
                                    {formData.attachments.length > 0 && (
                                        <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                                            <h4 className="text-md font-semibold text-slate-800 mb-3 flex items-center">
                                                <svg
                                                    className="w-5 h-5 mr-2 text-orange-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                    />
                                                </svg>
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
                                                            {
                                                                attachmentFiles.length
                                                            }{" "}
                                                            ไฟล์):
                                                        </h5>
                                                        <div className="space-y-2">
                                                            {attachmentFiles.map(
                                                                (
                                                                    file,
                                                                    index
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200"
                                                                    >
                                                                        <div className="flex items-center space-x-2">
                                                                            <svg
                                                                                className="w-4 h-4 text-slate-500"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                viewBox="0 0 24 24"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth={
                                                                                        2
                                                                                    }
                                                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                                                />
                                                                            </svg>
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
                                        เนื้อหา{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="detail"
                                        placeholder="รายละเอียดเนื้อหา"
                                        className="w-full px-4 py-3 h-96 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.detail}
                                        onChange={handleChange}
                                        //rows={50}
                                        // wordLikeWidth
                                        // autoResize={true}
                                        // textAlign="justify"
                                        // thaiDistributed={true}
                                        // fontSize="22px"
                                        // trailingBlankLines={1}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ข้อมูลผู้ลงนาม */}
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-purple-300">
                                ✍️ ข้อมูลผู้ขออนุมัติ
                            </h3>
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
                                        type="tel"
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
                                        อีเมล{" "}
                                        <span className="text-red-500">*</span>
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
                        </div>

                        <div className="bg-red-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-purple-300">
                                ✍️ ข้อมูลผู้ลงนามอนุมัติ
                            </h3>
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
                        </div>

                        {/* อัปโหลดลายเซ็น */}
                        <div className="bg-white p-6 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-yellow-300">
                                🖼️ อัปโหลดลายเซ็นผู้ขออนุมัติ
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 ">
                                    อัปโหลดลายเซ็น (.png, .jpeg)
                                </label>
                                <Input
                                    type="file"
                                    name="signatureFile"
                                    className={`  border border-slate-300 rounded-lg 
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
                                        <img
                                            src={signaturePreview}
                                            alt="Signature Preview"
                                            className="max-w-xs h-auto object-contain border rounded-lg shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* วาดลายเซ็นออนไลน์ */}
                        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-indigo-300">
                                ✍️ วาดลายเซ็นออนไลน์
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    วาดลายเซ็นของคุณ
                                </label>
                                <SignatureCanvasComponent
                                    ref={signatureCanvasRef}
                                    onSignatureChange={handleSignatureCanvasChange}
                                    canvasProps={{
                                        width: 400,
                                        height: 200,
                                        backgroundColor: 'rgba(255, 255, 255, 1)',
                                        penColor: 'black'
                                    }}
                                />
                                {signatureCanvasData && (
                                    <div className="mt-4">
                                        <p className="text-sm font-medium text-slate-700 mb-2">ตัวอย่างลายเซ็นที่วาด:</p>
                                        <div className="flex justify-center p-4 border border-dashed rounded-lg bg-slate-50">
                                            <img
                                                src={signatureCanvasData}
                                                alt="Canvas Signature Preview"
                                                className="max-w-xs h-auto object-contain border rounded-lg shadow-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                            <Button
                                type="button"
                                onClick={openPreviewModal}
                                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
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
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                                ดูตัวอย่างข้อมูล
                            </Button>
                            <Button
                                type="submit"
                                className="cursor-pointer flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg
                                            className="animate-spin w-5 h-5 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        กำลังสร้างเอกสาร...
                                    </>
                                ) : (
                                    <>
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
                                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        ยืนยันสร้างเอกสาร
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>

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
                </div>
            </div>

            {/* Preview Modal */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            ตัวอย่างข้อมูลที่จะสร้างเอกสาร
                        </DialogTitle>
                        <DialogDescription>
                            กรุณาตรวจสอบข้อมูลของคุณก่อนสร้างเอกสาร
                        </DialogDescription>
                    </DialogHeader>

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
                                    เลขที่หนังสือ:
                                </h4>
                                <p className="text-sm">
                                    {formData.head || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    วันที่:
                                </h4>
                                <p className="text-sm">
                                    {formData.date || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    เรื่อง:
                                </h4>
                                <p className="text-sm">
                                    {formData.topicdetail || "-"}
                                </p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ผู้รับ:
                            </h4>
                            <p className="text-sm">
                                {formData.todetail || "-"}
                            </p>
                        </div>

                        {/* ส่วนแสดงผล attachments ใน preview */}
                        <div>
                            <h4 className="font-medium text-slate-700 mb-2">
                                สิ่งที่ส่งมาด้วย:
                            </h4>
                            {formData.attachments.length > 0 ? (
                                <ul className="text-sm list-disc list-inside">
                                    {formData.attachments.map(
                                        (attachment, index) => (
                                            <li key={index} className="mb-1">
                                                {attachment ||
                                                    `รายการที่ ${
                                                        index + 1
                                                    } (ยังไม่ได้กรอก)`}
                                            </li>
                                        )
                                    )}
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
                                <p className="text-sm">
                                    {formData.name || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ตำแหน่ง/แผนก:
                                </h4>
                                <p className="text-sm">
                                    {formData.depart || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ผู้ประสานงาน:
                                </h4>
                                <p className="text-sm">
                                    {formData.coor || "-"}
                                </p>
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
                                        <p className="text-xs text-gray-500 mb-2">จากการอัปโหลดไฟล์:</p>
                                        <img
                                            src={signaturePreview}
                                            alt="Signature Preview"
                                            className="max-w-xs h-auto object-contain mt-2 border rounded"
                                        />
                                    </div>
                                )}
                                {signatureCanvasData && (
                                    <div className={signaturePreview ? "mt-4" : ""}>
                                        <p className="text-xs text-gray-500 mb-2">จากการวาดออนไลน์:</p>
                                        <img
                                            src={signatureCanvasData}
                                            alt="Canvas Signature Preview"
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
                                                <svg
                                                    className="w-4 h-4 text-slate-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <span>{file.name}</span>
                                                <span className="text-xs text-slate-500">
                                                    (
                                                    {(
                                                        file.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{" "}
                                                    MB)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button
                                variant="outline"
                                className="cursor-pointer rounded-lg"
                            >
                                แก้ไข
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={() => {
                                setIsPreviewOpen(false);
                                document.querySelector("form")?.requestSubmit();
                            }}
                            className="cursor-pointer rounded-lg "
                        >
                            ยืนยันและสร้างเอกสาร
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <CreateDocSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                fileName={formData.fileName}
                downloadUrl={generatedFileUrl}
                documentType="เอกสาร Word "
            />
        </div>
    );
}
