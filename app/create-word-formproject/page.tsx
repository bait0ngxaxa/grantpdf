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
    project: string;
    person: string;
    address: string;
    tel: string;
    email: string;
    timeline: string;
    cost: string;
    rationale: string;
    objective: string;
    objective2: string;
    objective3: string;
    target: string;
    zone: string;
    scope: string;
    monitoring: string;
    partner: string;
    datestart: string;
    dateend: string;
    author: string;
}

export default function CreateFormProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();

    const [formData, setFormData] = useState<WordDocumentData>({
        project: "",
        person: "",
        address: "",
        tel: "",
        email: "",
        timeline: "",
        cost: "",
        rationale: "",
        objective: "",
        objective2: "",
        objective3: "",
        target: "",
        zone: "",
        scope: "",
        monitoring: "",
        partner: "",
        datestart: "",
        dateend: "",
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
            if ((session as any)?.accessToken) {
                data.append("token", (session as any).accessToken);
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

    const downloadFileName = formData.project.endsWith(".docx")
        ? formData.project
        : `${formData.project}.docx`;

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
                    สร้างหนังสือสัญญาเพื่อรับรองการลงนาม
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols1 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ชื่อโครงการ</span>
                            </label>
                            <Input
                                type="text"
                                name="project"
                                placeholder="ชื่อโครงการ(ชื่อไฟล์)"
                                className="input input-bordered w-full"
                                value={formData.project}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ที่อยู่</span>
                            </label>
                            <Input
                                type="text"
                                name="address"
                                placeholder="ที่อยู่"
                                className="input input-bordered w-full"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    เบอร์โทรศัพท์
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="tel"
                                placeholder="หมายเลข 13 หลัก"
                                className="input input-bordered w-full"
                                value={formData.tel}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">อีเมล</span>
                            </label>
                            <Input
                                name="email"
                                placeholder="อีเมล"
                                className="input input-bordered w-full"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ระยะเวลา</span>
                            </label>
                            <Input
                                type="text"
                                name="timeline"
                                placeholder="ระยะเวลา"
                                className="input input-bordered w-full"
                                value={formData.timeline}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ค่าใช้จ่าย</span>
                            </label>
                            <Input
                                type="number"
                                name="cost"
                                placeholder="ค่าใช้จ่าย"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.cost}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">เหตุผล</span>
                            </label>
                            <Textarea
                                name="rationale"
                                placeholder="เหตุผล"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.rationale}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">วัตถุประสงค์</span>
                            </label>
                            <Input
                                type="text"
                                name="objective"
                                placeholder="วัตถุประสงค์"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.objective}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">เป้าหมาย</span>
                            </label>
                            <Textarea
                                name="target"
                                placeholder="เป้าหมาย"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.target}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">โซน</span>
                            </label>
                            <Textarea
                                name="zone"
                                placeholder="โซน"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.zone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ขอบเขต</span>
                            </label>
                            <Textarea
                                name="scope"
                                placeholder="ขอบเขต"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.scope}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">การติดตาม</span>
                            </label>
                            <Textarea
                                name="monitoring"
                                placeholder="การติดตาม"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.monitoring}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">คู่ธุรกิจ</span>
                            </label>
                            <Textarea
                                name="partner"
                                placeholder="คู่ธุรกิจ"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.partner}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">วันที่เริ่มต้น</span>
                            </label>
                            <Input
                                type="text"
                                name="datestart"
                                placeholder="วันที่เริ่มต้น"
                                className="input input-bordered w-full"
                                value={formData.datestart}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">
                                    วันที่สิ้นสุด
                                </span>
                            </label>
                            <Input
                                type="text"
                                name="dateend"
                                placeholder="วันที่สิ้นสุด"
                                className="input input-bordered w-full"
                                value={formData.dateend}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">ผู้สร้าง</span>
                            </label>
                            <Textarea
                                name="author"
                                placeholder="ผู้สร้าง"
                                className="textarea textarea-bordered h-20 w-full"
                                value={formData.author}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

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
                                    {formData.project || "-"}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ชื่อผู้สั่งการ:
                                </h4>
                                <p className="text-sm">
                                    {formData.person || "-"}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600">
                                    ที่อยู่:
                                </h4>
                                <p className="text-sm">
                                    {formData.address || "-"}
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
                                ค่าใช้จ่าย:
                            </h4>
                            <p className="text-sm">{formData.cost || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เหตุผล:
                            </h4>
                            <p className="text-sm">
                                {formData.rationale || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วัตถุประสงค์:
                            </h4>
                            <p className="text-sm">
                                {formData.objective || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เป้าหมาย:
                            </h4>
                            <p className="text-sm">{formData.target || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                โซน:
                            </h4>
                            <p className="text-sm">{formData.zone || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ขอบเขต:
                            </h4>
                            <p className="text-sm">{formData.scope || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                การติดตาม:
                            </h4>
                            <p className="text-sm">
                                {formData.monitoring || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                คู่ธุรกิจ:
                            </h4>
                            <p className="text-sm">{formData.partner || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วันที่เริ่มต้น:
                            </h4>
                            <p className="text-sm">
                                {formData.datestart || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วันที่สิ้นสุด:
                            </h4>
                            <p className="text-sm">{formData.dateend || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ผู้สร้าง:
                            </h4>
                            <p className="text-sm">{formData.author || "-"}</p>
                        </div>
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
