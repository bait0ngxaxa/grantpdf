"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CreateDocSuccessModal } from "@/components/ui/CreateDocSuccessModal";
import { useTitle } from "@/hooks/useTitle";
import { usePreventNavigation } from "@/hooks/usePreventNavigation";
import { PageLayout } from "@/components/document-form/PageLayout";
import { FormSection } from "@/components/document-form/FormSection";
import { FormActions } from "@/components/document-form/FormActions";
import { PreviewModal } from "@/components/document-form/PreviewModal";
import { FormField } from "@/components/document-form/FormField";
import { ErrorAlert } from "@/components/document-form/ErrorAlert";
import { LoadingState } from "@/components/document-form/LoadingState";
import { useDocumentForm } from "@/components/document-form/useDocumentForm";
import { usePreviewModal } from "@/components/document-form/usePreviewModal";
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
import {
    type TORData,
    type ActivityData,
    initialTORData,
    initialActivity,
} from "@/config/initialData";

export default function CreateTORPage() {
    useTitle("สร้างเอกสาร TOR | ระบบจัดการเอกสาร");

    const [activities, setActivities] = useState<ActivityData[]>([
        { ...initialActivity },
    ]);

    const { isPreviewOpen, openPreview, closePreview, confirmPreview } =
        usePreviewModal();

    const {
        formData,
        handleChange,
        handleSubmit,
        isSubmitting,
        message,
        isError,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        generatedFileUrl,
        isClient,
    } = useDocumentForm<TORData>({
        initialData: initialTORData,
        apiEndpoint: "/api/fill-tor-template",
        documentType: "TOR",
        prepareFormData: (_data, formDataObj) => {
            formDataObj.append("activities", JSON.stringify(activities));
        },
    });

    // Activity handlers
    const addActivityRow = () => {
        setActivities([...activities, { ...initialActivity }]);
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

    const isDirty =
        Object.values(formData).some((value) => value !== "") ||
        activities.some(
            (row) =>
                row.activity !== "" ||
                row.manager !== "" ||
                row.evaluation2 !== "" ||
                row.duration !== ""
        );

    const router = useRouter();
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const { allowNavigation } = usePreventNavigation({
        isDirty,
        onNavigationAttempt: () => setIsExitModalOpen(true),
    });

    const handleConfirmExit = () => {
        allowNavigation();
        setIsExitModalOpen(false);
        setTimeout(() => {
            router.push("/createdocs");
        }, 100);
    };

    if (!isClient) {
        return <LoadingState />;
    }

    return (
        <PageLayout
            title="สร้างเอกสาร Terms of Reference (TOR)"
            subtitle="กรุณากรอกข้อมูลโครงการและกิจกรรมให้ครบถ้วน"
            isDirty={isDirty}
            isExitModalOpen={isExitModalOpen}
            setIsExitModalOpen={setIsExitModalOpen}
            onConfirmExit={handleConfirmExit}
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
                            type="email"
                            placeholder="ระบุอีเมลผู้รับผิดชอบ"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <FormField
                            label="เบอร์โทร"
                            name="tel"
                            type="number"
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
                    onPreview={openPreview}
                    isSubmitting={isSubmitting}
                />
            </form>

            <ErrorAlert message={message} isError={isError} />

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={closePreview}
                onConfirm={confirmPreview}
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
                onRedirect={allowNavigation}
            />
        </PageLayout>
    );
}
