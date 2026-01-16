import { ClipboardList } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type ApprovalData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface BasicInfoSectionProps {
    formData: ApprovalData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof ApprovalData, string>>;
}

export function BasicInfoSection({
    formData,
    handleChange,
    errors,
}: BasicInfoSectionProps) {
    return (
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
                    error={errors.projectName}
                    required
                />
                <FormField
                    label="เลขที่หนังสือ"
                    name="head"
                    placeholder="ระบุเลขที่หนังสือ"
                    value={formData.head}
                    onChange={handleChange}
                    error={errors.head}
                    required
                />
                <FormField
                    label="วันที่สร้างหนังสือ"
                    name="date"
                    placeholder="ระบุวัน เดือน ปีเช่น 14 สิงหาคม 2568"
                    value={formData.date}
                    onChange={handleChange}
                    error={errors.date}
                    required
                />
            </div>
        </FormSection>
    );
}
