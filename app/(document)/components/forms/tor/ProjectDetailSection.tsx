import { FileText } from "lucide-react";
import { FormField, FormSection } from "@/app/(document)/components";
import { type TORData } from "@/config/initialData";
import { type ChangeEvent } from "react";

interface ProjectDetailSectionProps {
    formData: TORData;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => void;
    errors: Partial<Record<keyof TORData, string>>;
}

export function ProjectDetailSection({
    formData,
    handleChange,
    errors,
}: ProjectDetailSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="รายละเอียดโครงการ"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            borderColor="border-blue-200 dark:border-blue-900/50"
            headerBorderColor="border-blue-300 dark:border-blue-800"
            icon={
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            }
        >
            <div className="space-y-6">
                <FormField
                    label="หลักการและเหตุผล"
                    name="topic1"
                    type="textarea"
                    placeholder="หลักการและเหตุผล"
                    value={formData.topic1}
                    onChange={handleChange}
                    error={errors.topic1}
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
                    error={errors.objective1}
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
                    error={errors.target}
                    rows={6}
                    className="h-40"
                />
            </div>
        </FormSection>
    );
}
