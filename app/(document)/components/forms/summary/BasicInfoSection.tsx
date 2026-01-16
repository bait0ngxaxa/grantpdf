import { ClipboardList } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type SummaryData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface BasicInfoSectionProps {
    formData: SummaryData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof SummaryData, string>>;
}

export function BasicInfoSection({
    formData,
    handleChange,
    errors,
}: BasicInfoSectionProps) {
    return (
        <FormSection
            title="ข้อมูลโครงการ"
            icon={<ClipboardList className="w-5 h-5 text-slate-600" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                    label="ชื่อไฟล์"
                    name="fileName"
                    placeholder="ระบุชื่อไฟล์ที่ต้องการบันทึก"
                    value={formData.fileName}
                    onChange={handleChange}
                    error={errors.fileName}
                    required
                />
                <FormField
                    label="ชื่อโครงการ"
                    name="projectName"
                    placeholder="ระบุชื่อโครงการ"
                    value={formData.projectName}
                    onChange={handleChange}
                    error={errors.projectName}
                    required
                />
                <FormField
                    label="รหัสชุดโครงการ"
                    name="projectCode"
                    placeholder="ระบุรหัสชุดโครงการ"
                    value={formData.projectCode}
                    onChange={handleChange}
                    error={errors.projectCode}
                />
                <FormField
                    label="รหัสภายใต้กิจกรรม"
                    name="projectActivity"
                    placeholder="ระบุรหัสภายใต้กิจกรรม"
                    value={formData.projectActivity}
                    onChange={handleChange}
                    error={errors.projectActivity}
                />
                <FormField
                    label="เลขที่สัญญา"
                    name="contractNumber"
                    placeholder="ระบุเลขที่สัญญา"
                    value={formData.contractNumber}
                    onChange={handleChange}
                    error={errors.contractNumber}
                />
                <FormField
                    label="หน่วยงานที่เสนอโครงการ"
                    name="organize"
                    placeholder="ระบุหน่วยงานที่เสนอโครงการ"
                    value={formData.organize}
                    onChange={handleChange}
                    error={errors.organize}
                />
                <FormField
                    label="เลขที่ มสช น."
                    name="projectNhf"
                    placeholder="ระบุเลขที่ มสช น."
                    value={formData.projectNhf}
                    onChange={handleChange}
                    error={errors.projectNhf}
                />
                <FormField
                    label="ชุดโครงการ"
                    name="projectCo"
                    placeholder="ระบุชุดโครงการ"
                    value={formData.projectCo}
                    onChange={handleChange}
                    error={errors.projectCo}
                />
                <FormField
                    label="ระยะเวลาดำเนินการ (เดือน)"
                    name="month"
                    type="number"
                    placeholder="ระบุจำนวนเดือน"
                    value={formData.month}
                    onChange={handleChange}
                    error={errors.month}
                />
                <FormField
                    label="ระยะเวลา"
                    name="timeline"
                    placeholder="ระบุระยะเวลา เช่น 1มกราคม 2568 - 31กันยายน 2568"
                    value={formData.timeline}
                    onChange={handleChange}
                    error={errors.timeline}
                />
            </div>
        </FormSection>
    );
}
