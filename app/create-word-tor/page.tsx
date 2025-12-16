"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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
    Target,
    BarChart,
    Plus,
    Trash2,
} from "lucide-react";

interface TORData {
    projectName: string;
    fileName: string;
    owner: string;
    address: string;
    email: string;
    tel: string;
    timeline: string;
    contractnumber: string;
    cost: string;
    topic1: string;
    objective1: string;
    objective2: string;
    objective3: string;
    target: string;
    zone: string;
    plan: string;
    projectmanage: string;
    partner: string;
    date: string;
}

interface ActivityData {
    activity: string;
    manager: string;
    evaluation2: string;
    duration: string;
}

export default function CreateTORPage() {
    const { data: session } = useSession();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [formData, setFormData] = useState<TORData>({
        projectName: "",
        fileName: "",
        date: "",
        owner: "",
        address: "",
        email: "",
        tel: "",
        timeline: "",
        contractnumber: "",
        cost: "",
        topic1: "",
        objective1: "",
        objective2: "",
        objective3: "",
        target: "",
        zone: "",
        plan: "",
        projectmanage: "",
        partner: "",
    });

    const [activities, setActivities] = useState<ActivityData[]>([
        { activity: "", manager: "", evaluation2: "", duration: "" },
    ]);

    // Signature unused in this form based on original code
    // const [signatureFile, setSignatureFile] = useState<File | null>(null);

    const [generatedFileUrl, setGeneratedFileUrl] = useState<string | null>(
        null
    );
    const [message, setMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    useTitle("สร้างเอกสาร TOR | ระบบจัดการเอกสาร");

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const addActivityRow = () => {
        setActivities([
            ...activities,
            { activity: "", manager: "", evaluation2: "", duration: "" },
        ]);
    };

    const removeActivityRow = (index: number) => {
        if (activities.length > 1) {
            setActivities(activities.filter((_, i) => i !== index));
        }
    };

    const updateActivity = (
        index: number,
        field: keyof ActivityData,
        value: string
    ) => {
        const updatedActivities = activities.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        );
        setActivities(updatedActivities);
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
                data.append(key, formData[key as keyof TORData]);
            });

            data.append("activities", JSON.stringify(activities));

            // Signature upload logic was commented out in original file, keeping it removed here.

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

            const response = await fetch("/api/fill-tor-template", {
                method: "POST",
                body: data,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success && result.downloadUrl) {
                    setGeneratedFileUrl(result.downloadUrl);
                    setMessage(
                        `สร้างเอกสาร TOR สำเร็จแล้ว! โครงการ: ${
                            result.project?.name || "ไม่ระบุ"
                        }`
                    );
                    setIsError(false);
                    setIsSuccessModalOpen(true);
                } else {
                    setMessage("ไม่สามารถสร้างเอกสาร TOR ได้");
                    setIsError(true);
                }
            } else {
                const errorText = await response.text();
                setMessage(
                    `เกิดข้อผิดพลาด: ${
                        errorText || "ไม่สามารถสร้างเอกสาร TOR ได้"
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

    const isDirty =
        Object.values(formData).some((value) => value !== "") ||
        activities.some(
            (row) =>
                row.activity !== "" ||
                row.manager !== "" ||
                row.evaluation2 !== "" ||
                row.duration !== ""
        );

    return (
        <PageLayout
            title="สร้างเอกสาร Terms of Reference (TOR)"
            subtitle="กรุณากรอกข้อมูลโครงการและกิจกรรมให้ครบถ้วน"
            isDirty={isDirty}
        >
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ข้อมูลพื้นฐาน */}
                <FormSection
                    title="ข้อมูลพื้นฐานโครงการ"
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
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.projectName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                วันที่จัดทำ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="date"
                                placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2566"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เลขที่สัญญา{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="contractnumber"
                                placeholder="ระบุเลขที่สัญญา"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.contractnumber}
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
                                name="owner"
                                placeholder="ระบุชื่อผู้รับผิดชอบ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.owner}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                สถานที่ติดต่อ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="address"
                                placeholder="ระบุสถานที่ติดต่อผู้รับผิดชอบ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.address}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                อีเมล <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="email"
                                placeholder="ระบุอีเมลผู้รับผิดชอบ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                เบอร์โทร <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="tel"
                                placeholder="ระบุเบอร์โทรผู้รับผิดชอบ"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.tel}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                ระยะเวลาโครงการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                name="timeline"
                                placeholder="เช่น 1 มกราคม 2566 - 31 ธันวาคม 2566"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                placeholder="เช่น 500000 บาท (ห้าแสนบาทถ้วน)"
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                    headerBorderColor="border-blue-300"
                    icon={<FileText className="w-5 h-5 text-blue-600" />}
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                หลักการและเหตุผล{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="topic1"
                                placeholder="หลักการและเหตุผล"
                                className="w-full px-4 py-3 h-96 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.topic1}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                วัตถุประสงค์{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="objective1"
                                placeholder="วัตถุประสงค์โครงการ"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.objective1}
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
                                placeholder="กลุ่มเป้าหมายของโครงการ"
                                className="w-full px-4 py-3 border h-40 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.target}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* ขอบเขตและการจัดการ */}
                <FormSection
                    title="ขอบเขตและการจัดการ"
                    bgColor="bg-yellow-50"
                    borderColor="border-yellow-200"
                    headerBorderColor="border-yellow-300"
                    icon={<Target className="w-5 h-5 text-yellow-600" />}
                >
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                พื้นที่/เขต{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="zone"
                                placeholder="พื้นที่หรือเขตดำเนินการ"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                value={formData.zone}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                แผนการดำเนินงาน{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="plan"
                                placeholder="แผนการดำเนินงานโครงการ"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors "
                                value={formData.plan}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                การจัดการโครงการ{" "}
                                <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                name="projectmanage"
                                placeholder="วิธีการจัดการและบริหารโครงการ"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors "
                                value={formData.projectmanage}
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
                                placeholder="องค์กร ภาค ร่วมงาน"
                                className="w-full px-4 py-3 h-40 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors "
                                value={formData.partner}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </FormSection>

                {/* ตารางกิจกรรม */}
                <FormSection
                    title="การกำกับติดตามและประเมินผล"
                    bgColor="bg-indigo-50"
                    borderColor="border-indigo-200"
                    headerBorderColor="border-indigo-300"
                    icon={<BarChart className="w-5 h-5 text-indigo-600" />}
                >
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="hidden lg:grid grid-cols-4 gap-2 p-3 bg-indigo-100 rounded-t-lg font-semibold text-sm text-indigo-900">
                            <div>กิจกรรม</div>
                            <div>ผู้ติดตามโครงการ</div>
                            <div>วิธีการประเมินผล</div>
                            <div>ระยะเวลา</div>
                        </div>

                        {/* Dynamic Rows */}
                        {activities.map((activity, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-1 lg:grid-cols-4 gap-2 p-4 border border-slate-200 rounded-lg bg-white shadow-sm relative"
                            >
                                <div className="lg:contents">
                                    <label className="lg:hidden block text-sm font-medium text-slate-700 mb-1">
                                        กิจกรรม
                                    </label>
                                    <Textarea
                                        placeholder="กิจกรรม"
                                        value={activity.activity}
                                        onChange={(e) =>
                                            updateActivity(
                                                index,
                                                "activity",
                                                e.target.value
                                            )
                                        }
                                        className="text-sm h-32 lg:h-40"
                                    />
                                </div>
                                <div className="lg:contents">
                                    <label className="lg:hidden block text-sm font-medium text-slate-700 mt-2 mb-1">
                                        ผู้ติดตามโครงการ
                                    </label>
                                    <Textarea
                                        placeholder="ผู้ติดตามโครงการ"
                                        value={activity.manager}
                                        onChange={(e) =>
                                            updateActivity(
                                                index,
                                                "manager",
                                                e.target.value
                                            )
                                        }
                                        className="text-sm h-32 lg:h-40"
                                    />
                                </div>
                                <div className="lg:contents">
                                    <label className="lg:hidden block text-sm font-medium text-slate-700 mt-2 mb-1">
                                        วิธีการประเมินผล
                                    </label>
                                    <Textarea
                                        placeholder="วิธีการประเมินผล"
                                        value={activity.evaluation2}
                                        onChange={(e) =>
                                            updateActivity(
                                                index,
                                                "evaluation2",
                                                e.target.value
                                            )
                                        }
                                        className="text-sm h-32 lg:h-40"
                                    />
                                </div>
                                <div className="relative">
                                    <label className="lg:hidden block text-sm font-medium text-slate-700 mt-2 mb-1">
                                        ระยะเวลา
                                    </label>
                                    <Textarea
                                        placeholder="ระยะเวลา"
                                        value={activity.duration}
                                        onChange={(e) =>
                                            updateActivity(
                                                index,
                                                "duration",
                                                e.target.value
                                            )
                                        }
                                        className="text-sm h-32 lg:h-40 mb-8 lg:mb-0"
                                    />
                                    {activities.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                removeActivityRow(index)
                                            }
                                            variant="ghost"
                                            size="sm"
                                            className="absolute bottom-2 right-2 lg:top-1 lg:right-1 lg:bottom-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="lg:hidden ml-1">
                                                ลบ
                                            </span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add Row Button */}
                        <Button
                            type="button"
                            onClick={addActivityRow}
                            variant="outline"
                            className="w-full border-dashed border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 py-4 h-auto"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            เพิ่มแถวกิจกรรม
                        </Button>
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
                                ชื่อโครงการ:
                            </h4>
                            <p className="text-sm">
                                {formData.projectName || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วันที่:
                            </h4>
                            <p className="text-sm">{formData.date || "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เลขที่สัญญา:
                            </h4>
                            <p className="text-sm">
                                {formData.contractnumber || "-"}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ผู้รับผิดชอบ:
                            </h4>
                            <p className="text-sm">{formData.owner || "-"}</p>
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
                                กำหนดเวลา:
                            </h4>
                            <p className="text-sm">
                                {formData.timeline || "-"}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            หัวข้อ/เรื่อง:
                        </h4>
                        <p className="text-sm">{formData.topic1 || "-"}</p>
                    </div>

                    <div>
                        <h4 className="font-semibold text-sm text-gray-600">
                            วัตถุประสงค์
                        </h4>
                        <p className="text-sm whitespace-pre-wrap">
                            {formData.objective1 || "-"}
                        </p>
                    </div>

                    {formData.objective2 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วัตถุประสงค์ที่ 2:
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                                {formData.objective2}
                            </p>
                        </div>
                    )}

                    {formData.objective3 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                วัตถุประสงค์ที่ 3:
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                                {formData.objective3}
                            </p>
                        </div>
                    )}

                    {/* แสดงตารางกิจกรรม */}
                    {activities.length > 0 &&
                        activities.some((a) => a.activity) && (
                            <div>
                                <h4 className="font-semibold text-sm text-gray-600 mb-2">
                                    ตารางกิจกรรม:
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-xs border border-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-2 py-1 border">
                                                    กิจกรรม
                                                </th>
                                                <th className="px-2 py-1 border">
                                                    ผู้รับผิดชอบ
                                                </th>
                                                <th className="px-2 py-1 border">
                                                    ระยะเวลา
                                                </th>
                                                <th className="px-2 py-1 border">
                                                    งบประมาณ
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activities.map(
                                                (activity, index) => (
                                                    <tr key={index}>
                                                        <td className="px-2 py-1 border">
                                                            {activity.activity ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-2 py-1 border">
                                                            {activity.manager ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-2 py-1 border">
                                                            {activity.evaluation2 ||
                                                                "-"}
                                                        </td>
                                                        <td className="px-2 py-1 border">
                                                            {activity.duration ||
                                                                "-"}
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                เบอร์โทรศัพท์:
                            </h4>
                            <p className="text-sm">{formData.tel || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                อีเมล:
                            </h4>
                            <p className="text-sm">{formData.email || "-"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                กลุ่มเป้าหมาย:
                            </h4>
                            <p className="text-sm">{formData.target || "-"}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                ค่าใช้จ่าย:
                            </h4>
                            <p className="text-sm">{formData.cost || "-"}</p>
                        </div>
                    </div>

                    {formData.zone && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                พื้นที่/เขต:
                            </h4>
                            <p className="text-sm">{formData.zone}</p>
                        </div>
                    )}

                    {formData.plan && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                แผนการดำเนินงาน:
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                                {formData.plan}
                            </p>
                        </div>
                    )}

                    {formData.projectmanage && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-600">
                                การจัดการโครงการ:
                            </h4>
                            <p className="text-sm whitespace-pre-wrap">
                                {formData.projectmanage}
                            </p>
                        </div>
                    )}
                </div>
            </PreviewModal>

            {/* Success Modal */}
            <CreateDocSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                fileName={formData.fileName}
                downloadUrl={generatedFileUrl}
                documentType="เอกสาร TOR"
            />
        </PageLayout>
    );
}
