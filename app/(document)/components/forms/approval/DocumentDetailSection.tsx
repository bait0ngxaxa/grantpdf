import { FileText } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type ApprovalData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface DocumentDetailSectionProps {
    formData: ApprovalData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    errors: Partial<Record<keyof ApprovalData, string>>;
}

export function DocumentDetailSection({
    formData,
    handleChange,
    errors,
}: DocumentDetailSectionProps) {
    return (
        <FormSection
            title="รายละเอียดหนังสือ"
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            headerBorderColor="border-blue-300"
            icon={<FileText className="w-5 h-5 text-blue-600" />}
        >
            <div className="space-y-6">
                <FormField
                    label="เรื่อง"
                    name="topicdetail"
                    placeholder="หัวข้อหนังสือ"
                    value={formData.topicdetail}
                    onChange={handleChange}
                    error={errors.topicdetail}
                    required
                />
                <FormField
                    label="เรียน"
                    name="todetail"
                    placeholder="ระบุผู้รับ"
                    value={formData.todetail}
                    onChange={handleChange}
                    error={errors.todetail}
                    required
                />
            </div>
        </FormSection>
    );
}
