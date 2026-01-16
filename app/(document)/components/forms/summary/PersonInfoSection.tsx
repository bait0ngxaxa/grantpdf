import { Users } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type SummaryData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface PersonInfoSectionProps {
    formData: SummaryData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof SummaryData, string>>;
}

export function PersonInfoSection({
    formData,
    handleChange,
    errors,
}: PersonInfoSectionProps) {
    return (
        <FormSection
            title="ข้อมูลผู้เกี่ยวข้อง"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            headerBorderColor="border-blue-300"
            icon={<Users className="w-5 h-5 text-blue-600" />}
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                    label="ผู้เสนอโครงการ"
                    name="projectOwner"
                    placeholder="ระบุผู้เสนอโครงการ"
                    value={formData.projectOwner}
                    onChange={handleChange}
                    error={errors.projectOwner}
                />
                <FormField
                    label="ผู้ทบทวนโครงการ"
                    name="projectReview"
                    placeholder="ระบุผู้ทบทวนโครงการ"
                    value={formData.projectReview}
                    onChange={handleChange}
                    error={errors.projectReview}
                />
                <FormField
                    label="ผู้ประสานงาน"
                    name="coordinator"
                    placeholder="ระบุผู้ประสานงาน"
                    value={formData.coordinator}
                    onChange={handleChange}
                    error={errors.coordinator}
                />
            </div>
        </FormSection>
    );
}
