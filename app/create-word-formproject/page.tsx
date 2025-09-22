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
import { useTitle } from "@/hook/useTitle";
import { WordLikeTextareaTOR } from "@/components/ui/WtextareaTOR";

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
    month: string;
}

export default function CreateFormProjectPage() {
    const { data: session } = useSession();
    const router = useRouter();

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
        month: "",
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

            const response = await fetch("/api/fill-formproject-template", {
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

    const downloadFileName = formData.projectName.endsWith(".docx")
        ? formData.projectName
        : `${formData.projectName}.docx`;

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
                        สร้างหนังสือข้อเสนอโครงการ
                    </h2>
                    <p className="text-center mt-2 text-blue-100">
                        กรุณากรอกข้อมูลให้ครบถ้วนเพื่อสร้างเอกสาร
                    </p>
                </div>
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* ข้อมูลโครงการ */}
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-300">
                                📋 ข้อมูลโครงการ
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ชื่อไฟล์{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="fileName"
                                        placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                                        className=" px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.fileName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ชื่อโครงการ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        name="projectName"
                                        placeholder="ระบุชื่อโครงการ"
                                        className=" px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.projectName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div >
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
                                <div >
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ที่อยู่{" "}
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
                                        อีเมล{" "}
                                        <span className="text-red-500">*</span>
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
                                        จำนวน(เดือน){" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        name="month"
                                        placeholder="ระบุตัวเลขจำนวนเดือน เช่น 12"
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        value={formData.month}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        งบประมาณทำสัญญา{" "}
                                        <span className="text-red-500">*</span>
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
                        </div>

                       

                        {/* รายละเอียดโครงการ */}
                        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 pb-2 border-b border-green-300">
                                📝 รายละเอียดโครงการ
                            </h3>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ที่มาและความสำคัญ{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="rationale"
                                        placeholder="เหตุผลความจำเป็นในการดำเนินโครงการ"
                                        className="w-full px-4 py-3 h-96 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.rationale}
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
                                        placeholder="วัตถุประสงค์ที่ 1"
                                        className="w-full px-4 py-3 h-20 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.objective}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Textarea
                                        name="objective2"
                                        placeholder="วัตถุประสงค์ที่ 2"
                                        className="w-full px-4 py-3 h-20 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.objective2}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <Textarea
                                        name="objective3"
                                        placeholder="วัตถุประสงค์ที่ 3"
                                        className="w-full px-4 py-3 h-20 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.objective3}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        กลุ่มเป้าหมาย{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="target"
                                        placeholder="กลุ่มเป้าหมายที่ต้องการบรรลุ"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.target}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        โซน{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="zone"
                                        placeholder="พื้นที่ดำเนินการ"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.zone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ขอบเขต{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="scope"
                                        placeholder="ขอบเขตการดำเนินงาน"
                                        className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.scope}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        การกำกับติดตามและประเมินผล{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="monitoring"
                                        placeholder="วิธีการติดตามและประเมินผล"
                                        className="w-full h-40 px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.monitoring}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        องค์กร ภาคี ร่วมงาน{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="partner"
                                        placeholder="หน่วยงานหรือบุคคลที่เกี่ยวข้อง"
                                        className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.partner}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        ประวัติผู้รับผิดชอบโครงการ
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Textarea
                                        name="author"
                                        placeholder=""
                                        className="w-full px-4 h-40 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors "
                                        value={formData.author}
                                        onChange={handleChange}
                                    />
                                </div>
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
                                วันที่เริ่มต้น - วันที่สิ้นสุด
                            </h4>
                            <p className="text-sm">
                                {formData.timeline || "-"}
                            </p>
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
