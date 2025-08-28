"use client";

import { useState, FormEvent, ChangeEvent } from "react";
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

interface WordDocumentData {
    head: string;
    fileName: string;
    projectName: string; // เพิ่มชื่อโครงการ
    date: string;
    topicdetail: string;
    todetail: string;
    attachmentdetail: string;
    attachmentdetail2: string;
    attachmentdetail3: string;
    detail: string;
    name: string;
    depart: string;
    coor: string;
    tel: string;
    email: string;
}

export default function CreateWordDocPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState<WordDocumentData>({
        head: "", //เลขที่หนังสือ
        fileName: "", //ชื่อไฟล์
        projectName: "", //ชื่อโครงการ
        date: "", //วันที่
        topicdetail: "", //เรื่อง
        todetail: "", //ผู้รับ
        attachmentdetail: "", //รายละเอียดสิ่งที่ส่งมาด้วย
        attachmentdetail2: "", //รายละเอียดสิ่งที่ส่งมาด้วย
        attachmentdetail3: "", //รายละเอียดสิ่งที่ส่งมาด้วย
        detail: "", //เนื้อหา
        name: "", //ชื่อผู้ลงนาม
        depart: "", //ตำแหน่ง/แผนก
        coor: "", //ผู้ประสานงาน
        tel: "", //เบอร์โทรศัพท์
        email: "", //อีเมล
    });

    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [signaturePreview, setSignaturePreview] = useState<string | null>(
        null
    );
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

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
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
            Object.keys(fixedValues).forEach((key) => {
                data.append(key, fixedValues[key as keyof typeof fixedValues]);
            });
            if (signatureFile) {
                data.append("signatureFile", signatureFile);
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

            const response = await fetch("/api/fill-approval-template", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.downloadUrl) {
                    setGeneratedFileUrl(result.downloadUrl);
                    setMessage(`สร้างเอกสาร Word สำเร็จแล้ว! โครงการ: ${result.project?.name || 'ไม่ระบุ'}`);
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

    const downloadFileName = formData.projectName.endsWith(".docx")
        ? formData.projectName
        : `${formData.projectName}.docx`;

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-slate-50 to-blue-50 p-4 font-sans antialiased">
            <div className="bg-white rounded-2xl shadow-lg mb-6 w-full max-w-5xl p-4">
                <div className="flex items-center">
                    <Button
                        onClick={handleBack}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-4 py-2 rounded-lg transition-colors"
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
                        สร้างหนังสือขอนุมัติของมูลนิธิ
                    </h2>
                    <p className="text-center mt-2 text-blue-100">
                        กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสารขอนุมัติ
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
                                        placeholder="ชื่อโครงการ (เช่น โครงการพัฒนาระบบ)"
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
                                        placeholder="เลขที่หนังสือ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.head}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        วันที่{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="date"
                                        placeholder="เช่น 14 สิงหาคม 2568"
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
                                        placeholder="รายละเอียดหัวข้อ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.topicdetail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ผู้รับ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="todetail"
                                        placeholder="รายละเอียดผู้รับ"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.todetail}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* สิ่งที่ส่งมาด้วยและเนื้อหา */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-green-300">
                                📁 สิ่งที่ส่งมาด้วยและเนื้อหา
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        สิ่งที่ส่งมาด้วย
                                    </label>
                                    <Input
                                        type="text"
                                        name="attachmentdetail"
                                        placeholder="รายละเอียดสิ่งที่ส่งมาด้วย (1) "
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.attachmentdetail}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="text"
                                        name="attachmentdetail2"
                                        placeholder="รายละเอียดสิ่งที่ส่งมาด้วย 2 (ถ้ามี ถ้าไม่มีว่างไว้)"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.attachmentdetail2}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="text"
                                        name="attachmentdetail3"
                                        placeholder="รายละเอียดสิ่งที่ส่งมาด้วย 3 (ถ้ามี ถ้าไม่มีว่างไว้)"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.attachmentdetail3}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        เนื้อหา{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="detail"
                                        placeholder="รายละเอียดเนื้อหา"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.detail}
                                        onChange={handleChange}
                                        required
                                        maxLength={1024}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* ข้อมูลผู้ลงนาม */}
                        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-purple-300">
                                ✍️ ข้อมูลผู้ลงนาม
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ชื่อผู้ลงนาม{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="ชื่อ-นามสกุล"
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
                                        placeholder="ตำแหน่ง/แผนก"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.depart}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ผู้ประสานงาน
                                    </label>
                                    <Input
                                        type="text"
                                        name="coor"
                                        placeholder="ผู้ประสานงาน"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.coor}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        เบอร์โทรศัพท์
                                    </label>
                                    <Input
                                        type="tel"
                                        name="tel"
                                        placeholder="เบอร์โทรศัพท์"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.tel}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="lg:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        อีเมล
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="อีเมล"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* อัปโหลดลายเซ็น */}
                        <div className="bg-white p-6 rounded-lg border border-yellow-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-yellow-300">
                                🖼️ อัปโหลดลายเซ็น
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

                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                            <Button
                                type="button"
                                onClick={openPreviewModal}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        สร้างเอกสาร Word
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
                                    ชื่อโครงการ:
                                </h4>
                                <p className="text-sm">
                                    {formData.projectName || "-"}
                                </p>
                            </div>
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

                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                สิ่งที่ส่งมาด้วย:
                            </h4>
                            <p className="text-sm">
                                {formData.attachmentdetail || "-"}
                            </p>
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

                        {signaturePreview && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ลายเซ็น:
                                </h4>
                                <img
                                    src={signaturePreview}
                                    alt="Signature Preview"
                                    className="max-w-xs h-auto object-contain mt-2 border rounded"
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">แก้ไข</Button>
                        </DialogClose>
                        <Button
                            onClick={() => {
                                setIsPreviewOpen(false);
                                document.querySelector("form")?.requestSubmit();
                            }}
                        >
                            ยืนยันและสร้างเอกสาร
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog
                open={isSuccessModalOpen}
                onOpenChange={setIsSuccessModalOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-green-600">
                            สร้างเอกสารสำเร็จ!
                        </DialogTitle>
                        <DialogDescription>
                            เอกสาร Word ของคุณพร้อมแล้ว
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                />
                            </svg>
                        </div>
                        <p className="text-center text-gray-600">
                            ไฟล์: {downloadFileName}
                        </p>
                    </div>

                    <DialogFooter className="flex-col space-y-2">
                        {generatedFileUrl && (
                            <a
                                href={generatedFileUrl}
                                download={downloadFileName}
                                rel="noopener noreferrer"
                                className="w-full"
                            >
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    ดาวน์โหลดเอกสาร
                                </Button>
                            </a>
                        )}
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => {
                                setIsSuccessModalOpen(false);
                                router.push("/userdashboard");
                            }}
                        >
                            กลับไปหน้าหลัก
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
