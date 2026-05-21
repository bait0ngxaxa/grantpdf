import { FileText } from "lucide-react";
import { RichTextField } from "@/app/(document)/components/RichTextField";
import { FormSection } from "@/app/(document)/components/FormSection";
import { type TORData } from "@/config/initialData";
import {
    DOCUMENT_TEXTAREA_MAX_LENGTH,
    DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH,
} from "@/lib/validation/constants";

interface ProjectDetailSectionProps {
    formData: TORData;
    handleRichTextChange: (name: string, value: string) => void;
    errors: Partial<Record<keyof TORData, string>>;
}

export function ProjectDetailSection({
    formData,
    handleRichTextChange,
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
                <RichTextField
                    label="หลักการและเหตุผล"
                    name="topic1"
                    placeholder="หลักการและเหตุผล"
                    value={formData.topic1}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MAX_LENGTH}
                    error={errors.topic1}
                    className="h-96"
                />
                <RichTextField
                    label="วัตถุประสงค์"
                    name="objective1"
                    placeholder="วัตถุประสงค์โครงการ"
                    value={formData.objective1}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.objective1}
                    className="h-40"
                />
                <RichTextField
                    label="กลุ่มเป้าหมาย"
                    name="target"
                    placeholder="กลุ่มเป้าหมายของโครงการ"
                    value={formData.target}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.target}
                    className="h-40"
                />
            </div>
        </FormSection>
    );
}
