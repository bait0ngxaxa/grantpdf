import { Target } from "lucide-react";
import { RichTextField } from "@/app/(document)/components/RichTextField";
import { FormSection } from "@/app/(document)/components/FormSection";
import { type TORData } from "@/config/initialData";
import { DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH } from "@/lib/validation/constants";

interface ScopeSectionProps {
    formData: TORData;
    handleRichTextChange: (name: string, value: string) => void;
    errors: Partial<Record<keyof TORData, string>>;
}

export function ScopeSection({
    formData,
    handleRichTextChange,
    errors,
}: ScopeSectionProps): React.JSX.Element {
    return (
        <FormSection
            title="ขอบเขตและการจัดการ"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            borderColor="border-yellow-200 dark:border-yellow-900/50"
            headerBorderColor="border-yellow-300 dark:border-yellow-800"
            icon={
                <Target className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            }
        >
            <div className="space-y-6">
                <RichTextField
                    label="พื้นที่/เขต"
                    name="zone"
                    placeholder="พื้นที่หรือเขตดำเนินการ"
                    value={formData.zone}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.zone}
                    className="h-40"
                />
                <RichTextField
                    label="แผนการดำเนินงาน"
                    name="plan"
                    placeholder="แผนการดำเนินงานโครงการ"
                    value={formData.plan}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.plan}
                    className="h-40"
                />
                <RichTextField
                    label="การจัดการโครงการ"
                    name="projectmanage"
                    placeholder="วิธีการจัดการและบริหารโครงการ"
                    value={formData.projectmanage}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    error={errors.projectmanage}
                    className="h-40"
                />
                <RichTextField
                    label="องค์กร ภาคี ร่วมงาน"
                    name="partner"
                    placeholder="องค์กร ภาค ร่วมงาน"
                    value={formData.partner}
                    error={errors.partner}
                    onValueChange={handleRichTextChange}
                    maxLength={DOCUMENT_TEXTAREA_MEDIUM_MAX_LENGTH}
                    className="h-40"
                />
            </div>
        </FormSection>
    );
}
