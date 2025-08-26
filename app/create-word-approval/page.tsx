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
    date: string;
    topicdetail: string;
    todetail: string;
    attachmentdetail: string;
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
        date: "", //วันที่
        topicdetail: "", //เรื่อง
        todetail: "", //ผู้รับ
        attachmentdetail: "", //รายละเอียดสิ่งที่ส่งมาด้วย
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

    const downloadFileName = formData.fileName.endsWith(".docx")
        ? formData.fileName
        : `${formData.fileName}.docx`;

    return (
        <div className="min-h-screen flex flex-col items-center bg-base-200 p-4 font-sans antialiased">
            <div className="navbar bg-base-100 rounded-box shadow-lg mb-6 w-full max-w-4xl">
                <div className="flex-1">
                    <Button onClick={handleBack}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
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

            <div className="card w-full max-w-4xl shadow-xl bg-base-100 p-6">
                <h2 className="text-2xl font-semibold text-center mb-6">
                    สร้างหนังสือขอนุมัติของมูลนิธิ
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    ชื่อโครงการ (filename)
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="fileName"
                                placeholder="ชื่อไฟล์ (ไม่จำเป็นต้องมี .docx)"
                                className="input input-bordered w-full"
                                value={formData.fileName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    เลขที่หนังสือ (head)
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="head"
                                placeholder="เลขที่หนังสือ"
                                className="input input-bordered w-full"
                                value={formData.head}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    วันที่ (date)
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="date"
                                placeholder="เช่น 14 สิงหาคม 2568"
                                className="input input-bordered w-full"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">
                                เรื่อง (topicdetail)
                            </span>
                        </label>
                        <Input
                            type="text"
                            name="topicdetail"
                            placeholder="รายละเอียดหัวข้อ"
                            className="input input-bordered w-full"
                            value={formData.topicdetail}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">
                                ผู้รับ (todetail)
                            </span>
                        </label>
                        <Input
                            name="todetail"
                            placeholder="รายละเอียดผู้รับ"
                            className="input input-bordered w-full"
                            value={formData.todetail}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">
                                รายละเอียดสิ่งที่ส่งมาด้วย (attachmentdetail)
                            </span>
                        </label>
                        <Textarea
                            name="attachmentdetail"
                            placeholder="รายละเอียดสิ่งที่ส่งมาด้วย"
                            className="textarea textarea-bordered h-10 w-full"
                            value={formData.attachmentdetail}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">เนื้อหา (detail)</span>
                        </label>
                        <Textarea
                            name="detail"
                            placeholder="รายละเอียดเนื้อหา"
                            className="textarea textarea-bordered h-40 w-full"
                            value={formData.detail}
                            onChange={handleChange}
                            required
                            maxLength={1024}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    ชื่อผู้ลงนาม (name)
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="name"
                                placeholder="ชื่อ-นามสกุล"
                                className="input input-bordered w-full"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    ตำแหน่ง/แผนก (depart)
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="depart"
                                placeholder="ตำแหน่ง/แผนก"
                                className="input input-bordered w-full"
                                value={formData.depart}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    ผู้ประสานงาน (coor)
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="coor"
                                placeholder="ผู้ประสานงาน"
                                className="input input-bordered w-full"
                                value={formData.coor}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    เบอร์โทรศัพท์ (tel)
                                </span>
                            </label>
                            <Input
                                type="tel"
                                name="tel"
                                placeholder="เบอร์โทรศัพท์"
                                className="input input-bordered w-full"
                                value={formData.tel}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">อีเมล (email)</span>
                        </label>
                        <Input
                            type="email"
                            name="email"
                            placeholder="อีเมล"
                            className="input input-bordered w-full"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">
                                อัปโหลดลายเซ็น (.png)
                            </span>
                        </label>
                        <Input
                            type="file"
                            name="signatureFile"
                            className="file-input file-input-bordered w-full"
                            accept="image/png, image/jpeg"
                            onChange={handleFileChange}
                        />
                    </div>

                    {signaturePreview && (
                        <div className="flex justify-center mt-4 p-4 border border-dashed rounded-md bg-base-200">
                            <img
                                src={signaturePreview}
                                alt="Signature Preview"
                                className="max-w-xs h-auto object-contain"
                            />
                        </div>
                    )}

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            onClick={openPreviewModal}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={isSubmitting}
                        >
                            ดูตัวอย่างข้อมูล
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    กำลังสร้าง Word...
                                </>
                            ) : (
                                "สร้างเอกสาร"
                            )}
                        </Button>
                    </div>
                </form>

                {message && isError && (
                    <div className="alert alert-error mt-6">
                        <span>{message}</span>
                    </div>
                )}
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
