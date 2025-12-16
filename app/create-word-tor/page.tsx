"use client";

import { useState, FormEvent, ChangeEvent, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

    const isDirty =
        Object.values(formData).some((value) => value !== "") ||
        activities.some(
            (row) =>
                row.activity !== "" ||
                row.manager !== "" ||
                row.evaluation2 !== "" ||
                row.duration !== ""
        );

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
                            label="วันที่จัดทำ"
                            name="date"
                            placeholder="ระบุวัน เดือน ปี เช่น 1 มกราคม 2566"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เลขที่สัญญา"
                            name="contractnumber"
                            placeholder="ระบุเลขที่สัญญา"
                            value={formData.contractnumber}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ผู้รับผิดชอบ"
                            name="owner"
                            placeholder="ระบุชื่อผู้รับผิดชอบ"
                            value={formData.owner}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="สถานที่ติดต่อ"
                            name="address"
                            placeholder="ระบุสถานที่ติดต่อผู้รับผิดชอบ"
                            value={formData.address}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="อีเมล"
                            name="email"
                            placeholder="ระบุอีเมลผู้รับผิดชอบ"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เบอร์โทร"
                            name="tel"
                            placeholder="ระบุเบอร์โทรผู้รับผิดชอบ"
                            value={formData.tel}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="ระยะเวลาโครงการ"
                            name="timeline"
                            placeholder="เช่น 1 มกราคม 2566 - 31 ธันวาคม 2566"
                            value={formData.timeline}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="งบประมาณ"
                            name="cost"
                            placeholder="เช่น 500000 บาท (ห้าแสนบาทถ้วน)"
                            value={formData.cost}
                            onChange={handleChange}
                            required
                        />
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
                        <FormField
                            label="หลักการและเหตุผล"
                            name="topic1"
                            type="textarea"
                            placeholder="หลักการและเหตุผล"
                            value={formData.topic1}
                            onChange={handleChange}
                            rows={12}
                            className="h-96"
                        />
                        <FormField
                            label="วัตถุประสงค์"
                            name="objective1"
                            type="textarea"
                            placeholder="วัตถุประสงค์โครงการ"
                            value={formData.objective1}
                            onChange={handleChange}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="กลุ่มเป้าหมาย"
                            name="target"
                            type="textarea"
                            placeholder="กลุ่มเป้าหมายของโครงการ"
                            value={formData.target}
                            onChange={handleChange}
                            rows={6}
                            className="h-40"
                        />
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
                        <FormField
                            label="พื้นที่/เขต"
                            name="zone"
                            type="textarea"
                            placeholder="พื้นที่หรือเขตดำเนินการ"
                            value={formData.zone}
                            onChange={handleChange}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="แผนการดำเนินงาน"
                            name="plan"
                            type="textarea"
                            placeholder="แผนการดำเนินงานโครงการ"
                            value={formData.plan}
                            onChange={handleChange}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="การจัดการโครงการ"
                            name="projectmanage"
                            type="textarea"
                            placeholder="วิธีการจัดการและบริหารโครงการ"
                            value={formData.projectmanage}
                            onChange={handleChange}
                            rows={6}
                            className="h-40"
                        />
                        <FormField
                            label="องค์กร ภาคี ร่วมงาน"
                            name="partner"
                            type="textarea"
                            placeholder="องค์กร ภาค ร่วมงาน"
                            value={formData.partner}
                            onChange={handleChange}
                            rows={6}
                            className="h-40"
                        />
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
                        label="ชื่อโครงการ"
                        value={formData.projectName}
                    />
                    <PreviewField label="วันที่" value={formData.date} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField
                        label="เลขที่สัญญา"
                        value={formData.contractnumber}
                    />
                    <PreviewField label="ผู้รับผิดชอบ" value={formData.owner} />
                </PreviewGrid>

                <PreviewGrid>
                    <PreviewField label="ที่อยู่" value={formData.address} />
                    <PreviewField label="กำหนดเวลา" value={formData.timeline} />
                </PreviewGrid>

                <PreviewField label="หัวข้อ/เรื่อง">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.topic1 || "-"}
                    </p>
                </PreviewField>

                <PreviewField label="วัตถุประสงค์">
                    <p className="text-sm whitespace-pre-wrap">
                        {formData.objective1 || "-"}
                    </p>
                </PreviewField>

                {/* แสดงตารางกิจกรรม */}
                {activities.length > 0 &&
                    activities.some((a) => a.activity) && (
                        <PreviewField label="ตารางกิจกรรม">
                            <div className="overflow-x-auto mt-2">
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
                                                วิธีการประเมิน
                                            </th>
                                            <th className="px-2 py-1 border">
                                                ระยะเวลา
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activities.map((activity, index) => (
                                            <tr key={index}>
                                                <td className="px-2 py-1 border">
                                                    {activity.activity || "-"}
                                                </td>
                                                <td className="px-2 py-1 border">
                                                    {activity.manager || "-"}
                                                </td>
                                                <td className="px-2 py-1 border">
                                                    {activity.evaluation2 ||
                                                        "-"}
                                                </td>
                                                <td className="px-2 py-1 border">
                                                    {activity.duration || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
                documentType="เอกสาร TOR"
            />
        </PageLayout>
    );
}
